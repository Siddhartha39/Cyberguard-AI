import numpy as np
from typing import Dict, Any, Tuple
from sklearn.ensemble import RandomForestClassifier
from sklearn.calibration import CalibratedClassifierCV
from app.schemas.analysis import TriageScore

# Feature keys in order
FEATURE_ORDER = [
    "url_length", "domain_length", "subdomain_length", "path_length", "query_length",
    "dot_count", "hyphen_count_url", "hyphen_count_domain", "underscore_count", "slash_count",
    "at_symbol_count", "double_slash_in_path", "subdomain_count", "url_entropy", "domain_entropy",
    "path_entropy", "is_ip", "is_punycode", "is_risky_tld", "security_keyword_count",
    "brand_in_subdomain", "brand_in_path", "digit_ratio", "hex_tokens"
]

class FastTriageClassifier:
    def __init__(self):
        self.model = None
        self._initialize_and_train_baseline()

    def _initialize_and_train_baseline(self):
        """
        Initializes and trains a calibrated Random Forest baseline on synthetic & PhiUSIIL-aligned feature vectors.
        """
        np.random.seed(42)
        n_samples = 400
        
        # Synthesize representative feature distributions for legitimate vs phishing
        X_train = []
        y_train = []
        
        # 1. Legitimate patterns (lower entropy, legitimate TLDs, no brand-in-subdomain, clean paths)
        for _ in range(n_samples // 2):
            url_len = np.random.uniform(15, 45)
            dom_len = np.random.uniform(8, 20)
            sub_len = np.random.choice([0, 3, 5, 8], p=[0.5, 0.2, 0.2, 0.1])
            path_len = np.random.uniform(0, 30)
            query_len = np.random.choice([0, 10, 20], p=[0.7, 0.2, 0.1])
            dots = np.random.choice([1, 2, 3], p=[0.7, 0.25, 0.05])
            hyphen_dom = np.random.choice([0, 1], p=[0.85, 0.15])
            hyphen_url = hyphen_dom + np.random.choice([0, 1, 2], p=[0.7, 0.2, 0.1])
            sub_count = 1 if sub_len > 0 else 0
            u_entropy = np.random.uniform(3.0, 4.2)
            d_entropy = np.random.uniform(2.5, 3.8)
            p_entropy = np.random.uniform(1.0, 3.5) if path_len > 0 else 0
            is_ip = 0.0
            is_puny = 0.0
            risky_tld = np.random.choice([0.0, 1.0], p=[0.97, 0.03])
            sec_kw = np.random.choice([0, 1], p=[0.9, 0.1])
            brand_sub = 0.0
            brand_path = np.random.choice([0.0, 1.0], p=[0.95, 0.05])
            digit_rat = np.random.uniform(0.0, 0.08)
            hex_tok = 0.0
            
            vec = [
                url_len, dom_len, sub_len, path_len, query_len,
                dots, hyphen_url, hyphen_dom, 0.0, 3.0,
                0.0, 0.0, sub_count, u_entropy, d_entropy,
                p_entropy, is_ip, is_puny, risky_tld, sec_kw,
                brand_sub, brand_path, digit_rat, hex_tok
            ]
            X_train.append(vec)
            y_train.append(0)

        # 2. Phishing patterns (high entropy, lookalikes, keywords, brand in subdomain, hyphens, suspicious TLDs)
        for _ in range(n_samples // 2):
            url_len = np.random.uniform(35, 120)
            dom_len = np.random.uniform(14, 38)
            sub_len = np.random.choice([8, 18, 28, 40], p=[0.3, 0.3, 0.2, 0.2])
            path_len = np.random.uniform(10, 80)
            query_len = np.random.choice([0, 25, 60], p=[0.3, 0.4, 0.3])
            dots = np.random.choice([2, 3, 4, 6], p=[0.2, 0.4, 0.25, 0.15])
            hyphen_dom = np.random.choice([1, 2, 3, 4], p=[0.3, 0.4, 0.2, 0.1])
            hyphen_url = hyphen_dom + np.random.choice([1, 2, 4], p=[0.3, 0.4, 0.3])
            sub_count = np.random.choice([1, 2, 3], p=[0.4, 0.4, 0.2])
            u_entropy = np.random.uniform(4.3, 5.8)
            d_entropy = np.random.uniform(3.9, 5.2)
            p_entropy = np.random.uniform(3.5, 5.0)
            is_ip = np.random.choice([0.0, 1.0], p=[0.85, 0.15])
            is_puny = np.random.choice([0.0, 1.0], p=[0.9, 0.1])
            risky_tld = np.random.choice([0.0, 1.0], p=[0.4, 0.6])
            sec_kw = np.random.choice([1, 2, 3, 4], p=[0.3, 0.4, 0.2, 0.1])
            brand_sub = np.random.choice([0.0, 1.0, 2.0], p=[0.4, 0.4, 0.2])
            brand_path = np.random.choice([0.0, 1.0, 2.0], p=[0.4, 0.4, 0.2])
            digit_rat = np.random.uniform(0.12, 0.45)
            hex_tok = np.random.choice([0.0, 1.0, 2.0], p=[0.6, 0.3, 0.1])
            
            vec = [
                url_len, dom_len, sub_len, path_len, query_len,
                dots, hyphen_url, hyphen_dom, 0.0, 4.0,
                0.0, 0.0, sub_count, u_entropy, d_entropy,
                p_entropy, is_ip, is_puny, risky_tld, sec_kw,
                brand_sub, brand_path, digit_rat, hex_tok
            ]
            X_train.append(vec)
            y_train.append(1)

        X = np.array(X_train)
        y = np.array(y_train)

        rf = RandomForestClassifier(n_estimators=60, max_depth=7, random_state=42)
        # Calibrated Classifier to ensure outputs represent true probabilities
        calibrated = CalibratedClassifierCV(estimator=rf, method='sigmoid', cv=3)
        calibrated.fit(X, y)
        self.model = calibrated
        self.feature_names = FEATURE_ORDER

    def predict(self, feature_dict: Dict[str, Any]) -> TriageScore:
        vec = [feature_dict.get(k, 0.0) for k in FEATURE_ORDER]
        X = np.array([vec])
        
        prob_phishing = float(self.model.predict_proba(X)[0][1])
        
        # Calculate feature attribution / contributions
        attributions: Dict[str, float] = {}
        if feature_dict.get("brand_in_subdomain", 0) > 0:
            attributions["Brand token in subdomain"] = +0.35
        if feature_dict.get("is_punycode", 0) > 0:
            attributions["Punycode / Homograph IDN"] = +0.40
        if feature_dict.get("is_ip", 0) > 0:
            attributions["Direct IP Hostname"] = +0.45
        if feature_dict.get("is_risky_tld", 0) > 0:
            attributions["High-risk TLD extension"] = +0.25
        if feature_dict.get("security_keyword_count", 0) >= 2:
            attributions["Multiple security/banking keywords"] = +0.30
        if feature_dict.get("hyphen_count_domain", 0) >= 2:
            attributions["Multiple hyphens in domain name"] = +0.20
        if feature_dict.get("domain_entropy", 0) > 4.2:
            attributions["High domain lexical entropy"] = +0.18
        if feature_dict.get("subdomain_count", 0) >= 3:
            attributions["Deep subdomain nesting"] = +0.15

        is_suspicious = prob_phishing >= 0.40 or len(attributions) >= 2
        
        if prob_phishing >= 0.75:
            reason = "High-risk lexical signatures and target brand tokens detected."
        elif is_suspicious:
            reason = "Moderate lexical anomalies detected; deep inspection recommended."
        else:
            reason = "Lexical features within normal baseline parameters."

        return TriageScore(
            lexical_score=round(prob_phishing, 4),
            is_suspicious=is_suspicious,
            triage_reason=reason,
            feature_attributions=attributions
        )

# Singleton instance
triage_classifier = FastTriageClassifier()
