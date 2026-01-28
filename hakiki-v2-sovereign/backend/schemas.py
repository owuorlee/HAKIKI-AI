from pydantic import BaseModel
from typing import Optional, List, Any

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class User(BaseModel):
    username: str

# Forensic Schemas
class AuditRequest(BaseModel):
    scan_type: str # 'full', 'ghost', 'dipper', 'grade', 'allowance'

class AuditResult(BaseModel):
    status: str
    metrics: dict
    timestamp: str

# Agent Schemas
class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    trace: str
    result: Any # String or JSON object (for DataFrame)
    intent: str

# Intel Schemas
class TipInput(BaseModel):
    content: str
    source: str = "Anonymous"
    related_entity: Optional[str] = None
    ministry: Optional[str] = None
