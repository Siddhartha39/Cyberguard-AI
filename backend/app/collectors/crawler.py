import os
import time
import ipaddress
import hashlib
from urllib.parse import urlparse, urljoin
from typing import Optional, List, Dict, Any
from bs4 import BeautifulSoup
import httpx
from playwright.async_api import async_playwright
from app.config import settings
from app.schemas.analysis import CrawlArtifacts, FormDetail

PRIVATE_IP_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
]

def is_blocked_ip(hostname: str) -> bool:
    if hostname.lower() in ["localhost", "127.0.0.1", "0.0.0.0", "metadata.google.internal"]:
        return True
    try:
        ip = ipaddress.ip_address(hostname)
        return any(ip in net for net in PRIVATE_IP_NETWORKS)
    except ValueError:
        return False

def parse_html_content(html: str, base_url: str) -> Dict[str, Any]:
    soup = BeautifulSoup(html, "html.parser")
    title = soup.title.string.strip() if soup.title and soup.title.string else ""
    
    # Extract forms
    forms: List[FormDetail] = []
    has_password_field = False
    
    parsed_base = urlparse(base_url)
    base_host = parsed_base.netloc.lower()
    
    for form in soup.find_all("form"):
        action = form.get("action", "") or ""
        method = form.get("method", "GET").upper()
        
        resolved_action = urljoin(base_url, action)
        action_host = urlparse(resolved_action).netloc.lower()
        is_cross_origin = bool(action_host and action_host != base_host)
        
        input_types = []
        form_has_password = False
        form_has_card = False
        
        for inp in form.find_all(["input", "textarea", "select"]):
            itype = inp.get("type", "text").lower()
            iname = (inp.get("name", "") + " " + inp.get("id", "")).lower()
            input_types.append(itype)
            
            if itype == "password" or "pass" in iname or "pin" in iname:
                form_has_password = True
                has_password_field = True
            if "card" in iname or "cvv" in iname or "expir" in iname or "credit" in iname:
                form_has_card = True
                
        forms.append(FormDetail(
            action=resolved_action,
            method=method,
            input_types=input_types,
            has_password=form_has_password,
            has_credit_card=form_has_card,
            is_cross_origin=is_cross_origin
        ))
        
    # Check script behavior / eval / obfuscation
    scripts = soup.find_all("script")
    has_obfuscated_js = False
    external_domains = set()
    
    for script in scripts:
        src = script.get("src", "")
        if src:
            resolved_src = urljoin(base_url, src)
            shost = urlparse(resolved_src).netloc.lower()
            if shost and shost != base_host:
                external_domains.add(shost)
        else:
            scontent = script.string or ""
            if "eval(" in scontent or "unescape(" in scontent or "fromcharcode" in scontent.lower() or "document.write(atob" in scontent:
                has_obfuscated_js = True

    # Check external images and links
    for tag in soup.find_all(["img", "link"]):
        res_url = tag.get("src") or tag.get("href") or ""
        if res_url:
            rhost = urlparse(urljoin(base_url, res_url)).netloc.lower()
            if rhost and rhost != base_host:
                external_domains.add(rhost)

    # DOM text snippet for brand matching
    dom_text = " ".join(soup.stripped_strings)[:1500]

    return {
        "title": title,
        "dom_text_snippet": dom_text,
        "forms": forms,
        "has_password_field": has_password_field,
        "has_obfuscated_js": has_obfuscated_js,
        "external_resource_count": len(external_domains),
        "external_domains": list(external_domains)[:15]
    }

