from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.sql import func
from app.database import Base


class Vendor(Base):
    __tablename__ = "vendors"
    
    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String(10), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    sector = Column(String(100))
    industry = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class BalanceSheetData(Base):
    __tablename__ = "balance_sheet_data"
    
    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String(10), index=True, nullable=False)
    fiscal_date_ending = Column(String(10), nullable=False)  # YYYY-MM-DD format
    
    # Balance Sheet Data (key fields from Alpha Vantage)
    reported_currency = Column(String(5), default="USD")
    total_assets = Column(Float)
    total_current_assets = Column(Float)
    cash_and_cash_equivalents = Column(Float)
    cash_and_short_term_investments = Column(Float)
    inventory = Column(Float)
    current_net_receivables = Column(Float)
    total_non_current_assets = Column(Float)
    property_plant_equipment = Column(Float)
    intangible_assets = Column(Float)
    goodwill = Column(Float)
    short_term_investments = Column(Float)
    other_current_assets = Column(Float)
    
    # Liabilities
    total_liabilities = Column(Float)
    total_current_liabilities = Column(Float)
    current_accounts_payable = Column(Float)
    current_debt = Column(Float)
    short_term_debt = Column(Float)
    total_non_current_liabilities = Column(Float)
    long_term_debt = Column(Float)
    current_long_term_debt = Column(Float)
    short_long_term_debt_total = Column(Float)
    other_current_liabilities = Column(Float)
    other_non_current_liabilities = Column(Float)
    
    # Equity
    total_shareholder_equity = Column(Float)
    treasury_stock = Column(Float)
    retained_earnings = Column(Float)
    common_stock = Column(Float)
    common_stock_shares_outstanding = Column(Float)
    
    # Metadata
    raw_data = Column(Text)  # Store original JSON response
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class BalanceSheetMetrics(Base):
    __tablename__ = "balance_sheet_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String(10), index=True, nullable=False)
    fiscal_date_ending = Column(String(10), nullable=False)
    
    # Liquidity Metrics (from Balance Sheet)
    current_ratio = Column(Float)  # Current Assets / Current Liabilities
    quick_ratio = Column(Float)    # (Current Assets - Inventory) / Current Liabilities
    
    # Leverage Metrics (from Balance Sheet)
    debt_to_equity = Column(Float)  # Total Debt / Shareholders' Equity
    debt_ratio = Column(Float)      # Total Debt / Total Assets
    
    # Asset Quality Metrics
    asset_turnover = Column(Float)  # Would need revenue, so skip for now
    
    # Risk Flags (based on Balance Sheet ratios)
    liquidity_flag = Column(Boolean, default=False)  # Current Ratio < 1.2
    leverage_flag = Column(Boolean, default=False)   # Debt-to-Equity > 2.0
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
