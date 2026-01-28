from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from decimal import Decimal

class EmployeeBase(BaseModel):
    national_id: str = Field(..., pattern=r"^\d{7,8}$", description="Kenyan National ID")
    kra_pin: str = Field(..., pattern=r"^A\d{9}[A-Z]$", description="KRA PIN Format")
    full_name: str
    date_of_birth: str

class FinancialDetails(BaseModel):
    basic_salary: Decimal = Field(..., gt=0)
    house_allowance: Decimal = Field(..., ge=0)
    commuter_allowance: Decimal = Field(..., ge=0)
    gross_salary: Decimal
    bank_account: str
    bank_name: str

class EmploymentDetails(BaseModel):
    employee_id: str
    job_group: Literal['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T']
    department: str
    duty_station: str
    station_lat: Optional[float] = None 
    station_long: Optional[float] = None

class PayrollRecord(EmployeeBase, FinancialDetails, EmploymentDetails):
    risk_label: int = Field(default=0)
    fraud_type: Optional[str] = None
