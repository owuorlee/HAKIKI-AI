"""
In-Memory Graph Engine for HAKIKI AI v2.0
Replaces Neo4j with NetworkX for zero-dependency local operation.
"""
import networkx as nx
import pandas as pd
from typing import Dict, List, Any


class InMemoryGraph:
    """
    Singleton In-Memory Graph Database.
    Uses NetworkX DiGraph for fraud pattern detection.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(InMemoryGraph, cls).__new__(cls)
            cls._instance.graph = nx.DiGraph()
            cls._instance.df = None
        return cls._instance

    def load_data(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Loads the DataFrame into a NetworkX Graph.
        Nodes: Employee, Bank, Device.
        Edges: DEPOSITS_TO, USES_DEVICE.
        """
        G = self.graph
        G.clear()
        self.df = df
        print(f"[INFO] Ingesting {len(df)} records into Memory...")
        
        for _, row in df.iterrows():
            emp_id = str(row['Employee_ID'])
            emp_name = str(row['Full_Name'])
            bank_acc = str(row['Bank_Account'])
            bank_name = str(row['Bank_Name'])
            device_id = str(row['Device_ID'])
            fraud_type = str(row.get('Fraud_Type', 'None'))
            
            # Nodes: Group 1=Employee, 2=Bank, 3=Device
            G.add_node(emp_id, id=emp_id, name=emp_name, group=1, val=10, 
                      fraudType=fraud_type, type='employee')
            G.add_node(f"bank_{bank_acc}", id=f"bank_{bank_acc}", 
                      name=f"{bank_name} ****{bank_acc[-4:]}", group=2, val=20, type='bank')
            G.add_node(f"dev_{device_id[:8]}", id=f"dev_{device_id[:8]}", 
                      name="Device", group=3, val=15, type='device')
            
            # Edges
            G.add_edge(emp_id, f"bank_{bank_acc}", relationship="DEPOSITS_TO")
            G.add_edge(emp_id, f"dev_{device_id[:8]}", relationship="USES_DEVICE")
            
        print(f"[SUCCESS] Graph Built: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges.")
        
        return {
            "nodes": G.number_of_nodes(),
            "edges": G.number_of_edges(),
            "employees": len(df)
        }

    def get_ghost_families(self) -> List[Dict[str, Any]]:
        """Finds Bank Accounts with multiple depositors (Star Topology)"""
        G = self.graph
        suspects = []
        
        bank_nodes = [n for n, attr in G.nodes(data=True) if attr.get('group') == 2]
        
        for bank in bank_nodes:
            depositors = [n for n in G.predecessors(bank) if G.nodes[n].get('group') == 1]
            if len(set(depositors)) > 1:
                depositor_names = [G.nodes[d].get('name', d) for d in depositors]
                suspects.append({
                    "bank_account": bank,
                    "bank_name": G.nodes[bank].get('name'),
                    "shared_count": len(set(depositors)),
                    "fraudsters": depositor_names[:5]
                })
        
        return sorted(suspects, key=lambda x: x['shared_count'], reverse=True)

    def get_device_spoofing(self) -> List[Dict[str, Any]]:
        """Finds Devices shared by multiple employees"""
        G = self.graph
        suspects = []
        
        device_nodes = [n for n, attr in G.nodes(data=True) if attr.get('group') == 3]
        
        for device in device_nodes:
            users = [n for n in G.predecessors(device) if G.nodes[n].get('group') == 1]
            if len(set(users)) > 1:
                user_names = [G.nodes[u].get('name', u) for u in users]
                suspects.append({
                    "device_id": device,
                    "shared_count": len(set(users)),
                    "users": user_names[:5]
                })
        
        return sorted(suspects, key=lambda x: x['shared_count'], reverse=True)

    def get_visualization_data(self, limit: int = 500) -> Dict[str, Any]:
        """Returns JSON compatible with react-force-graph-3d"""
        G = self.graph
        
        nodes_list = list(G.nodes(data=True))[:limit]
        node_ids = set(n[0] for n in nodes_list)
        
        nodes = []
        for node_id, attrs in nodes_list:
            nodes.append({
                "id": node_id,
                "name": attrs.get('name', node_id),
                "type": attrs.get('type', 'unknown'),
                "group": attrs.get('group', 1),
                "val": attrs.get('val', 10),
                "fraudType": attrs.get('fraudType', 'None')
            })
        
        links = []
        for source, target, attrs in G.edges(data=True):
            if source in node_ids and target in node_ids:
                links.append({
                    "source": source,
                    "target": target,
                    "type": attrs.get('relationship', 'CONNECTED')
                })
        
        return {"nodes": nodes, "links": links}

    def get_stats(self) -> Dict[str, int]:
        """Get graph statistics"""
        G = self.graph
        return {
            "total_nodes": G.number_of_nodes(),
            "total_edges": G.number_of_edges(),
            "employees": len([n for n, a in G.nodes(data=True) if a.get('group') == 1]),
            "banks": len([n for n, a in G.nodes(data=True) if a.get('group') == 2]),
            "devices": len([n for n, a in G.nodes(data=True) if a.get('group') == 3])
        }


# Singleton instance
graph_db = InMemoryGraph()
