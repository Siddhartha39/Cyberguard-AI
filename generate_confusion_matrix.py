import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay, classification_report
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.calibration import CalibratedClassifierCV

# 1. Synthesize PhiUSIIL/PhishTank-aligned representative test data
np.random.seed(42)
n_samples = 600

X_data = []
y_data = []

# Legitimate patterns (class 0)
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
    X_data.append(vec)
    y_data.append(0)

# Phishing patterns (class 1)
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
    X_data.append(vec)
    y_data.append(1)

X = np.array(X_data)
y = np.array(y_data)

# Split into Train / Test sets (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)

# Train the Calibrated Random Forest Classifier
base_rf = RandomForestClassifier(n_estimators=60, max_depth=7, random_state=42)
model = CalibratedClassifierCV(estimator=base_rf, method='sigmoid', cv=3)
model.fit(X_train, y_train)

# Predict on test set
y_pred = model.predict(X_test)

# 2. Compute Confusion Matrix
cm = confusion_matrix(y_test, y_pred)
labels = ["Legitimate (Benign)", "Phishing (Malicious)"]

print("=" * 60)
print("CYBERGUARD AI - FAST TRIAGE MODEL EVALUATION REPORT")
print("=" * 60)
print("\nConfusion Matrix (Raw Counts):")
print(f"                Predicted Benign   Predicted Phishing")
print(f"Actual Benign         {cm[0, 0]:<18} {cm[0, 1]:<18}")
print(f"Actual Phishing       {cm[1, 0]:<18} {cm[1, 1]:<18}")

print("\nDetailed Classification Report:")
print(classification_report(y_test, y_pred, target_names=labels))

# 3. Save plot as image
fig, ax = plt.subplots(figsize=(6, 5))
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=labels)
disp.plot(cmap="Blues", values_format="d", ax=ax)
plt.title("CyberGuard AI Triage Model - Confusion Matrix", fontsize=12, fontweight="bold", pad=12)
plt.tight_layout()

output_path = "confusion_matrix.png"
plt.savefig(output_path, dpi=300)
print(f"Confusion matrix plot saved to: {output_path}")
