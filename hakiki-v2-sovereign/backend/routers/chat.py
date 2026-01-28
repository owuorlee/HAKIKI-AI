from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import json
import os

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    context: str = ""

@router.post("/ask")
async def ask_ollama(request: ChatRequest):
    print("\n----- 🔵 NEW CHAT REQUEST RECEIVED -----")
    print(f"   👤 User Query: {request.query}")
    
    # 1. READ CONTEXT
    print("📂 CHECKING MEMORY FILE...")
    context_str = "No specific audit data available."
    try:
        if os.path.exists("audit_memory.json"):
            print("   ✅ Found audit_memory.json")
            with open("audit_memory.json", "r") as f:
                data = json.load(f)
                # Formulate a context summary from the JSON data
                context_str = f"CURRENT AUDIT FINDINGS:\n- Total Risk: KES {data.get('total_risk', 0):,}\n- Ghost Workers: {data.get('ghost_count', 0)}\n- Allowance Fraud: {data.get('allowance_count', 0)}\n- Top Suspects: {', '.join(data.get('top_suspects', []))}"
                print(f"   📄 Context Loaded: {len(context_str)} chars")
        else:
            print("   ⚠️ No memory file found.")
    except Exception as e:
        print(f"   ❌ ERROR READING FILE: {e}")

    # 2. SEND TO OLLAMA
    print("🤖 CONTACTING OLLAMA BRAIN...")
    ollama_url = "http://127.0.0.1:11434/api/generate"
    
    # Sovereign System Prompt
    system_prompt = (
        "System: You are HAKIKI AI, a government forensic assistant. "
        "You are deployed on a Sovereign Server (Air-Gapped). "
        "Your mission is to detect fraud, analyze payroll data, and protect the public ledger. "
        "Be professional, tactical, and concise. "
        "Do not hallucinate. If you don't know, say 'Insufficient Intelligence'.\n"
    )
    
    # Construct Payload
    full_prompt = f"{system_prompt}\nSYSTEM INJECTED EVIDENCE: {context_str}\n\nUser: {request.query}\nContext: {request.context}"
    
    payload = {
        "model": "llama3.1",
        "prompt": full_prompt,
        "stream": False
    }

    try:
        # INCREASED TIMEOUT to 120s for local LLM warm-up/loads
        async with httpx.AsyncClient(timeout=120.0) as client: 
            print("   📡 Sending Request to http://127.0.0.1:11434...")
            response = await client.post(ollama_url, json=payload)
            print("   ✅ OLLAMA RESPONDED!")
            
            if response.status_code != 200:
                print(f"   ❌ OLLAMA ERROR CODE: {response.status_code} - {response.text}")
                raise HTTPException(status_code=503, detail=f"Brain Malfunction: {response.text}")
                
            data = response.json()
            reply = data.get("response", "No intelligence received.")
            print("   📤 RETURNING RESPONSE TO FRONTEND.")
            return {"response": reply}
            
    except httpx.ConnectError as exc:
        print(f"❌ OLLAMA CONNECTION FAILED: {str(exc)}")
        raise HTTPException(
            status_code=503, 
            detail="Sovereign Brain Unreachable. Is Ollama running? (Try 'ollama serve')"
        )
    except httpx.ReadTimeout:
        print("❌ OLLAMA TIMEOUT: Model took too long to think (>120s).")
        raise HTTPException(
            status_code=504, 
            detail="Sovereign Brain Timeout. Model is warming up, please try again."
        )
    except Exception as e:
        print(f"❌ INTERNAL ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Error: {str(e)}")
