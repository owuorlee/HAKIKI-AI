"""
Neo4j Database Client for HAKIKI AI v2.0
Handles connection management and session context.
"""
from contextlib import contextmanager
from typing import Generator
from neo4j import GraphDatabase, Driver, Session
from app.core.config import settings


class Neo4jClient:
    """
    Neo4j Database Client with connection pooling and session management.
    """
    
    def __init__(self):
        self._driver: Driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
        )
        self._verify_connection()
    
    def _verify_connection(self) -> None:
        """Verify the database connection is working."""
        try:
            with self._driver.session() as session:
                session.run("RETURN 1")
            print("✅ Neo4j connection established successfully")
        except Exception as e:
            print(f"❌ Neo4j connection failed: {e}")
            raise
    
    @contextmanager
    def get_session(self) -> Generator[Session, None, None]:
        """
        Context manager for Neo4j sessions.
        Ensures proper session cleanup after use.
        
        Usage:
            with client.get_session() as session:
                session.run("MATCH (n) RETURN n")
        """
        session = self._driver.session()
        try:
            yield session
        finally:
            session.close()
    
    def close(self) -> None:
        """Close the driver connection and release all resources."""
        if self._driver:
            self._driver.close()
            print("🔌 Neo4j connection closed")
    
    def run_query(self, query: str, parameters: dict = None) -> list:
        """
        Execute a Cypher query and return results as a list of dicts.
        
        Args:
            query: Cypher query string
            parameters: Query parameters
            
        Returns:
            List of result records as dictionaries
        """
        with self.get_session() as session:
            result = session.run(query, parameters or {})
            return [record.data() for record in result]


# Singleton instance for application-wide use
neo4j_client: Neo4jClient = None


def get_neo4j_client() -> Neo4jClient:
    """Get or create the Neo4j client singleton."""
    global neo4j_client
    if neo4j_client is None:
        neo4j_client = Neo4jClient()
    return neo4j_client


def close_neo4j_client() -> None:
    """Close the Neo4j client connection."""
    global neo4j_client
    if neo4j_client:
        neo4j_client.close()
        neo4j_client = None
