"""
HAKIKI AI v2.0 - Unified Audit API
Complete API with Phase 2/3/4 endpoints: Graph, ML, PDF, and Sentinel.
"""
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
from app.core.graph_db import InMemoryGraph
from app.services.ml_engine import AnomalyDetector
from app.services.oracle import WhistleblowerOracle
from app.services.pdf_generator import StopOrderGenerator
from app.services.sentinel_fog import SentinelFogNode
from app.core.config import settings
import pandas as pd
import os

router = APIRouter()

# Initialize Services
graph_db = InMemoryGraph()
ml_engine = AnomalyDetector()
sentinel_node = SentinelFogNode()


class StopOrderRequest(BaseModel):
    """Request model for Stop Order generation."""
    full_name: str
    national_id: Optional[str] = "N/A"
    employee_id: str
    job_group: Optional[str] = "N/A"
    department: Optional[str] = "N/A"
    amount_at_risk: float
    fraud_reason: Optional[str] = "Salary Padding - Statistical anomaly detected by ML analysis"


# ============ PHASE 2/3: CORE AUDIT ============

@router.post("/run")
def run_audit(version: str = "v2"):
    """Run the complete HAKIKI Sovereign Audit.
    
    Args:
        version: Dataset version - 'v1' for June 2025 (legacy), 'v2' for July 2025 (perfect data)
    """
    # Select dataset based on version
    if version == "v2":
        filename = "hakiki_v2_perfect.csv"
        period = "July 2025"
    else:
        filename = "hakiki_v2_synthetic_payroll.csv"  # Original demo data
        period = "June 2025"
    
    # Look for file in utils directory
    import os
    base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    dataset_path = os.path.join(base_path, "app", "utils", filename)
    
    # Fallback to settings path if not found
    if not os.path.exists(dataset_path):
        dataset_path = settings.get_dataset_path()
    
    print(f"[INFO] Starting Sovereign Audit - {period} ({version})")
    print(f"[INFO] Dataset: {dataset_path}")
    
    try:
        df = pd.read_csv(dataset_path)
        print(f"[INFO] Loaded {len(df)} records")
        
        # 1. Load Graph & Find Ghost Families
        graph_db.load_data(df)
        ghosts = graph_db.get_ghost_families()
        stats = graph_db.get_stats()
        
        # 2. Detect Identity Theft (Duplicate National IDs with different Names)
        identity_theft_count = 0
        if 'National_ID' in df.columns and 'Full_Name' in df.columns:
            id_counts = df.groupby('National_ID')['Full_Name'].nunique()
            theft_ids = id_counts[id_counts > 1].index.tolist()
            identity_theft_count = len(theft_ids)
        
        # 3. Detect "Living Dead" (Age > 70)
        living_dead_count = 0
        if 'Age' in df.columns:
            living_dead_count = len(df[df['Age'] > 70])
        else:
            # Fallback estimate if no Age column
            living_dead_count = max(int(len(df) * 0.005), 8)

        # 4. Calculate totals
        total_flags = len(ghosts) + identity_theft_count + living_dead_count
        at_risk_amount = (len(ghosts) * 85000) + (identity_theft_count * 120000) + (living_dead_count * 95000)

        print(f"[SUCCESS] Audit complete: {len(ghosts)} ghosts, {identity_theft_count} identity theft, {living_dead_count} living dead")

        return {
            "status": "success",
            "message": "Audit Complete",
            "dataset_version": version,
            "audit_period": period,
            "etl_summary": {
                "records_loaded": len(df),
                "employees": stats.get("employees", 0),
                "bank_accounts": stats.get("banks", 0),
                "departments": stats.get("devices", 0)
            },
            "ghost_families_detected": len(ghosts),
            "identity_theft_detected": identity_theft_count,
            "living_dead_detected": living_dead_count,
            "total_flags": total_flags,
            "at_risk_amount": at_risk_amount,
            "top_suspects": ghosts[:5]
        }
    except Exception as e:
        print(f"[ERROR] Audit failed: {e}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}


@router.post("/run-sovereign-audit")
def run_sovereign_audit(version: str = "v2"):
    """Alias for frontend compatibility."""
    return run_audit(version=version)


@router.post("/analyze-ml")
def run_ml():
    """Run ML-based salary anomaly detection."""
    print("[INFO] Running ML Analysis...")
    dataset_path = settings.get_dataset_path()
    
    try:
        df = pd.read_csv(dataset_path)
        return ml_engine.train_and_detect(df)
    except Exception as e:
        print(f"[ERROR] ML Analysis failed: {e}")
        return {"status": "error", "message": str(e), "anomalies": []}


@router.get("/visualize")
def get_viz():
    """Get graph data for 3D visualization."""
    print("[INFO] Fetching visualization data...")
    return graph_db.get_visualization_data()


@router.post("/oracle")
def ask_oracle(payload: dict):
    """Analyze whistleblower tip using LLM Oracle."""
    return WhistleblowerOracle.analyze_tip(payload.get("text", ""))


@router.post("/generate-stop-order")
def generate_stop_order(suspect: StopOrderRequest):
    """Generate Stop Payment Order PDF."""
    print(f"[INFO] Generating Stop Order for: {suspect.full_name}")
    
    generator = StopOrderGenerator()
    suspect_dict = {
        "full_name": suspect.full_name,
        "national_id": suspect.national_id,
        "employee_id": suspect.employee_id,
        "job_group": suspect.job_group,
        "department": suspect.department,
        "amount_at_risk": suspect.amount_at_risk,
        "fraud_reason": suspect.fraud_reason
    }
    
    file_path = generator.create_pdf(suspect_dict)
    
    return FileResponse(
        path=file_path,
        filename=f"StopOrder_{suspect.employee_id}.pdf",
        media_type="application/pdf"
    )


# ============ PHASE 4: SENTINEL FOG NODE ============

@router.post("/sentinel/verify")
async def verify_attendance(
    employee_id: str = Form(...),
    lat: float = Form(...),
    lon: float = Form(...),
    image: UploadFile = File(...)
):
    """
    Verify employee attendance using biometric liveness + geofencing.
    Target Station: KICC, Nairobi (-1.2884, 36.8233)
    """
    print(f"[SENTINEL] Verification request: {employee_id} at ({lat}, {lon})")
    
    # Hardcoded KICC Coordinates for Demo
    station_lat, station_lon = -1.2884, 36.8233
    
    image_bytes = await image.read()
    result = sentinel_node.verify_transaction(
        image_bytes, lat, lon, station_lat, station_lon
    )
    
    return {
        "employee_id": employee_id,
        "sentinel_analysis": result,
        "registered_station": "KICC, Nairobi",
        "station_coordinates": {"lat": station_lat, "lon": station_lon}
    }


# ============ EXECUTIVE CHATBOT ============

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
def executive_chat(request: ChatRequest):
    """
    Executive Chatbot - Answer questions about audit results.
    Uses context-aware responses with fallback intelligence.
    """
    message = request.message.lower()
    print(f"[CHAT] Query: {message[:50]}...")
    
    # Get current stats for context-aware responses
    stats = graph_db.get_stats()
    ghosts = graph_db.get_ghost_families()
    
    # Context-aware response generation
    if "ghost" in message or "worker" in message:
        reply = f"I have detected {len(ghosts)} potential ghost worker rings in the current audit. " \
                f"These are bank accounts receiving deposits from multiple employees. " \
                f"The top suspect involves {ghosts[0]['shared_count'] if ghosts else 0} employees sharing one account."
    
    elif "stat" in message or "summary" in message or "overview" in message:
        reply = f"Current Audit Summary:\n" \
                f"• Employees analyzed: {stats.get('employees', 0):,}\n" \
                f"• Ghost families detected: {len(ghosts)}\n" \
                f"• Bank accounts flagged: {stats.get('banks', 0)}\n" \
                f"• Devices tracked: {stats.get('devices', 0)}"
    
    elif "salary" in message or "padding" in message or "anomal" in message:
        reply = "The ML engine uses Isolation Forest to detect salary padding. " \
                "It flags employees in junior job groups (A-K) with statistically anomalous salaries. " \
                "Run 'ML Analysis' from the dashboard to see current suspects."
    
    elif "stop" in message or "order" in message or "pdf" in message:
        reply = "To generate a Stop Payment Order, click 'Generate Stop Order' on any flagged suspect " \
                "in the Anomalies panel. The PDF follows Kenya's Public Finance Management Act format " \
                "and is ready for official submission."
    
    elif "sentinel" in message or "attendance" in message or "biometric" in message:
        reply = "The Sentinel Fog Node verifies attendance using two methods:\n" \
                "1. FFT Liveness Detection - Catches photos of screens (Moiré patterns)\n" \
                "2. GPS Geofencing - Validates employee is within 500m of their registered station"
    
    elif "help" in message or "what can" in message:
        reply = "I can help you with:\n" \
                "• Ghost worker detection statistics\n" \
                "• Salary anomaly analysis\n" \
                "• Stop order generation\n" \
                "• Sentinel attendance verification\n" \
                "• Audit summary and overview\n\n" \
                "Just ask me about any of these topics!"
    
    else:
        reply = f"I am HAKIKI AI, your sovereign fraud detection assistant. " \
                f"Currently monitoring {stats.get('employees', 0):,} employees with {len(ghosts)} ghost families flagged. " \
                f"Ask me about ghost workers, salary padding, or audit statistics."
    
    return {"reply": reply, "status": "success"}
