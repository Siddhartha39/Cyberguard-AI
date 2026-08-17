import math
import re
from urllib.parse import urlparse
from typing import Dict, Any, Tuple
import tldextract

# Use bundled offline snapshot so extractor is instantaneous and offline-safe
extractor = tldextract.TLDExtract(suffix_list_urls=())

SUSPICIOUS_TLDS = {
    "xyz", "top", "tk", "ml", "ga", "cf", "gq", "buzz", "club", "work",
    "click", "link", "guru", "live", "icu", "site", "online", "fit", "rest"
}

SECURITY_KEYWORDS = [
    "login", "signin", "verify", "verification", "account", "update",
    "secure", "banking", "wallet", "support", "auth", "confirm",
    "password", "recovery", "service", "billing", "portal", "security",
    "suspended", "unlock", "validation", "authenticate", "identity"
]

TARGET_BRAND_KEYWORDS = [
    "paypal", "apple", "microsoft", "google", "amazon", "netflix",
    "chase", "wellsfargo", "bankofamerica", "binance", "coinbase",
    "metamask", "steam", "facebook", "instagram", "whatsapp", "dropbox"
]

def calculate_shannon_entropy(text: str) -> float:
    if not text:
        return 0.0
    freq: Dict[str, int] = {}
    for c in text:
        freq[c] = freq.get(c, 0) + 1
    entropy = 0.0
    length = len(text)
    for count in freq.values():
        p = count / length
        entropy -= p * math.log2(p)
    return round(entropy, 4)

def normalize_url(raw_url: str) -> Tuple[str, str, str, str]:
    """
    Normalizes URL and returns (canonical_url, domain, subdomain, tld)
    """
    url = raw_url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url
    
    parsed = urlparse(url)
    ext = extractor(url)
    
    domain = ext.domain
    subdomain = ext.subdomain
    tld = ext.suffix
    registrable_domain = f"{domain}.{tld}" if domain and tld else parsed.netloc
    
    canonical_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
    if parsed.query:
        # Keep non-tracking parameters for structural analysis
        canonical_url += f"?{parsed.query}"
        
    return canonical_url, registrable_domain, subdomain, tld

def extract_lexical_features(url: str) -> Dict[str, Any]:
    canonical_url, registrable_domain, subdomain, tld = normalize_url(url)
    parsed = urlparse(canonical_url)
    
    netloc = parsed.netloc.lower()
    path = parsed.path.lower()
    query = parsed.query.lower()
    full_url = canonical_url.lower()
    
    # Check IP-address hostname
    ip_pattern = r"^(\d{1,3}\.){3}\d{1,3}(:\d+)?$"
    is_ip = 1.0 if re.match(ip_pattern, netloc) else 0.0
    
    # Punycode / IDN
    is_punycode = 1.0 if "xn--" in netloc else 0.0
    
    # Length metrics
    url_len = len(full_url)
    domain_len = len(registrable_domain)
    subdomain_len = len(subdomain) if subdomain else 0
    path_len = len(path)
    query_len = len(query)
    
    # Token count & Delimiters
    dot_count = full_url.count(".")
    hyphen_count_url = full_url.count("-")
    hyphen_count_domain = registrable_domain.count("-")
    underscore_count = full_url.count("_")
    slash_count = full_url.count("/")
    at_count = full_url.count("@")
    double_slash_in_path = 1.0 if "//" in path else 0.0
    
    # Subdomain depth
    subdomain_parts = subdomain.split(".") if subdomain else []
    subdomain_count = len([p for p in subdomain_parts if p])
    
    # Entropy metrics
    url_entropy = calculate_shannon_entropy(full_url)
    domain_entropy = calculate_shannon_entropy(registrable_domain)
    path_entropy = calculate_shannon_entropy(path)
    
    # Keyword analysis
    keyword_count = sum(1 for kw in SECURITY_KEYWORDS if kw in full_url)
    brand_in_subdomain = sum(1 for b in TARGET_BRAND_KEYWORDS if b in subdomain) if subdomain else 0
    brand_in_path = sum(1 for b in TARGET_BRAND_KEYWORDS if b in path)
    
    # TLD risk
    is_risky_tld = 1.0 if tld.lower() in SUSPICIOUS_TLDS else 0.0
    
    # Digits ratio
    digit_count = sum(c.isdigit() for c in full_url)
    digit_ratio = digit_count / max(1, url_len)
    
    # Hexadecimal strings / Random token cues
    hex_tokens = len(re.findall(r"[0-9a-f]{8,}", full_url))
    
    features = {
        "url_length": float(url_len),
        "domain_length": float(domain_len),
        "subdomain_length": float(subdomain_len),
        "path_length": float(path_len),
        "query_length": float(query_len),
        "dot_count": float(dot_count),
        "hyphen_count_url": float(hyphen_count_url),
        "hyphen_count_domain": float(hyphen_count_domain),
        "underscore_count": float(underscore_count),
        "slash_count": float(slash_count),
        "at_symbol_count": float(at_count),
        "double_slash_in_path": float(double_slash_in_path),
        "subdomain_count": float(subdomain_count),
        "url_entropy": float(url_entropy),
        "domain_entropy": float(domain_entropy),
        "path_entropy": float(path_entropy),
        "is_ip": float(is_ip),
        "is_punycode": float(is_punycode),
        "is_risky_tld": float(is_risky_tld),
        "security_keyword_count": float(keyword_count),
        "brand_in_subdomain": float(brand_in_subdomain),
        "brand_in_path": float(brand_in_path),
        "digit_ratio": float(digit_ratio),
        "hex_tokens": float(hex_tokens),
    }
    
    return {
        "canonical_url": canonical_url,
        "registrable_domain": registrable_domain,
        "subdomain": subdomain,
        "tld": tld,
        "features": features
    }
