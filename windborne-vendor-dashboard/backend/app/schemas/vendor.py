from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime


class VendorBase(BaseModel):
    ticker: str
    name: str
    sector: Optional[str] = None
    industry: Optional[str] = None


class VendorCreate(VendorBase):
    pass


class VendorUpdate(BaseModel):
    name: Optional[str] = None
    sector: Optional[str] = None
    industry: Optional[str] = None


class Vendor(VendorBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class BalanceSheetDataBase(BaseModel):
    ticker: str
    fiscal_date_ending: str
    reported_currency: str = "USD"


class BalanceSheetDataCreate(BalanceSheetDataBase):
    # Balance Sheet Data (matching Alpha Vantage field names)
    total_assets: Optional[float] = None
    total_current_assets: Optional[float] = None
    cash_and_cash_equivalents: Optional[float] = None
    cash_and_short_term_investments: Optional[float] = None
    inventory: Optional[float] = None
    current_net_receivables: Optional[float] = None
    total_non_current_assets: Optional[float] = None
    property_plant_equipment: Optional[float] = None
    intangible_assets: Optional[float] = None
    goodwill: Optional[float] = None
    short_term_investments: Optional[float] = None
    other_current_assets: Optional[float] = None
    
    # Liabilities
    total_liabilities: Optional[float] = None
    total_current_liabilities: Optional[float] = None
    current_accounts_payable: Optional[float] = None
    current_debt: Optional[float] = None
    short_term_debt: Optional[float] = None
    total_non_current_liabilities: Optional[float] = None
    long_term_debt: Optional[float] = None
    current_long_term_debt: Optional[float] = None
    short_long_term_debt_total: Optional[float] = None
    other_current_liabilities: Optional[float] = None
    other_non_current_liabilities: Optional[float] = None
    
    # Equity
    total_shareholder_equity: Optional[float] = None
    treasury_stock: Optional[float] = None
    retained_earnings: Optional[float] = None
    common_stock: Optional[float] = None
    common_stock_shares_outstanding: Optional[float] = None
    
    # Raw data storage
    raw_data: Optional[str] = None


class BalanceSheetData(BalanceSheetDataBase):
    id: int
    total_assets: Optional[float] = None
    total_current_assets: Optional[float] = None
    cash_and_cash_equivalents: Optional[float] = None
    cash_and_short_term_investments: Optional[float] = None
    inventory: Optional[float] = None
    current_net_receivables: Optional[float] = None
    total_non_current_assets: Optional[float] = None
    property_plant_equipment: Optional[float] = None
    intangible_assets: Optional[float] = None
    goodwill: Optional[float] = None
    short_term_investments: Optional[float] = None
    other_current_assets: Optional[float] = None
    total_liabilities: Optional[float] = None
    total_current_liabilities: Optional[float] = None
    current_accounts_payable: Optional[float] = None
    current_debt: Optional[float] = None
    short_term_debt: Optional[float] = None
    total_non_current_liabilities: Optional[float] = None
    long_term_debt: Optional[float] = None
    current_long_term_debt: Optional[float] = None
    short_long_term_debt_total: Optional[float] = None
    other_current_liabilities: Optional[float] = None
    other_non_current_liabilities: Optional[float] = None
    total_shareholder_equity: Optional[float] = None
    treasury_stock: Optional[float] = None
    retained_earnings: Optional[float] = None
    common_stock: Optional[float] = None
    common_stock_shares_outstanding: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class BalanceSheetMetricsBase(BaseModel):
    ticker: str
    fiscal_date_ending: str


class BalanceSheetMetricsCreate(BalanceSheetMetricsBase):
    # Liquidity Metrics
    current_ratio: Optional[float] = None
    quick_ratio: Optional[float] = None
    
    # Leverage Metrics  
    debt_to_equity: Optional[float] = None
    debt_ratio: Optional[float] = None
    
    # Risk Flags
    liquidity_flag: bool = False
    leverage_flag: bool = False


class BalanceSheetMetrics(BalanceSheetMetricsBase):
    id: int
    current_ratio: Optional[float] = None
    quick_ratio: Optional[float] = None
    debt_to_equity: Optional[float] = None
    debt_ratio: Optional[float] = None
    liquidity_flag: bool = False
    leverage_flag: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class VendorSummary(BaseModel):
    """Summary card data for a vendor (Balance Sheet focus)"""
    ticker: str
    name: str
    sector: Optional[str] = None
    
    # Balance Sheet highlights  
    total_assets: Optional[float] = None
    total_current_assets: Optional[float] = None
    total_current_liabilities: Optional[float] = None
    total_shareholder_equity: Optional[float] = None
    cash_and_cash_equivalents: Optional[float] = None
    
    # Key metrics (from Balance Sheet only)
    current_ratio: Optional[float] = None
    debt_to_equity: Optional[float] = None
    quick_ratio: Optional[float] = None
    debt_ratio: Optional[float] = None
    
    # Flags
    liquidity_flag: bool = False
    leverage_flag: bool = False
    
    last_updated: Optional[datetime] = None


class VendorComparison(BaseModel):
    """Data for vendor comparison table"""
    vendors: List[VendorSummary]


class TrendData(BaseModel):
    """Historical trend data for charts"""
    fiscal_date_ending: str
    total_revenue: Optional[float] = None
    net_income: Optional[float] = None
    operating_cash_flow: Optional[float] = None


class VendorTrends(BaseModel):
    """Trend data for a specific vendor"""
    ticker: str
    name: str
    trends: List[TrendData]
