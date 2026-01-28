# FILE: intelligence.py
# HAKIKI AI v2 - Whistleblower Intelligence (Vector DB)
# Uses ChromaDB for semantic search of unstructured tips

import chromadb
from chromadb.utils import embedding_functions
import uuid
import os

# CONFIG
VECTOR_DB_PATH = "./hakiki_vectors"

class WhistleblowerBrain:
    """
    Handles unstructured intelligence (whistleblower tips, voice notes, etc.)
    Uses local Vector DB for semantic search - no external API calls.
    """
    
    def __init__(self):
        # Ensure directory exists
        os.makedirs(VECTOR_DB_PATH, exist_ok=True)
        
        # Use a local embedding model (Sovereign - no API calls)
        self.client = chromadb.PersistentClient(path=VECTOR_DB_PATH)
        self.ef = embedding_functions.DefaultEmbeddingFunction()
        self.collection = self.client.get_or_create_collection(
            name="whistleblower_tips",
            embedding_function=self.ef
        )
        print(f"[INTEL] Vector DB initialized. Tips stored: {self.collection.count()}")

    def add_tip(self, text, source="Anonymous", employee_name=None, ministry=None):
        """
        Ingests a tip into the Vector DB.
        
        Args:
            text: The tip content
            source: Source of the tip (e.g., 'Voice_Note', 'Form', 'Email')
            employee_name: Related employee if known
            ministry: Related ministry if known
        """
        tip_id = str(uuid.uuid4())
        metadata = {
            "source": source,
            "related_entity": employee_name or "Unknown",
            "ministry": ministry or "Unknown",
            "timestamp": str(uuid.uuid1().time)  # Approximate timestamp
        }
        
        self.collection.add(
            documents=[text],
            metadatas=[metadata],
            ids=[tip_id]
        )
        
        print(f"[INTEL] Tip logged: {tip_id[:8]}...")
        return {
            "status": "Tip Securely Logged & Vectorized",
            "tip_id": tip_id,
            "total_tips": self.collection.count()
        }

    def search_tips(self, query, n_results=5):
        """
        Semantic search for tips related to the query.
        
        Args:
            query: Search query (natural language)
            n_results: Number of results to return
            
        Returns:
            Dictionary with documents, metadata, and distances
        """
        if self.collection.count() == 0:
            return {
                "documents": [],
                "metadatas": [],
                "message": "No tips in database yet."
            }
            
        results = self.collection.query(
            query_texts=[query],
            n_results=min(n_results, self.collection.count())
        )
        
        return {
            "documents": results.get("documents", [[]])[0],
            "metadatas": results.get("metadatas", [[]])[0],
            "distances": results.get("distances", [[]])[0],
            "count": len(results.get("documents", [[]])[0])
        }

    def correlate_with_payroll(self, payroll_df, suspect_name):
        """
        Checks if a named suspect exists in Payroll data.
        Uses fuzzy matching on Full_Name column.
        
        Args:
            payroll_df: Pandas DataFrame with payroll data
            suspect_name: Name to search for
            
        Returns:
            List of matching employee records
        """
        if payroll_df is None or payroll_df.empty:
            return []
            
        # Case-insensitive partial match
        match = payroll_df[
            payroll_df['Full_Name'].str.contains(suspect_name, case=False, na=False)
        ]
        
        if not match.empty:
            return match.to_dict(orient='records')
        return []

    def get_stats(self):
        """Returns statistics about the intelligence database."""
        return {
            "total_tips": self.collection.count(),
            "db_path": VECTOR_DB_PATH
        }


# TEST
if __name__ == "__main__":
    print("=" * 60)
    print("🕵️ HAKIKI AI - WHISTLEBLOWER INTELLIGENCE")
    print("=" * 60)
    
    intel = WhistleblowerBrain()
    
    # Add test tips
    intel.add_tip(
        text="John Kamau in Ministry of Health is receiving salary twice. He works at both Kenyatta Hospital and Nakuru County.",
        source="Voice_Note",
        employee_name="John Kamau",
        ministry="Ministry of Health"
    )
    
    intel.add_tip(
        text="Strange payments to ghost accounts in Education ministry. License number ABC123 keeps appearing.",
        source="Email",
        ministry="Ministry of Education"
    )
    
    intel.add_tip(
        text="Mary Wanjiku claims the headmaster is stealing school fees and paying himself allowances.",
        source="Form_Submission",
        employee_name="Headmaster",
        ministry="Ministry of Education"
    )
    
    # Test search
    print("\n🔍 Testing Semantic Search...")
    print("-" * 40)
    
    results = intel.search_tips("theft corruption money")
    print(f"Found {results['count']} relevant tips:")
    for i, doc in enumerate(results['documents']):
        print(f"\n{i+1}. {doc[:100]}...")
        
    print("\n✅ Intelligence Module Test Complete")
