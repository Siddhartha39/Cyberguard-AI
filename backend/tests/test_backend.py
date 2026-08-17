from app.collectors.lexical import extract_lexical_features, calculate_shannon_entropy
from app.ml.classifier import triage_classifier
from app.ml.brand_catalog import BRAND_CATALOG
from app.ml.brand_matcher import match_brand
from app.ml.contradiction import evaluate_brand_contradiction
from app.schemas.analysis import DomainIntel, DNSRecords, CrawlArtifacts, FormDetail

def test_entropy():
    e_low = calculate_shannon_entropy("google.com")
    e_high = calculate_shannon_entropy("xn--80ak6aa92e.xyz/auth/q98f793hr0893hrf")
    assert e_high > e_low

def test_lexical_extraction():
    url = "https://login.paypal.verify-account.xyz/secure/update?id=123"
    res = extract_lexical_features(url)
    assert res["registrable_domain"] == "verify-account.xyz"
    assert res["subdomain"] == "login.paypal"
    assert res["features"]["is_risky_tld"] == 1.0
    assert res["features"]["brand_in_subdomain"] >= 1.0
    assert res["features"]["security_keyword_count"] >= 2.0

def test_triage_classifier():
    phish_url = "https://login-paypal-security-update.xyz/auth/signin"
    phish_res = extract_lexical_features(phish_url)
    triage_phish = triage_classifier.predict(phish_res["features"])
    assert triage_phish.is_suspicious is True
    assert triage_phish.lexical_score > 0.40

    legit_url = "https://www.wikipedia.org"
    legit_res = extract_lexical_features(legit_url)
    triage_legit = triage_classifier.predict(legit_res["features"])
    assert triage_legit.lexical_score < 0.35

def test_brand_contradiction():
    crawl_artifact = CrawlArtifacts(
        final_url="https://paypal-security-check.xyz/login",
        status_code=200,
        title="Log in to your PayPal account",
        dom_text_snippet="Enter your email to log in to PayPal balance and send money securely",
        forms=[FormDetail(action="https://paypal-security-check.xyz/post", method="POST", input_types=["text", "password"], has_password=True)],
        has_password_field=True
    )
    
    brand_match = match_brand(
        target_url="https://paypal-security-check.xyz/login",
        registrable_domain="paypal-security-check.xyz",
        crawl_artifacts=crawl_artifact
    )
    
    assert brand_match.matched_brand == "paypal"
    assert brand_match.is_contradiction is True

    domain_intel = DomainIntel(
        registrable_domain="paypal-security-check.xyz",
        tld="xyz",
        domain_age_days=3,
        is_newly_registered=True,
        dns=DNSRecords()
    )

    has_contra, ev = evaluate_brand_contradiction(brand_match, domain_intel, "https://paypal-security-check.xyz/login")
    assert has_contra is True
    assert ev.severity == "CRITICAL"
    assert ev.contribution > 0

if __name__ == "__main__":
    test_entropy()
    print("✓ test_entropy passed")
    test_lexical_extraction()
    print("✓ test_lexical_extraction passed")
    test_triage_classifier()
    print("✓ test_triage_classifier passed")
    test_brand_contradiction()
    print("✓ test_brand_contradiction passed")
    print("ALL BACKEND UNIT TESTS PASSED!")
