from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.models.vendor import BalanceSheetData, BalanceSheetMetrics
from app.schemas.vendor import BalanceSheetMetricsCreate
import logging

logger = logging.getLogger(__name__)


class BalanceSheetCalculator:
    """Service for calculating Balance Sheet-based financial metrics"""
    
    @staticmethod
    def calculate_liquidity_ratios(
        current_assets: Optional[float],
        current_liabilities: Optional[float],
        inventory: Optional[float] = None
    ) -> Dict[str, Optional[float]]:
        """Calculate liquidity ratios from Balance Sheet"""
        ratios = {}
        
        # Current Ratio = Current Assets / Current Liabilities
        if current_assets and current_liabilities and current_liabilities != 0:
            ratios["current_ratio"] = current_assets / current_liabilities
        else:
            ratios["current_ratio"] = None
        
        # Quick Ratio = (Current Assets - Inventory) / Current Liabilities
        if (current_assets and current_liabilities and current_liabilities != 0 and 
            inventory is not None):
            ratios["quick_ratio"] = (current_assets - inventory) / current_liabilities
        else:
            ratios["quick_ratio"] = None
        
        return ratios
    
    @staticmethod
    def calculate_leverage_ratios(
        total_debt: Optional[float],
        total_assets: Optional[float],
        shareholder_equity: Optional[float]
    ) -> Dict[str, Optional[float]]:
        """Calculate leverage ratios from Balance Sheet"""
        ratios = {}
        
        # Debt-to-Equity = Total Debt / Shareholders' Equity
        if total_debt and shareholder_equity and shareholder_equity != 0:
            ratios["debt_to_equity"] = total_debt / shareholder_equity
        else:
            ratios["debt_to_equity"] = None
        
        # Debt Ratio = Total Debt / Total Assets  
        if total_debt and total_assets and total_assets != 0:
            ratios["debt_ratio"] = total_debt / total_assets
        else:
            ratios["debt_ratio"] = None
        
        return ratios
    
    @staticmethod
    def calculate_total_debt(
        short_term_debt: Optional[float],
        long_term_debt: Optional[float],
        short_long_term_debt_total: Optional[float] = None
    ) -> Optional[float]:
        """Calculate total debt from Balance Sheet components"""
        
        # Alpha Vantage sometimes provides shortLongTermDebtTotal directly
        if short_long_term_debt_total:
            return short_long_term_debt_total
            
        # Otherwise, sum the components
        debt_components = []
        if short_term_debt:
            debt_components.append(short_term_debt)
        if long_term_debt:
            debt_components.append(long_term_debt)
            
        return sum(debt_components) if debt_components else None
    
    @staticmethod
    def calculate_risk_flags(
        current_ratio: Optional[float],
        debt_to_equity: Optional[float]
    ) -> Dict[str, bool]:
        """Calculate risk flags based on Balance Sheet ratios"""
        flags = {
            "liquidity_flag": False,
            "leverage_flag": False
        }
        
        # Liquidity flag: Current Ratio < 1.2 (company may struggle to pay short-term debts)
        if current_ratio is not None and current_ratio < 1.2:
            flags["liquidity_flag"] = True
        
        # Leverage flag: Debt-to-Equity > 2.0 (company is highly leveraged)
        if debt_to_equity is not None and debt_to_equity > 2.0:
            flags["leverage_flag"] = True
        
        return flags
    
    @classmethod
    def calculate_all_balance_sheet_metrics(
        cls,
        ticker: str,
        fiscal_date: str,
        balance_sheet_data: Dict[str, Any]
    ) -> BalanceSheetMetricsCreate:
        """Calculate all Balance Sheet metrics for a given period"""
        
        # Extract Balance Sheet data
        current_assets = balance_sheet_data.get("total_current_assets")
        current_liabilities = balance_sheet_data.get("total_current_liabilities")
        inventory = balance_sheet_data.get("inventory")
        total_assets = balance_sheet_data.get("total_assets")
        shareholder_equity = balance_sheet_data.get("total_shareholder_equity")
        
        # Calculate total debt
        total_debt = cls.calculate_total_debt(
            balance_sheet_data.get("short_term_debt"),
            balance_sheet_data.get("long_term_debt"),
            balance_sheet_data.get("short_long_term_debt_total")
        )
        
        # Calculate liquidity ratios
        liquidity_ratios = cls.calculate_liquidity_ratios(
            current_assets, current_liabilities, inventory
        )
        
        # Calculate leverage ratios
        leverage_ratios = cls.calculate_leverage_ratios(
            total_debt, total_assets, shareholder_equity
        )
        
        # Calculate risk flags
        risk_flags = cls.calculate_risk_flags(
            liquidity_ratios["current_ratio"],
            leverage_ratios["debt_to_equity"]
        )
        
        # Create the metrics object
        return BalanceSheetMetricsCreate(
            ticker=ticker,
            fiscal_date_ending=fiscal_date,
            **liquidity_ratios,
            **leverage_ratios,
            **risk_flags
        )
