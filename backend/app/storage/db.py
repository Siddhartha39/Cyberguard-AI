import json
import sqlite3
from typing import List, Optional, Dict, Any
from app.config import settings
from app.schemas.analysis import RiskScoreReport, AnalystFeedback

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

db_manager = DatabaseManager()
