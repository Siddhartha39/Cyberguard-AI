from typing import Dict, List, Any

class BrandProfile:
    def __init__(
        self,
        brand_id: str,
        name: str,
        authorized_domains: List[str],
        keywords: List[str],
        primary_colors: List[str],
        logo_signature: str = ""
    ):
        self.brand_id = brand_id
        self.name = name
        self.authorized_domains = authorized_domains
        self.keywords = keywords
        self.primary_colors = primary_colors
        self.logo_signature = logo_signature

    def to_dict(self) -> Dict[str, Any]:
        return {
            "brand_id": self.brand_id,
            "name": self.name,
            "authorized_domains": self.authorized_domains,
            "keywords": self.keywords,
            "primary_colors": self.primary_colors,
        }

# Strict Reference Brand Library - Contains ONLY exact trademark identifiers
BRAND_CATALOG: Dict[str, BrandProfile] = {
    "paypal": BrandProfile(
        brand_id="paypal",
        name="PayPal",
        authorized_domains=["paypal.com", "paypal-corp.com", "paypalobjects.com"],
        keywords=["paypal", "pay pal", "paypal balance", "paypal security"],
        primary_colors=["#003087", "#0079C1", "#00457C"]
    ),
    "microsoft": BrandProfile(
        brand_id="microsoft",
        name="Microsoft 365 / Outlook",
        authorized_domains=["microsoft.com", "microsoftonline.com", "live.com", "office.com", "outlook.com", "office365.com", "sharepoint.com", "azure.com"],
        keywords=["microsoft", "microsoft 365", "office 365", "outlook.com", "microsoft corporation", "onedrive", "sharepoint"],
        primary_colors=["#00A4EF", "#F25022", "#7FBA00", "#FFB900"]
    ),
    "google": BrandProfile(
        brand_id="google",
        name="Google Workspace / Gmail",
        authorized_domains=["google.com", "gmail.com", "google.co.in", "google.co.uk", "accounts.google.com", "gstatic.com", "youtube.com"],
        keywords=["google workspace", "google account", "gmail", "google drive", "google security"],
        primary_colors=["#4285F4", "#EA4335", "#FBBC05", "#34A853"]
    ),
    "apple": BrandProfile(
        brand_id="apple",
        name="Apple iCloud / Apple ID",
        authorized_domains=["apple.com", "icloud.com", "appleid.apple.com"],
        keywords=["apple id", "icloud", "apple inc", "find my iphone", "apple security"],
        primary_colors=["#000000", "#555555", "#FFFFFF"]
    ),
    "amazon": BrandProfile(
        brand_id="amazon",
        name="Amazon",
        authorized_domains=["amazon.com", "amazon.co.uk", "amazon.in", "amazon.de", "aws.amazon.com"],
        keywords=["amazon prime", "amazon pay", "amazon.com", "aws amazon", "amazon store"],
        primary_colors=["#FF9900", "#146EB4", "#000000"]
    ),
    "netflix": BrandProfile(
        brand_id="netflix",
        name="Netflix",
        authorized_domains=["netflix.com"],
        keywords=["netflix", "netflix membership", "netflix streaming"],
        primary_colors=["#E50914", "#000000"]
    ),
    "chase": BrandProfile(
        brand_id="chase",
        name="Chase Bank (JPMorgan)",
        authorized_domains=["chase.com", "jpmorganchase.com"],
        keywords=["chase bank", "jpmorgan chase", "chase online", "chase banking"],
        primary_colors=["#117ACA", "#122353"]
    ),
    "bankofamerica": BrandProfile(
        brand_id="bankofamerica",
        name="Bank of America",
        authorized_domains=["bankofamerica.com", "bofa.com"],
        keywords=["bank of america", "bankofamerica", "bofa online", "merrill lynch"],
        primary_colors=["#E31837", "#002B49"]
    ),
    "coinbase": BrandProfile(
        brand_id="coinbase",
        name="Coinbase Crypto Exchange",
        authorized_domains=["coinbase.com", "pro.coinbase.com"],
        keywords=["coinbase", "coinbase pro", "coinbase wallet", "coinbase exchange"],
        primary_colors=["#0052FF", "#1652F0"]
    ),
    "steam": BrandProfile(
        brand_id="steam",
        name="Steam / Valve",
        authorized_domains=["steampowered.com", "steamcommunity.com", "valvesoftware.com"],
        keywords=["steam community", "steampowered", "steam guard", "valvesoftware"],
        primary_colors=["#171A21", "#66C0F4"]
    ),
    "meta": BrandProfile(
        brand_id="meta",
        name="Meta (Facebook / Instagram)",
        authorized_domains=["facebook.com", "instagram.com", "meta.com", "fb.com", "whatsapp.com"],
        keywords=["facebook login", "meta platforms", "instagram login", "meta quest"],
        primary_colors=["#1877F2", "#E1306C"]
    )
}

def get_all_brands() -> List[Dict[str, Any]]:
    return [brand.to_dict() for brand in BRAND_CATALOG.values()]
