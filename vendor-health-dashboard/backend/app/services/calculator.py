from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.models.vendor import BalanceSheetData, BalanceSheetMetrics, IncomeStatementData, ProfitabilityMetrics, CashFlowData
from app.schemas.vendor import BalanceSheetMetricsCreate, ProfitabilityMetricsCreate
import logging
import math

logger = logging.getLogger(__name__)


class FinancialCalculator:
    """Service for calculating financial metrics from Balance Sheet and Income Statement data"""
    
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
    
    @staticmethod
    def calculate_profitability_ratios(
        net_income: Optional[float],
        total_revenue: Optional[float],
        operating_income: Optional[float],
        shareholder_equity: Optional[float]
    ) -> Dict[str, Optional[float]]:
        """Calculate profitability ratios from Income Statement and Balance Sheet"""
        ratios = {}
        
        # Net Margin = Net Income / Total Revenue * 100
        if net_income and total_revenue and total_revenue != 0:
            ratios["net_margin"] = (net_income / total_revenue) * 100
        else:
            ratios["net_margin"] = None
        
        # Operating Margin = Operating Income / Total Revenue * 100
        if operating_income and total_revenue and total_revenue != 0:
            ratios["operating_margin"] = (operating_income / total_revenue) * 100
        else:
            ratios["operating_margin"] = None
        
        # Return on Equity = Net Income / Shareholders' Equity * 100
        if net_income and shareholder_equity and shareholder_equity != 0:
            ratios["return_on_equity"] = (net_income / shareholder_equity) * 100
        else:
            ratios["return_on_equity"] = None
        
        return ratios
    
    @staticmethod
    def calculate_cash_quality_ratios(
        operating_cashflow: Optional[float],
        net_income: Optional[float]
    ) -> Dict[str, Optional[float]]:
        """Calculate cash quality ratios from Cash Flow Statement"""
        ratios = {}
        
        # OCF-to-Net Income = Operating Cash Flow / Net Income * 100
        if operating_cashflow and net_income and net_income != 0:
            ratios["ocf_to_net_income"] = (operating_cashflow / net_income) * 100
        else:
            ratios["ocf_to_net_income"] = None
        
        return ratios
    
    @staticmethod
    def calculate_revenue_cagr_3y(revenue_data: List[Dict[str, Any]]) -> Optional[float]:
        """Calculate 3-year Revenue CAGR from historical data"""
        if len(revenue_data) < 3:
            logger.warning("Not enough data for 3-year CAGR calculation")
            return None
        
        # Sort by fiscal date (most recent first)
        sorted_data = sorted(revenue_data, key=lambda x: x.get("fiscal_date_ending", ""), reverse=True)
        
        latest_revenue = sorted_data[0].get("total_revenue")
        earliest_revenue = sorted_data[2].get("total_revenue") if len(sorted_data) >= 3 else None
        
        if not latest_revenue or not earliest_revenue or earliest_revenue <= 0:
            return None
        
        # CAGR = (Ending Value / Beginning Value)^(1/n) - 1
        # For 3 years: n = 3
        try:
            cagr = (math.pow(latest_revenue / earliest_revenue, 1/3) - 1) * 100
            return cagr
        except (ValueError, ZeroDivisionError) as e:
            logger.error(f"Error calculating CAGR: {e}")
            return None
    
    @classmethod
    def calculate_all_profitability_metrics(
        cls,
        ticker: str,
        fiscal_date: str,
        income_statement_data: Dict[str, Any],
        shareholder_equity: Optional[float],
        cash_flow_data: Dict[str, Any] = None,
        historical_revenue_data: List[Dict[str, Any]] = None
    ) -> ProfitabilityMetricsCreate:
        """Calculate all profitability metrics for a given period"""
        
        # Extract Income Statement data
        net_income = income_statement_data.get("net_income")
        total_revenue = income_statement_data.get("total_revenue") 
        operating_income = income_statement_data.get("operating_income")
        
        # Calculate profitability ratios
        profitability_ratios = cls.calculate_profitability_ratios(
            net_income, total_revenue, operating_income, shareholder_equity
        )
        
        # Calculate Revenue CAGR if historical data available
        revenue_cagr_3y = None
        if historical_revenue_data:
            revenue_cagr_3y = cls.calculate_revenue_cagr_3y(historical_revenue_data)
        
        # Calculate cash quality ratios if cash flow data available
        cash_quality_ratios = {"ocf_to_net_income": None}
        if cash_flow_data:
            operating_cashflow = cash_flow_data.get("operating_cashflow")
            cash_flow_net_income = cash_flow_data.get("net_income")
            cash_quality_ratios = cls.calculate_cash_quality_ratios(
                operating_cashflow, cash_flow_net_income
            )
        
        # Create the metrics object
        return ProfitabilityMetricsCreate(
            ticker=ticker,
            fiscal_date_ending=fiscal_date,
            **profitability_ratios,
            revenue_cagr_3y=revenue_cagr_3y,
            **cash_quality_ratios
        )
    
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
