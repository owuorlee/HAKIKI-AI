# HAKIKI AI v2.0 - Sovereign Systems

**Department of Systems Integrity**  
*Initial Release: January 2026*

## 🚨 SYSTEM OVERVIEW

HAKIKI AI is a sovereign, air-gapped forensic auditing system designed to detect payroll fraud ("Ghost Workers") without relying on external cloud providers. It features a tactical "Command Center" UI, a local Neural Engine (Ollama/Llama 3.1), and a secure Hybrid Authentication gateway.

### Core Modules

1. **Sovereign Brain (Ollama)**: Local LLM integration for offensive data analysis.
2. **Audit Engine (FastAPI)**: Python-based forensic logic, capable of processing massive CSV payroll files.
3. **Command Center (Next.js)**: A cinematic, high-stakes dashboard for investigators.
4. **Forensic Memory**: Shared context injection allowing the Chatbot to "read" audit results.

---

## ⚡ QUICK START (The Red Button)

To launch the entire stack in one click:

1. Navigate to the project root.
2. Double-click **`boot_system.bat`**.
3. Wait for the 3 terminal windows to initialize.

*The system will be live at: [http://localhost:3000](http://localhost:3000)*

---

## 🛠️ MANUAL STARTUP PROTOCOL

If the automated boot fails, execute this sequence strictly:

### Terminal 1: The Brain

```powershell
ollama serve
# Ensure "llama3.1" is pulled: ollama pull llama3.1
```

### Terminal 2: The Audit Engine

```powershell
cd hakiki-v2-sovereign/backend
uvicorn main:app --reload --port 8000
```

### Terminal 3: The Command Center

```powershell
cd hakiki-command-center
npm run dev
```

---

## 📂 PROJECT STRUCTURE

- `/hakiki-v2-sovereign`: Backend (FastAPI + Logic)
  - `/backend/routers/audit.py`: Forensic rules engine.
  - `/backend/routers/chat.py`: Ollama bridge with Context Injection.
- `/hakiki-command-center`: Frontend (Next.js + Tailwind)
  - `/src/app/investigation`: The AI Chat Interface.
  - `/src/app/audit/dashboard`: The Forensic Results View.

## 🔐 CREDENTIALS (DEV MODE)

- **Login**: Any Email
- **Password**: Any Password (Mock Auth Active)
- **Biometric**: Click to Simulate Scan

---
*mission_status: ACCOMPLISHED*
