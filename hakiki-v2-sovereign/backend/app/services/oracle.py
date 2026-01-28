"""
Whistleblower Oracle for HAKIKI AI v2.0
Hybrid Engine: Tries LLM first, falls back to deterministic keyword analysis.
"""
import requests
import re
import random


class WhistleblowerOracle:
    """
    AI-powered tip analyzer with graceful fallback for demo reliability.
    """
    OLLAMA_URL = "http://localhost:11434/api/generate"

    @staticmethod
    def analyze_tip(text: str):
        """
        Hybrid Analysis: Tries LLM first, falls back to Keyword Logic for reliability.
        
        Args:
            text: The whistleblower tip text to analyze
            
        Returns:
            Analysis result with fraud type, entities, and recommendations
        """
        print(f"[ORACLE] Analyzing tip: {text[:50]}...")
        
        # 1. Try Local LLM (Ollama) - Short timeout for demo
        try:
            prompt = f"Extract entities (Person, Dept) and Fraud Type from: '{text}'. Return JSON."
            payload = {
                "model": "llama3",
                "prompt": prompt,
                "stream": False,
                "format": "json"
            }
            response = requests.post(
                WhistleblowerOracle.OLLAMA_URL, 
                json=payload, 
                timeout=2  # Short timeout to not block demo
            )
            if response.status_code == 200:
                result = response.json().get('response', {})
                print("[ORACLE] LLM analysis successful")
                return {
                    "analysis_type": "OLLAMA_LLM",
                    **result
                }
        except Exception as e:
            print(f"[ORACLE] LLM unavailable, using fallback: {e}")

        # 2. Fallback: Deterministic Keyword Engine (The "Demo Saver")
        return WhistleblowerOracle._keyword_analysis(text)

    @staticmethod
    def _keyword_analysis(text: str):
        """
        Fallback keyword-based analysis when LLM is offline.
        Uses regex and heuristics to extract intelligence.
        """
        print("[ORACLE] Using HAKIKI Fallback Engine...")
        text_lower = text.lower()
        
        # Detect Fraud Type from keywords
        fraud_type = "Unspecified Suspicion"
        if "ghost" in text_lower or "doesn't exist" in text_lower or "fake" in text_lower:
            fraud_type = "Ghost Worker Ring"
        elif "bribe" in text_lower or "kickback" in text_lower or "paid off" in text_lower:
            fraud_type = "Bribery / Corruption"
        elif "cousin" in text_lower or "relative" in text_lower or "nepotism" in text_lower or "brother" in text_lower:
            fraud_type = "Nepotism / Hiring Fraud"
        elif "salary" in text_lower or "earning" in text_lower or "paid too much" in text_lower:
            fraud_type = "Salary Padding"
        elif "steal" in text_lower or "stealing" in text_lower or "theft" in text_lower:
            fraud_type = "Asset Theft"
        elif "dead" in text_lower or "deceased" in text_lower or "passed away" in text_lower:
            fraud_type = "Living Dead Fraud"
        elif "double" in text_lower or "twice" in text_lower or "two places" in text_lower:
            fraud_type = "Double Dipping"
        
        # Extract potential names (Capitalized words that aren't common words)
        exclude_words = {
            "i", "the", "he", "she", "they", "department", "manager", "hr", "finance",
            "ministry", "county", "government", "please", "help", "someone", "about",
            "there", "this", "that", "with", "from", "been", "have", "has", "who"
        }
        
        words = text.split()
        potential_names = []
        for word in words:
            clean_word = word.strip(".,!?\"'")
            if len(clean_word) > 1 and clean_word[0].isupper() and clean_word.lower() not in exclude_words:
                potential_names.append(clean_word)
        
        # Extract department mentions
        departments = []
        dept_keywords = ["hr", "finance", "procurement", "accounting", "admin", "ict", "legal"]
        for dept in dept_keywords:
            if dept in text_lower:
                departments.append(dept.upper())
        
        subject = potential_names[0] if potential_names else "Unknown Subject"
        entities = potential_names[:3] if potential_names else ["Unknown"]
        if departments:
            entities.extend(departments)
        
        # Generate risk score based on severity keywords
        risk_score = 75
        if "millions" in text_lower or "billion" in text_lower:
            risk_score += 20
        if "years" in text_lower or "long time" in text_lower:
            risk_score += 10
        if "many" in text_lower or "multiple" in text_lower:
            risk_score += 5
        risk_score = min(risk_score + random.randint(0, 10), 99)
        
        return {
            "analysis_type": "HAKIKI_FALLBACK_ENGINE",
            "fraud_type": fraud_type,
            "primary_subject": subject,
            "entities_detected": entities,
            "departments_flagged": departments if departments else ["Unspecified"],
            "risk_score": risk_score,
            "confidence": "MEDIUM" if len(potential_names) > 0 else "LOW",
            "recommendation": "Immediate Forensic Audit Recommended",
            "next_steps": [
                "Cross-reference subject with payroll database",
                "Flag related bank accounts for monitoring",
                "Schedule unannounced department audit"
            ]
        }
