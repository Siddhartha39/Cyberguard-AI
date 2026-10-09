import json
import sqlite3
import hashlib
import secrets
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from app.config import settings
from app.schemas.analysis import RiskScoreReport, AnalystFeedback

def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000
    ).hex()
    return hashed, salt

def verify_password(password: str, password_hash: str, salt: str) -> bool:
    hashed, _ = hash_password(password, salt)
    return secrets.compare_digest(hashed, password_hash)

class DatabaseManager:
    def __init__(self, db_path: str = settings.DATABASE_PATH):
        self.db_path = db_path
        self._init_db()

    def _get_conn(self):
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        conn = self._get_conn()
        cursor = conn.cursor()
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS cases (
            case_id TEXT PRIMARY KEY,
            target_url TEXT NOT NULL,
            canonical_domain TEXT NOT NULL,
            risk_score REAL NOT NULL,
            verdict TEXT NOT NULL,
            matched_brand TEXT,
            is_contradiction INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            analyst_verdict TEXT,
            analyst_notes TEXT,
            full_report_json TEXT NOT NULL
        )
        """)
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS feedback_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            case_id TEXT NOT NULL,
            analyst_verdict TEXT NOT NULL,
            notes TEXT,
            timestamp TEXT NOT NULL
        )
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_tokens (
            token TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_chat_sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            domain TEXT,
            security_mode TEXT,
            is_pinned INTEGER DEFAULT 0,
            messages_json TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        """)
        
        conn.commit()
        conn.close()

    def save_case(self, report: RiskScoreReport) -> None:
        conn = self._get_conn()
        cursor = conn.cursor()
        
        report_json = report.model_dump_json()
        cursor.execute("""
        INSERT OR REPLACE INTO cases (
            case_id, target_url, canonical_domain, risk_score, verdict,
            matched_brand, is_contradiction, created_at, analyst_verdict,
            analyst_notes, full_report_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            report.case_id,
            report.target_url,
            report.canonical_domain,
            report.overall_risk_score,
            report.verdict,
            report.brand_analysis.matched_brand,
            1 if report.brand_analysis.is_contradiction else 0,
            report.timestamp,
            None,
            None,
            report_json
        ))
        conn.commit()
        conn.close()

    def get_all_cases(self, limit: int = 50) -> List[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        
        cursor.execute("""
        SELECT case_id, target_url, canonical_domain, risk_score, verdict,
               matched_brand, is_contradiction, created_at, analyst_verdict, analyst_notes
        FROM cases
        ORDER BY created_at DESC
        LIMIT ?
        """, (limit,))
        
        rows = cursor.fetchall()
        conn.close()
        
        results = []
        for r in rows:
            results.append({
                "case_id": r[0],
                "target_url": r[1],
                "canonical_domain": r[2],
                "risk_score": r[3],
                "verdict": r[4],
                "matched_brand": r[5],
                "is_contradiction": bool(r[6]),
                "created_at": r[7],
                "analyst_verdict": r[8],
                "analyst_notes": r[9]
            })
        return results

    def get_case_by_id(self, case_id: str) -> Optional[RiskScoreReport]:
        conn = self._get_conn()
        cursor = conn.cursor()
        
        cursor.execute("SELECT full_report_json FROM cases WHERE case_id = ?", (case_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            data = json.loads(row[0])
            return RiskScoreReport(**data)
        return None

    def update_feedback(self, feedback: AnalystFeedback, timestamp: str) -> bool:
        conn = self._get_conn()
        cursor = conn.cursor()
        
        cursor.execute("""
        UPDATE cases
        SET analyst_verdict = ?, analyst_notes = ?
        WHERE case_id = ?
        """, (feedback.analyst_verdict, feedback.notes, feedback.case_id))
        
        cursor.execute("""
        INSERT INTO feedback_logs (case_id, analyst_verdict, notes, timestamp)
        VALUES (?, ?, ?, ?)
        """, (feedback.case_id, feedback.analyst_verdict, feedback.notes, timestamp))
        
        rows_affected = cursor.rowcount
        conn.commit()
        conn.close()
        return rows_affected > 0

    # User Authentication & Cross-Device Management
    def create_user(self, username: str, email: str, password: str) -> Dict[str, Any]:
        clean_user = username.strip()
        clean_email = email.strip().lower()
        if len(clean_user) < 3:
            raise ValueError("Username must be at least 3 characters.")
        if "@" not in clean_email or "." not in clean_email:
            raise ValueError("Please provide a valid email address.")
        if len(password) < 6:
            raise ValueError("Password must be at least 6 characters.")

        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?", (clean_user.lower(), clean_email))
        if cursor.fetchone():
            conn.close()
            raise ValueError("An account with this username or email already exists.")

        user_id = f"user_{uuid.uuid4().hex[:12]}"
        pwd_hash, salt = hash_password(password)
        now = datetime.now(timezone.utc).isoformat()

        cursor.execute("""
        INSERT INTO users (id, username, email, password_hash, salt, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (user_id, clean_user, clean_email, pwd_hash, salt, now))

        token = f"cg_{secrets.token_urlsafe(32)}"
        cursor.execute("INSERT INTO user_tokens (token, user_id, created_at) VALUES (?, ?, ?)", (token, user_id, now))

        conn.commit()
        conn.close()

        return {
            "id": user_id,
            "username": clean_user,
            "email": clean_email,
            "token": token,
            "created_at": now
        }

    def authenticate_user(self, identifier: str, password: str) -> Optional[Dict[str, Any]]:
        clean_id = identifier.strip().lower()
        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute("""
        SELECT id, username, email, password_hash, salt, created_at
        FROM users
        WHERE LOWER(username) = ? OR LOWER(email) = ?
        """, (clean_id, clean_id))
        row = cursor.fetchone()

        if not row:
            conn.close()
            return None

        user_id, username, email, pwd_hash, salt, created_at = row
        if not verify_password(password, pwd_hash, salt):
            conn.close()
            return None

        now = datetime.now(timezone.utc).isoformat()
        token = f"cg_{secrets.token_urlsafe(32)}"
        cursor.execute("INSERT INTO user_tokens (token, user_id, created_at) VALUES (?, ?, ?)", (token, user_id, now))

        conn.commit()
        conn.close()

        return {
            "id": user_id,
            "username": username,
            "email": email,
            "token": token,
            "created_at": created_at
        }

    def get_user_by_token(self, token: str) -> Optional[Dict[str, Any]]:
        if not token or not token.strip():
            return None
        clean_token = token.strip()
        if clean_token.startswith("Bearer "):
            clean_token = clean_token[7:].strip()

        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("""
        SELECT u.id, u.username, u.email, u.created_at
        FROM user_tokens t
        JOIN users u ON t.user_id = u.id
        WHERE t.token = ?
        """, (clean_token,))
        row = cursor.fetchone()
        conn.close()

        if row:
            return {
                "id": row[0],
                "username": row[1],
                "email": row[2],
                "created_at": row[3]
            }
        return None

    def get_user_chat_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("""
        SELECT id, title, domain, security_mode, is_pinned, messages_json, created_at, updated_at
        FROM user_chat_sessions
        WHERE user_id = ?
        ORDER BY is_pinned DESC, updated_at DESC
        """, (user_id,))
        rows = cursor.fetchall()
        conn.close()

        sessions = []
        for r in rows:
            try:
                msgs = json.loads(r[5])
            except Exception:
                msgs = []
            sessions.append({
                "id": r[0],
                "title": r[1],
                "domain": r[2],
                "securityMode": r[3],
                "isPinned": bool(r[4]),
                "messages": msgs,
                "createdAt": r[6],
                "updatedAt": r[7]
            })
        return sessions

    def sync_user_chat_sessions(self, user_id: str, incoming_sessions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()

        for s in incoming_sessions:
            sid = s.get("id")
            if not sid:
                continue
            title = s.get("title") or "Security Chat"
            domain = s.get("domain")
            sec_mode = s.get("securityMode") or "soc-forensics"
            is_pinned = 1 if s.get("isPinned") else 0
            msgs_json = json.dumps(s.get("messages") or [])
            created_at = int(s.get("createdAt") or int(datetime.now().timestamp() * 1000))
            updated_at = int(s.get("updatedAt") or int(datetime.now().timestamp() * 1000))

            cursor.execute("""
            INSERT INTO user_chat_sessions (
                id, user_id, title, domain, security_mode, is_pinned, messages_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                domain = excluded.domain,
                security_mode = excluded.security_mode,
                is_pinned = excluded.is_pinned,
                messages_json = excluded.messages_json,
                updated_at = excluded.updated_at
            WHERE user_chat_sessions.user_id = excluded.user_id
            """, (sid, user_id, title, domain, sec_mode, is_pinned, msgs_json, created_at, updated_at))

        conn.commit()
        conn.close()
        return self.get_user_chat_sessions(user_id)

    def delete_user_chat_session(self, user_id: str, session_id: str) -> bool:
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM user_chat_sessions WHERE id = ? AND user_id = ?", (session_id, user_id))
        rows = cursor.rowcount
        conn.commit()
        conn.close()
        return rows > 0

    def clear_user_chat_sessions(self, user_id: str) -> bool:
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM user_chat_sessions WHERE user_id = ?", (user_id,))
        conn.commit()
        conn.close()
        return True

db_manager = DatabaseManager()
