"""
Configuration settings for HAKIKI AI v2.0
"""
import os
from pathlib import Path


class Settings:
    PROJECT_NAME: str = "HAKIKI AI v2.0"
    NEO4J_URI: str = os.getenv("NEO4J_URI", "bolt://neo4j:7687")
    NEO4J_USER: str = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "hakiki_secret_password")
    
    # Get the project root directory
    _backend_dir = Path(__file__).parent.parent.parent
    _project_dir = _backend_dir.parent
    
    # Dataset path - try multiple locations
    DATASET_PATH: str = str(_project_dir / "data" / "raw" / "hakiki_v2_synthetic_payroll.csv")
    
    @classmethod
    def get_dataset_path(cls) -> str:
        """Get a valid dataset path, checking multiple locations."""
        possible_paths = [
            cls.DATASET_PATH,
            str(Path(cls._backend_dir) / "data" / "raw" / "hakiki_v2_synthetic_payroll.csv"),
            str(Path(cls._project_dir) / "hakiki_v2_synthetic_payroll.csv"),
            "data/raw/hakiki_v2_synthetic_payroll.csv",
            "../data/raw/hakiki_v2_synthetic_payroll.csv",
            "hakiki_v2_synthetic_payroll.csv",
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                print(f"[INFO] Found dataset at: {path}")
                return path
        
        # Return default and let it fail with a proper error
        return cls.DATASET_PATH


settings = Settings()
