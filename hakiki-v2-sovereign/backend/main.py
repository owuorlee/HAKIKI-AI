import sys
import os
import pandas as pd
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

# Add parent directory to path to import investigator and brain
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from investigator import SovereignInvestigator
from brain import HakikiBrain
import backend.schemas as schemas
import backend.security as security
from backend.routers import audit

# INITIALIZE APP
app = FastAPI(
    title="HAKIKI AI Sovereign API",
    description="National Integrity Platform Microservice",
    version="2.0.0"
)

# CORS (Allow Frontend Access)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Audit Router Include (No Security)
app.include_router(audit.router, prefix="/api/audit", tags=["audit"])

# LOAD BRAIN (Singleton)
# We load it once at startup
brain_instance = None
AUDIT_LOG_FILE = "audit_log.csv"

@app.on_event("startup")
async def startup_event():
    global brain_instance
    print("🚀 Initializing Sovereign Brain...")
    data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "Hakiki_SRC_Data_v2.csv")
    brain_instance = HakikiBrain(payroll_path=data_path)

# DEPENDENCY
def get_brain():
    if brain_instance is None:
        raise HTTPException(status_code=503, detail="Brain not initialized")
    return brain_instance

# ==================== AUTH ENDPOINTS ====================

@app.post("/api/auth/login", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    # Hardcoded admin for demo (In prod, use DB)
    if form_data.username == "admin" and form_data.password == "hakiki2026":
        access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = security.create_access_token(
            data={"sub": form_data.username}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

# ==================== FORENSIC ENDPOINTS ====================

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
import shutil

# ... imports ...

# ... imports ...

# app.include_router(audit.router, prefix="/api/audit", tags=["audit"]) is added below.

# OMITTED OLD INLINE SCANNER FOR ROUTER REFACTOR
# @app.post("/api/audit/scan") 
# ...

# ==================== AGENT ENDPOINTS ====================

@app.post("/api/agent/query", response_model=schemas.QueryResponse)
async def agent_query(
    request: schemas.QueryRequest,
    current_user: str = Depends(security.get_current_user),
    brain: HakikiBrain = Depends(get_brain)
):
    # Security Check
    is_safe, msg = brain.check_security(request.query)
    if not is_safe:
        _log_audit(current_user, "QUERY_BLOCKED", request.query, "SECURITY_VIOLATION")
        return {
            "trace": "🛡️ SECURITY SHIELD ENGAGED",
            "result": msg,
            "intent": "BLOCKED"
        }
        
    intent = brain.classify_intent(request.query)
    
    # Execute (Reuse brain logic)
    # The brain.route_query returns (trace, result_dfs/str)
    # Ideally we'd separate trace logic, but for now we parse the result
    
    # We call internal handlers directly to get clean data for API
    if intent == "FORENSIC":
        result = brain._handle_forensic(request.query)
    elif intent == "INTEL":
        result = brain._handle_intel(request.query)
    else:
        # Analytics returns DF or String
        raw_result = brain._handle_analytics(request.query)
        if isinstance(raw_result, pd.DataFrame):
            result = raw_result.to_dict(orient="records")
        else:
            result = raw_result
            
    _log_audit(current_user, "QUERY_EXECUTION", request.query, f"INTENT:{intent}")
    
    return {
        "trace": f"Intent Classified: {intent}",
        "result": result,
        "intent": intent
    }

# ==================== INTEL ENDPOINTS ====================

@app.post("/api/intel/tip")
async def submit_tip(
    tip: schemas.TipInput,
    current_user: str = Depends(security.get_current_user),
    brain: HakikiBrain = Depends(get_brain)
):
    result = brain.intel.add_tip(
        text=tip.content,
        source=tip.source,
        employee_name=tip.related_entity,
        ministry=tip.ministry
    )
    
    _log_audit(current_user, "WHISTLEBLOWER_TIP", "Tip Submitted", "SUCCESS")
    return result

# HELPER
def _log_audit(user, action, query, outcome):
    timestamp = pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")
    # Clean inputs
    query = str(query).replace(",", ";").replace("\n", " ")
    
    log_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), AUDIT_LOG_FILE)
    
    if not os.path.exists(log_path):
        with open(log_path, "w") as f:
            f.write("Timestamp,User_ID,Action_Type,Query_Content,Outcome_Status\n")
            
    with open(log_path, "a") as f:
        f.write(f"{timestamp},{user},{action},{query},{outcome}\n")

# Include Chat Router
from backend.routers import chat
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
