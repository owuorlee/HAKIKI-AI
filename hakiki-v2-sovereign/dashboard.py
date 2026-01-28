# FILE: dashboard.py
# HAKIKI AI v2 - Streamlit Dashboard (Sovereign Assistant UI)
# Run with: streamlit run dashboard.py

import streamlit as st
import pandas as pd
import os
import sys

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from brain import HakikiBrain
import streamlit.components.v1 as components

# ==================== ARCHITECTURE DIAGRAM ====================
def render_diagram():
    mermaid_code = """
    graph LR
        A[User/Auditor] --> B(Secure Login)
        style B fill:#d4af37,stroke:#333,stroke-width:2px,color:black
        B --> C{Sovereign Assistant}
        style C fill:#004d00,stroke:#333,stroke-width:2px,color:white
        C -->|Natural Language| D[Intent Router]
        D -->|Forensic| E[Investigator Engine]
        D -->|Analytics| F[Pandas Agent]
        E --> G[(Payroll Data)]
        style G fill:#ff4444,stroke:#333,stroke-width:2px,color:white
        F --> G
        C --> H[Glassbox Explainer]
        H --> A
    """
    # Simple Mermaid Renderer
    html_code = f"""
    <script src="https://unpkg.com/mermaid@9/dist/mermaid.min.js"></script>
    <div class="mermaid">
        {mermaid_code}
    </div>
    <script>mermaid.initialize({{startOnLoad:true}});</script>
    """
    components.html(html_code, height=200)

