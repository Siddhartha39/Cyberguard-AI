import asyncio
import random
import time
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.schemas.analysis import FeedItem
from app.collectors.lexical import extract_lexical_features
from app.ml.classifier import triage_classifier

# Pre-populated live candidate stream samples
CANDIDATE_POOLS = [
    ("login-paypal-security-auth.xyz", "Newly Registered (CT Log)", ["nrd", "brand-impersonation"]),
    ("microsoft-onedrive-sharepoint-verify.top", "Newly Registered (DNS Stream)", ["nrd", "o365-lookalike"]),
    ("chase-online-account-security.net", "Newly Registered (RDAP Feed)", ["nrd", "banking-targeted"]),
    ("amazon-prime-giftcard-claim.info", "Newly Registered (DNS Stream)", ["nrd", "ecommerce-scam"]),
    ("apple-id-suspended-recovery.site", "Newly Registered (CT Log)", ["nrd", "appleid-phish"]),
    ("coinbase-wallet-security-update.live", "Newly Registered (CT Log)", ["nrd", "crypto-drainer"]),
    ("secure-auth-92831.xyz", "Newly Registered (RDAP Feed)", ["nrd", "credential-harvester"]),
    ("docs.google.com", "Known Benign Feed", ["legitimate", "cloud"]),
    ("en.wikipedia.org", "Known Benign Feed", ["legitimate", "encyclopedia"]),
    ("my-personal-travel-blog-2026.org", "Newly Registered (DNS Stream)", ["nrd", "low-risk"]),
    ("netflix-billing-update-notice.club", "Newly Registered (CT Log)", ["nrd", "streaming-scam"]),
    ("steampowered-community-gifts.link", "Newly Registered (DNS Stream)", ["nrd", "gaming-phish"]),
    ("meta-security-checkpoint-review.cf", "Newly Registered (CT Log)", ["nrd", "meta-credential"]),
]

class NRDFeedManager:
    def __init__(self):
        self.feed_items: List[FeedItem] = []
        self._initialize_initial_feed()

    def _initialize_initial_feed(self):
        for domain, source, tags in CANDIDATE_POOLS:
            item_id = str(uuid.uuid4())[:8]
            feat = extract_lexical_features(domain)
            triage = triage_classifier.predict(feat["features"])
            
            status = "triaged"
            if triage.is_suspicious:
                status = "queued" if triage.lexical_score > 0.65 else "triaged"

            self.feed_items.append(FeedItem(
                id=item_id,
                domain=domain,
                discovered_time=datetime.now(timezone.utc).strftime("%H:%M:%S UTC"),
                source=source,
                fast_risk_score=round(triage.lexical_score * 100.0, 1),
                is_escalated=False,
                status=status,
                tags=tags
            ))

    def get_feed(self, limit: int = 25) -> List[FeedItem]:
        return self.feed_items[:limit]

    def escalate_candidate(self, item_id: str) -> Optional[FeedItem]:
        for item in self.feed_items:
            if item.id == item_id:
                item.is_escalated = True
                item.status = "deep_analyzed"
                return item
        return None

    def add_simulated_domain(self, domain: str, source: str = "Live Feed Ingestion") -> FeedItem:
        item_id = str(uuid.uuid4())[:8]
        feat = extract_lexical_features(domain)
        triage = triage_classifier.predict(feat["features"])
        
        item = FeedItem(
            id=item_id,
            domain=domain,
            discovered_time=datetime.now(timezone.utc).strftime("%H:%M:%S UTC"),
            source=source,
            fast_risk_score=round(triage.lexical_score * 100.0, 1),
            is_escalated=False,
            status="queued" if triage.is_suspicious else "triaged",
            tags=["nrd", "live-stream"]
        )
        self.feed_items.insert(0, item)
        return item

nrd_feed_manager = NRDFeedManager()
