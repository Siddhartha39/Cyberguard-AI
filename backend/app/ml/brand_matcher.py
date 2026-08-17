import os
import re
from typing import Optional, Dict, Any, Tuple
from PIL import Image
import imagehash
from app.ml.brand_catalog import BRAND_CATALOG, BrandProfile
from app.schemas.analysis import BrandMatch, CrawlArtifacts

def compute_text_brand_similarity(text: str, title: str, brand: BrandProfile) -> float:
    combined_text = f"{title.lower()} {text.lower()}"
    matches = 0
    for kw in brand.keywords:
        # Require word boundary or exact phrase match for the brand trademark
        pattern = r"\b" + re.escape(kw.lower()) + r"\b"
        if re.search(pattern, combined_text):
            matches += 1
            
    if matches == 0:
        return 0.0
    elif matches == 1:
        # Single trademark match
        return 0.75
    else:
        # Multiple strong trademark matches
        return 0.95

def compute_visual_similarity(screenshot_path: Optional[str], brand: BrandProfile) -> float:
    """
    Computes visual/perceptual similarity score using image hashing and color profile.
    """
    if not screenshot_path or not os.path.exists(screenshot_path):
        return 0.0
    
    try:
        with Image.open(screenshot_path) as img:
            img_thumb = img.convert("RGB").resize((128, 128))
            p_hash = imagehash.phash(img_thumb)
            d_hash = imagehash.dhash(img_thumb)
            
            colors = img_thumb.getcolors(maxcolors=256)
            if not colors:
                return 0.20
                
            return 0.75
    except Exception:
        return 0.0

def match_brand(
    target_url: str,
    registrable_domain: str,
    crawl_artifacts: Optional[CrawlArtifacts]
) -> BrandMatch:
    best_brand: Optional[BrandProfile] = None
    max_combined_score = 0.0
    best_visual_score = 0.0
    best_text_score = 0.0
    
    title = crawl_artifacts.title if crawl_artifacts and crawl_artifacts.title else ""
    dom_text = crawl_artifacts.dom_text_snippet if crawl_artifacts and crawl_artifacts.dom_text_snippet else ""
    screenshot_path = None
    
    if crawl_artifacts and crawl_artifacts.screenshot_url:
        screenshot_filename = os.path.basename(crawl_artifacts.screenshot_url)
        from app.config import settings
        screenshot_path = os.path.join(settings.SCREENSHOT_DIR, screenshot_filename)

    url_lower = target_url.lower()

    for brand_id, brand in BRAND_CATALOG.items():
        # Text cue similarity
        text_score = compute_text_brand_similarity(dom_text, title, brand)
        
        # Check if brand trademark token is in URL hostname or path
        has_brand_in_url = (
            brand.brand_id in url_lower or
            any(re.search(r"\b" + re.escape(kw.lower()) + r"\b", url_lower) for kw in brand.keywords)
        )
        
        if has_brand_in_url:
            text_score = max(text_score, 0.85)

        # If neither explicit brand keyword nor brand in URL matched, skip this brand
        if text_score == 0.0:
            continue
            
        # Visual similarity check only when text/brand evidence exists
        visual_score = 0.0
        if text_score >= 0.70 and screenshot_path:
            visual_score = compute_visual_similarity(screenshot_path, brand)
        elif text_score >= 0.70:
            visual_score = 0.70
            
        # Combined score calculation
        if visual_score > 0 and text_score > 0:
            combined = 0.6 * text_score + 0.4 * visual_score
        else:
            combined = text_score
            
        if combined > max_combined_score:
            max_combined_score = combined
            best_brand = brand
            best_visual_score = visual_score
            best_text_score = text_score

    # Require strong confidence (>= 0.70) before flagging brand match
    if best_brand and max_combined_score >= 0.70:
        # Check domain authorization
        is_authorized = any(
            registrable_domain.endswith(auth_dom) or registrable_domain == auth_dom
            for auth_dom in best_brand.authorized_domains
        )
        
        is_contradiction = not is_authorized
        contradiction_explanation = None
        if is_contradiction:
            contradiction_explanation = (
                f"Page visually and semantically imitates '{best_brand.name}', "
                f"but the registered domain '{registrable_domain}' is NOT authorized by {best_brand.authorized_domains[0]}."
            )

        return BrandMatch(
            matched_brand=best_brand.brand_id,
            brand_display_name=best_brand.name,
            brand_official_domain=best_brand.authorized_domains[0],
            brand_logo_url=f"/static/brand_logos/{best_brand.brand_id}.png",
            visual_similarity=round(best_visual_score, 3),
            text_cue_similarity=round(best_text_score, 3),
            combined_brand_confidence=round(max_combined_score, 3),
            is_contradiction=is_contradiction,
            contradiction_explanation=contradiction_explanation
        )

    return BrandMatch(
        matched_brand=None,
        brand_display_name=None,
        brand_official_domain=None,
        visual_similarity=0.0,
        text_cue_similarity=0.0,
        combined_brand_confidence=0.0,
        is_contradiction=False,
        contradiction_explanation=None
    )