# PAGE CONFIG
st.set_page_config(
    page_title="HAKIKI AI | Sovereign Assistant",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# CUSTOM CSS (GovTech Style - Kenya Colors)
st.markdown("""
<style>
    /* Main background */
    .stApp {
        background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
    }
    
    /* Sidebar */
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #004d00 0%, #002200 100%);
    }
    [data-testid="stSidebar"] * {
        color: white !important;
    }
    
    /* Headers */
    h1 {
        color: #00AA00 !important;
        text-shadow: 0 0 10px rgba(0, 170, 0, 0.3);
    }
    h2, h3 {
        color: #d4af37 !important;
    }
    
    /* Buttons */
    .stButton>button {
        background: linear-gradient(135deg, #d4af37 0%, #b8960c 100%);
        color: black !important;
        font-weight: bold;
        border: none;
        border-radius: 8px;
        padding: 0.5rem 1rem;
    }
    .stButton>button:hover {
        background: linear-gradient(135deg, #e5c048 0%, #c9a71d 100%);
        box-shadow: 0 0 15px rgba(212, 175, 55, 0.5);
    }
    
    /* Metrics */
    [data-testid="stMetricValue"] {
        color: #ff4444 !important;
        font-size: 2rem !important;
    }
    
    /* Chat messages */
    .stChatMessage {
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 10px;
    }
    
    /* Cards */
    .css-1r6slb0 {
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 10px;
        padding: 1rem;
    }
</style>
""", unsafe_allow_html=True)

# TITLE HEADER
col1, col2 = st.columns([3, 1])
with col1:
    st.title("🛡️ HAKIKI AI: Sovereign Integrity Platform")
    st.markdown("**System Status:** 🟢 ONLINE | **Mode:** Sovereign (Offline-Capable)")
with col2:
    st.markdown("""
    <div style="text-align: right; padding: 10px;">
        <img src="https://upload.wikimedia.org/wikipedia/commons/4/49/Flag_of_Kenya.svg" width="80">
        <p style="color: #666; font-size: 10px;">Republic of Kenya<br>Civil Service</p>
    </div>
    """, unsafe_allow_html=True)

# INITIALIZE BRAIN (Cached)
@st.cache_resource
def load_brain():
    data_file = "Hakiki_SRC_Data_v2.csv"
    if os.path.exists(data_file):
        return HakikiBrain(data_file)
    return None

# ==================== SECURITY LAYER ====================
AUDIT_LOG_FILE = "audit_log.csv"

def log_audit_event(user, action, query, outcome):
    """Logs security events to an immutable CSV record."""
    timestamp = pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Initialize file with headers if missing
    if not os.path.exists(AUDIT_LOG_FILE):
        with open(AUDIT_LOG_FILE, "w") as f:
            f.write("Timestamp,User_ID,Action_Type,Query_Content,Outcome_Status\n")
            
    # Clean inputs to prevent CSV injection
    query = str(query).replace(",", ";").replace("\n", " ")
    
    with open(AUDIT_LOG_FILE, "a") as f:
        f.write(f"{timestamp},{user},{action},{query},{outcome}\n")

# Session State for Auth
if "authenticated" not in st.session_state:
    st.session_state.authenticated = False
if "user_id" not in st.session_state:
    st.session_state.user_id = None

# LOGIN SCREEN
if not st.session_state.authenticated:
    st.markdown("<br><br>", unsafe_allow_html=True)
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        st.markdown("""
        <div style="background-color: #004d00; padding: 20px; border-radius: 10px; border: 1px solid #d4af37; text-align: center;">
            <h2 style="color: white; margin-bottom: 0;">🛡️ RESTRICTED ACCESS</h2>
            <p style="color: #ccc;">Government of Kenya | Sovereign Integrity Platform</p>
        </div>
        """, unsafe_allow_html=True)
        st.warning("🔒 Authorization Required. All access is logged.")
        
        username = st.text_input("Username")
        password = st.text_input("Password", type="password")
        
        if st.button("Authenticate", use_container_width=True):
            if username == "admin" and password == "hakiki2026":
                st.session_state.authenticated = True
                st.session_state.user_id = username
                log_audit_event(username, "LOGIN_ATTEMPT", "Auth Request", "SUCCESS")
                st.success("Access Granted.")
                st.rerun()
            else:
                log_audit_event(username if username else "UNKNOWN", "LOGIN_ATTEMPT", "Auth Request", "FAILED")
                st.error("❌ Invalid Credentials. Incident Reported.")
    st.stop()  # STOP EXECUTION HERE IF NOT LOGGED IN

# ==================== MAIN DASHBOARD (AUTHORIZED ONLY) ====================
brain = load_brain()

if not brain:
    st.error("❌ Data File Not Found. Please run Phase 1 (genesis_v2.py) first.")
    st.code("python genesis_v2.py", language="bash")
    st.stop()

# ==================== SIDEBAR: FORENSIC CONTROLS ====================
st.sidebar.markdown("## 🔍 Forensic Audit Tools")

# ABOUT SECTION
with st.sidebar.expander("ℹ️ About Hakiki AI"):
    st.write("Sovereign Integrity Platform designed for offline forensic auditing of government payrolls.")
    st.write("v2.0 (Hackathon Build)")

st.sidebar.markdown("---")

# Run Full Scan Button
if st.sidebar.button("🚀 Run Full Payroll Audit", use_container_width=True, help="Executes strict deterministic logic to find all fraud patterns"):
    log_audit_event(st.session_state.user_id, "FORENSIC_SCAN", "Full Payroll Audit", "EXECUTION_STARTED")
    try:
        with st.spinner("Running Deterministic Logic Engine..."):
            c1 = brain.investigator.hunt_ghost_families()
            c2 = brain.investigator.hunt_double_dippers()
            c3 = brain.investigator.hunt_grade_inflation()
            c4 = brain.investigator.hunt_allowance_sharks()
            c5 = brain.investigator.validate_kra_format()
            
        st.sidebar.success("✅ Audit Complete")
        st.sidebar.metric("👻 Ghost Syndicates", c1, delta_color="inverse", help="Shared bank accounts")
        st.sidebar.metric("🔄 Double Dippers", c2, delta_color="inverse", help="Same name in multiple ministries")
        st.sidebar.metric("📈 Grade Violations", c3, delta_color="inverse", help="Salary exceeds job group cap")
        st.sidebar.metric("🦈 Allowance Sharks", c4, delta_color="inverse", help="Allowances > Basic Salary")
        st.sidebar.metric("🆔 Invalid KRA PINs", c5, delta_color="inverse", help="Regex validation failures")
    except Exception as e:
        st.sidebar.error("⚠️ Connection Interrupted. Retrying...")
        st.error(f"System Error: {e}")

st.sidebar.markdown("---")

# Individual Checks
st.sidebar.markdown("### ⚡ Quick Tools")
col1, col2 = st.sidebar.columns(2)
with col1:
    if st.button("👻 Ghosts", help="Find shared bank accounts"):
        log_audit_event(st.session_state.user_id, "FORENSIC_SCAN", "Ghost Family Check", "EXECUTED")
        c = brain.investigator.hunt_ghost_families()
        st.sidebar.info(f"Found: {c}")
with col2:
    if st.button("🔄 Dippers", help="Find cross-ministry duplicates"):
        log_audit_event(st.session_state.user_id, "FORENSIC_SCAN", "Double Dipper Check", "EXECUTED")
        c = brain.investigator.hunt_double_dippers()
        st.sidebar.info(f"Found: {c}")

# Data Stats
st.sidebar.markdown("---")
if brain.df is not None:
    st.sidebar.caption(f"📚 Payroll Database: {len(brain.df):,} Records")
    st.sidebar.caption(f"💰 Total Volume: KES {brain.df['Gross_Pay'].sum():,.0f}")

st.sidebar.markdown("---")
# RESET DEMO BUTTON
if st.sidebar.button("⚠️ RESET DEMO", type="primary", help="Wipes logs and resets session for fresh demo"):
    if os.path.exists(AUDIT_LOG_FILE):
        os.remove(AUDIT_LOG_FILE)
    st.session_state.clear()
    st.rerun()

# ==================== MAIN AREA: SOVEREIGN ASSISTANT ====================
with st.expander("🏗️ View System Architecture", expanded=False):
    render_diagram()

st.header("🧠 Sovereign Assistant (Agentic RAG)")

# Initialize chat history
if "messages" not in st.session_state:
    st.session_state.messages = [
        {
            "role": "assistant",
            "content": """Welcome to HAKIKI AI Sovereign Assistant. I can help you with:

🔍 **Forensic Queries**: "Find ghost families", "Detect double dippers"
📊 **Analytics**: "How many employees in Ministry of Health?", "Show job group J"
🕵️ **Intelligence**: "Search tips about theft", "Add tip: John is suspicious"

What would you like to investigate?"""
        }
    ]

# Display chat messages
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        if isinstance(msg["content"], pd.DataFrame):
            st.dataframe(msg["content"], use_container_width=True)
        else:
            st.markdown(msg["content"])

# Chat input
if query := st.chat_input("Ask about the payroll data..."):
    # Add user message
    st.session_state.messages.append({"role": "user", "content": query})
    with st.chat_message("user"):
        st.markdown(query)

    # Process with Brain
    with st.chat_message("assistant"):
        with st.status("🔍 Analyzing Query & Selecting Tool...", expanded=True) as status:
            st.write("🎯 Classifying intent...")
            intent = brain.classify_intent(query)
            st.write(f"Intent: **{intent}**")
            
            st.write("🔧 Executing tool...")
            result = brain.route_query(query)
            
            # Log the interaction
            log_audit_event(st.session_state.user_id, "QUERY_EXECUTION", query, f"INTENT:{intent}")
            
            status.update(label="✅ Execution Complete", state="complete", expanded=False)
        
        # Display result
        if isinstance(result, tuple):
            # Trace + DataFrame
            st.code(result[0], language="text")
            if isinstance(result[1], pd.DataFrame):
                st.dataframe(result[1], use_container_width=True)
                st.session_state.messages.append({"role": "assistant", "content": result[1]})
            else:
                st.markdown(result[1])
                st.session_state.messages.append({"role": "assistant", "content": str(result)})
        else:
            st.markdown(result)
            st.session_state.messages.append({"role": "assistant", "content": result})

# ==================== WHISTLEBLOWER SECTION ====================
st.divider()
st.subheader("📢 Unstructured Intelligence (Whistleblower Portal)")

col1, col2 = st.columns(2)

with col1:
    st.markdown("#### 📝 Submit Anonymous Tip")
    tip_source = st.selectbox("Source", ["Anonymous", "Voice_Note", "Email", "Form"])
    tip_entity = st.text_input("Related Employee (Optional)")
    tip_ministry = st.selectbox("Ministry", ["Unknown", "Ministry of Health", "Ministry of Education"])
    tip_input = st.text_area("Tip Content", placeholder="Describe the suspected misconduct...")
    
    if st.button("🔒 Submit Tip Securely", use_container_width=True):
        if tip_input:
            log_audit_event(st.session_state.user_id, "WHISTLEBLOWER_TIP", f"Source: {tip_source}", "SUBMITTED")
            result = brain.intel.add_tip(
                text=tip_input,
                source=tip_source,
                employee_name=tip_entity if tip_entity else None,
                ministry=tip_ministry if tip_ministry != "Unknown" else None
            )
            st.success(f"✅ {result['status']}")
            st.info(f"📋 Total Tips in Database: {result['total_tips']}")
        else:
            st.warning("Please enter tip content.")

with col2:
    st.markdown("#### 🔍 Search Intelligence")
    search_query = st.text_input("Search Query", placeholder="E.g., theft, corruption, ghost worker...")
    
    if st.button("🔎 Search Intel Database", use_container_width=True):
        if search_query:
            log_audit_event(st.session_state.user_id, "INTEL_SEARCH", search_query, "EXECUTED")
            results = brain.intel.search_tips(search_query)
            if results['count'] > 0:
                st.success(f"Found {results['count']} related tips")
                for i, (doc, meta) in enumerate(zip(results['documents'], results['metadatas'])):
                    with st.expander(f"Tip {i+1}: {doc[:50]}..."):
                        st.write(doc)
                        st.caption(f"Source: {meta.get('source', 'Unknown')} | Entity: {meta.get('related_entity', 'Unknown')}")
            else:
                st.info("No matching tips found.")
        else:
            stats = brain.intel.get_stats()
            st.info(f"Database contains {stats['total_tips']} tips. Enter a search query.")

# ==================== FOOTER & AUDIT LOGS ====================
st.divider()

with st.expander("📜 View Audit Log (Admin Only)"):
    if os.path.exists(AUDIT_LOG_FILE):
        try:
            audit_df = pd.read_csv(AUDIT_LOG_FILE)
            st.dataframe(audit_df.sort_values("Timestamp", ascending=False), use_container_width=True)
        except Exception as e:
            st.error(f"Error reading audit log: {e}")
    else:
        st.info("No audit logs yet.")

st.markdown("""
<div style="text-align: center; color: #666; padding: 20px;">
    <p>🛡️ HAKIKI AI v2.0 | Sovereign Integrity Platform</p>
    <p style="font-size: 10px;">Republic of Kenya • National Treasury • Anti-Corruption Unit</p>
    <p style="font-size: 10px;">All data processed locally. No external API calls in Sovereign Mode.</p>
</div>
""", unsafe_allow_html=True)
