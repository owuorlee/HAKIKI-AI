"""
HAKIKI AI v2.0 - Main FastAPI Application
Sovereign In-Memory Architecture (No External Dependencies)
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import audit

app = FastAPI(
    title="HAKIKI AI v2.0",
    description="Sovereign AI-powered payroll fraud detection system",
    version="2.0.0"
)

# Allow Frontend to talk to Backend (permissive for demo)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include audit router - IMPORTANT: prefix matches frontend API calls
app.include_router(audit.router, prefix="/api/v1/audit", tags=["audit"])


@app.get("/")
async def root():
    return {
        "name": "HAKIKI AI v2.0",
        "status": "operational",
        "architecture": "Sovereign In-Memory (NetworkX)",
        "message": "HAKIKI AI Sovereign Engine Online"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "engine": "NetworkX In-Memory Graph",
        "neo4j": "disabled"
    }
