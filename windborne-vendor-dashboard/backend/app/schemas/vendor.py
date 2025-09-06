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


class IncomeStatementDataBase(BaseModel):
    ticker: str
    fiscal_date_ending: str
    reported_currency: str = "USD"


class IncomeStatementDataCreate(IncomeStatementDataBase):
    # Income Statement Data  
    total_revenue: Optional[float] = None
    gross_profit: Optional[float] = None
    operating_income: Optional[float] = None
    net_income: Optional[float] = None
    ebitda: Optional[float] = None
    cost_of_revenue: Optional[float] = None
    operating_expenses: Optional[float] = None
    income_before_tax: Optional[float] = None
    income_tax_expense: Optional[float] = None
    raw_data: Optional[str] = None


class IncomeStatementData(IncomeStatementDataBase):
    id: int
    total_revenue: Optional[float] = None
    gross_profit: Optional[float] = None
    operating_income: Optional[float] = None
    net_income: Optional[float] = None
    ebitda: Optional[float] = None
    cost_of_revenue: Optional[float] = None
    operating_expenses: Optional[float] = None
    income_before_tax: Optional[float] = None
    income_tax_expense: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ProfitabilityMetricsBase(BaseModel):
    ticker: str
    fiscal_date_ending: str


class CashFlowDataBase(BaseModel):
    ticker: str
    fiscal_date_ending: str
    reported_currency: str = "USD"


class CashFlowDataCreate(CashFlowDataBase):
    # Cash Flow Data  
    operating_cashflow: Optional[float] = None
    net_income: Optional[float] = None
    capital_expenditures: Optional[float] = None
    cashflow_from_investment: Optional[float] = None
    cashflow_from_financing: Optional[float] = None
    dividend_payout: Optional[float] = None
    depreciation_depletion_amortization: Optional[float] = None
    raw_data: Optional[str] = None


class CashFlowData(CashFlowDataBase):
    id: int
    operating_cashflow: Optional[float] = None
    net_income: Optional[float] = None
    capital_expenditures: Optional[float] = None
    cashflow_from_investment: Optional[float] = None
    cashflow_from_financing: Optional[float] = None
    dividend_payout: Optional[float] = None
    depreciation_depletion_amortization: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ProfitabilityMetricsCreate(ProfitabilityMetricsBase):
    net_margin: Optional[float] = None
    operating_margin: Optional[float] = None
    return_on_equity: Optional[float] = None
    revenue_cagr_3y: Optional[float] = None
    ocf_to_net_income: Optional[float] = None


class ProfitabilityMetrics(ProfitabilityMetricsBase):
    id: int
    net_margin: Optional[float] = None
    operating_margin: Optional[float] = None
    return_on_equity: Optional[float] = None
    revenue_cagr_3y: Optional[float] = None
    ocf_to_net_income: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class VendorSummary(BaseModel):
    """Summary card data for a vendor (Balance Sheet + Income Statement focus)"""
    ticker: str
    name: str
    sector: Optional[str] = None
    
    # Balance Sheet highlights  
    total_assets: Optional[float] = None
    total_current_assets: Optional[float] = None
    total_current_liabilities: Optional[float] = None
    total_shareholder_equity: Optional[float] = None
    cash_and_cash_equivalents: Optional[float] = None
    
    # Income Statement highlights
    total_revenue: Optional[float] = None
    net_income: Optional[float] = None
    operating_income: Optional[float] = None
    
    # Balance Sheet metrics
    current_ratio: Optional[float] = None
    debt_to_equity: Optional[float] = None
    quick_ratio: Optional[float] = None
    debt_ratio: Optional[float] = None
    
    # Profitability metrics
    net_margin: Optional[float] = None
    operating_margin: Optional[float] = None
    return_on_equity: Optional[float] = None
    revenue_cagr_3y: Optional[float] = None

    # Cash Quality metrics
    ocf_to_net_income: Optional[float] = None

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
