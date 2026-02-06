from pydantic import BaseModel
from typing import List, Optional, Any, Dict

# --- CHAT MODELS ---
# Used by the Sovereign Brain (Llama 3)
class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    response: str
    timestamp: str

# --- AUDIT MODELS ---
# Used for the Audit Dashboard response
class AuditReport(BaseModel):
    # Frontend-friendly (camelCase)
    totalRisk: float
    ghostCount: int
    fraudCases: int
    totalRecords: int
    status: str
    suspects: List[Any]
    
    # Allow extra fields (like snake_case versions) to pass through
    class Config:
        extra = "allow"

# --- MOBILE MODELS ---
# (Optional: In case we re-enable mobile later)
class CheckInPayload(BaseModel):
    national_id: str
    latitude: float
    longitude: float
    timestamp: str

# --- SYSTEM REQUIRED MODELS (Recovered to prevent import errors) ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    trace: str
    result: Any
    intent: str

class TipInput(BaseModel):
    content: str
    source: Optional[str] = "Anonymous"
    related_entity: Optional[str] = None
    ministry: Optional[str] = None