async def execute_safe_browser_crawl(url: str, case_id: str) -> CrawlArtifacts:
    start_time = time.time()
    parsed = urlparse(url)
    
    # SSRF Guard
    if settings.BLOCK_PRIVATE_IPS and is_blocked_ip(parsed.hostname or ""):
        return CrawlArtifacts(
            final_url=url,
            status_code=403,
            error_message="Access to internal/private IP space blocked by security sandbox.",
            crawl_time_ms=int((time.time() - start_time) * 1000)
        )
        
    screenshot_filename = f"{case_id}.png"
    screenshot_path = os.path.join(settings.SCREENSHOT_DIR, screenshot_filename)
    screenshot_rel_url = f"/api/screenshots/{screenshot_filename}"
    
    redirect_chain: List[str] = [url]
    
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=[
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                    "--disable-background-networking"
                ]
            )
            context = await browser.new_context(
                viewport={"width": 1280, "height": 800},
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                ignore_https_errors=True
            )
            page = await context.new_page()
            
            # Record redirects
            def on_response(response):
                if response.status in [301, 302, 303, 307, 308]:
                    loc = response.headers.get("location")
                    if loc and loc not in redirect_chain:
                        redirect_chain.append(loc)

            page.on("response", on_response)
            
            # Navigate with bounded timeout
            response = await page.goto(
                url,
                wait_until="domcontentloaded",
                timeout=settings.BROWSER_TIMEOUT_MS
            )
            
            # Wait brief moment for dynamic JS/renders
            await page.wait_for_timeout(1000)
            
            final_url = page.url
            if final_url not in redirect_chain:
                redirect_chain.append(final_url)
                
            status_code = response.status if response else 200
            html = await page.content()
            
            # Capture full page screenshot
            await page.screenshot(path=screenshot_path, full_page=False)
            await browser.close()
            
            # Compute hash of screenshot
            with open(screenshot_path, "rb") as f:
                s_bytes = f.read()
                screenshot_hash = hashlib.sha256(s_bytes).hexdigest()
                
            parsed_data = parse_html_content(html, final_url)
            
            return CrawlArtifacts(
                final_url=final_url,
                status_code=status_code,
                redirect_chain=redirect_chain,
                title=parsed_data["title"],
                dom_text_snippet=parsed_data["dom_text_snippet"],
                forms=parsed_data["forms"],
                has_password_field=parsed_data["has_password_field"],
                has_obfuscated_js=parsed_data["has_obfuscated_js"],
                external_resource_count=parsed_data["external_resource_count"],
                external_domains=parsed_data["external_domains"],
                screenshot_url=screenshot_rel_url,
                screenshot_hash=screenshot_hash,
                crawl_time_ms=int((time.time() - start_time) * 1000)
            )
            
    except Exception as e:
        # Fallback to HTTP fetch if browser worker is hindered
        return await fallback_http_crawl(url, case_id, start_time, str(e))

async def fallback_http_crawl(url: str, case_id: str, start_time: float, error_hint: str) -> CrawlArtifacts:
    try:
        async with httpx.AsyncClient(timeout=6.0, follow_redirects=True, verify=False) as client:
            resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0 SecurityScanner/1.0"})
            final_url = str(resp.url)
            redirect_chain = [str(r.url) for r in resp.history] + [final_url] if resp.history else [url, final_url]
            parsed_data = parse_html_content(resp.text, final_url)
            
            return CrawlArtifacts(
                final_url=final_url,
                status_code=resp.status_code,
                redirect_chain=redirect_chain,
                title=parsed_data["title"],
                dom_text_snippet=parsed_data["dom_text_snippet"],
                forms=parsed_data["forms"],
                has_password_field=parsed_data["has_password_field"],
                has_obfuscated_js=parsed_data["has_obfuscated_js"],
                external_resource_count=parsed_data["external_resource_count"],
                external_domains=parsed_data["external_domains"],
                screenshot_url=None,
                crawl_time_ms=int((time.time() - start_time) * 1000),
                error_message=f"Browser mode fallback: {error_hint}"
            )
    except Exception as fallback_err:
        return CrawlArtifacts(
            final_url=url,
            status_code=0,
            error_message=f"Crawl unreachable: {str(fallback_err)}",
            crawl_time_ms=int((time.time() - start_time) * 1000)
        )
