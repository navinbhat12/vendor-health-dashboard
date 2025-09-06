import httpx
import json
import os
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from dotenv import load_dotenv
from app.config import settings
import asyncio
import logging

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)


class AlphaVantageService:
    """Service for interacting with Alpha Vantage API with key rotation support"""
    
    def __init__(self):
        self.base_url = settings.alpha_vantage_base_url
        self.current_key_index = 0
        self.client = httpx.AsyncClient(timeout=30.0)
        self._last_request_time = None
        self._min_interval = 60 / settings.requests_per_minute  # seconds between requests
        self._key_usage_count = {}  # Track usage per key - initialize first
        self.api_keys = self._load_api_keys()  # Load keys after initializing usage tracker
        
    def _load_api_keys(self) -> List[str]:
        """Load all available API keys from environment variables"""
        keys = []
        
        # Primary key
        primary_key = settings.alpha_vantage_api_key
        if primary_key:
            keys.append(primary_key)
        
        # Additional keys
        i = 1
        while True:
            additional_key = os.getenv(f'ALPHA_VANTAGE_API_KEY_{i}')
            if additional_key:
                keys.append(additional_key)
                i += 1
            else:
                break
        
        logger.info(f"Loaded {len(keys)} API key(s) for rotation")
        
        # Initialize usage tracking
        for key in keys:
            self._key_usage_count[key] = 0
            
        return keys
    
    def get_current_api_key(self) -> str:
        """Get the current API key for requests"""
        if not self.api_keys:
            raise ValueError("No API keys available")
        return self.api_keys[self.current_key_index]
    
    def rotate_api_key(self):
        """Rotate to the next available API key"""
        if len(self.api_keys) > 1:
            old_key = self.get_current_api_key()
            self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
            new_key = self.get_current_api_key()
            logger.info(f"Rotated from key {old_key[:8]}... to {new_key[:8]}...")
    
    def get_key_status(self) -> Dict[str, Any]:
        """Get status information about all keys"""
        return {
            "total_keys": len(self.api_keys),
            "current_key": f"{self.get_current_api_key()[:8]}..." if self.api_keys else "None",
            "current_index": self.current_key_index,
            "usage_counts": {f"{key[:8]}...": count for key, count in self._key_usage_count.items()}
        }
    
    async def _rate_limit_delay(self):
        """Ensure we don't exceed rate limits"""
        if self._last_request_time:
            elapsed = (datetime.now() - self._last_request_time).total_seconds()
            if elapsed < self._min_interval:
                delay = self._min_interval - elapsed
                logger.info(f"Rate limiting: waiting {delay:.2f} seconds")
                await asyncio.sleep(delay)
        self._last_request_time = datetime.now()
    
    async def _make_request(self, function: str, symbol: str, **kwargs) -> Optional[Dict[str, Any]]:
        """Make a request to Alpha Vantage API with rate limiting and key rotation"""
        max_retries = len(self.api_keys)
        
        for attempt in range(max_retries):
            await self._rate_limit_delay()
            
            current_key = self.get_current_api_key()
            params = {
                "function": function,
                "symbol": symbol,
                "apikey": current_key,
                **kwargs
            }
            
            try:
                response = await self.client.get(self.base_url, params=params)
                response.raise_for_status()
                
                data = response.json()
                
                # Track usage for this key
                self._key_usage_count[current_key] += 1
                
                # Check for API error messages
                if "Error Message" in data:
                    logger.error(f"Alpha Vantage API error: {data['Error Message']}")
                    return None
                
                # Check for rate limiting or API limit messages
                if "Note" in data or "Information" in data:
                    message = data.get("Note") or data.get("Information", "")
                    logger.warning(f"Alpha Vantage API message: {message}")
                    
                    # If rate limited and we have more keys, rotate and retry
                    if ("rate limit" in message.lower() or "premium" in message.lower()) and len(self.api_keys) > 1:
                        logger.info(f"Rate limited on key {current_key[:8]}..., rotating to next key")
                        self.rotate_api_key()
                        continue
                    
                    return None
                
                logger.debug(f"Successful API call for {function}/{symbol} using key {current_key[:8]}...")
                return data
                
            except httpx.HTTPError as e:
                logger.error(f"HTTP error fetching {function} for {symbol}: {e}")
                # Don't rotate on HTTP errors, they're usually not rate limit related
                return None
            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error for {symbol}: {e}")
                return None
            except Exception as e:
                logger.error(f"Unexpected error fetching {function} for {symbol}: {e}")
                return None
        
        logger.error(f"Failed to fetch {function} for {symbol} after trying all {max_retries} API keys")
        return None
    
    async def get_balance_sheet(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get balance sheet data for a symbol"""
        return await self._make_request("BALANCE_SHEET", symbol)
    
    async def get_income_statement(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get income statement data for a symbol"""
        return await self._make_request("INCOME_STATEMENT", symbol)
    
    async def get_cash_flow(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get cash flow data for a symbol"""
        return await self._make_request("CASH_FLOW", symbol)
    
    def parse_balance_sheet(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse balance sheet data into standardized format matching Alpha Vantage fields"""
        if not data or "annualReports" not in data:
            return []
        
        parsed_reports = []
        # Use the most recent 10 years for comprehensive trend analysis
        for report in data["annualReports"][:10]:
            try:
                parsed_report = {
                    "ticker": data.get("symbol"),
                    "fiscal_date_ending": report.get("fiscalDateEnding"),
                    "reported_currency": report.get("reportedCurrency", "USD"),
                    
                    # Assets (matching Alpha Vantage field names exactly)
                    "total_assets": self._safe_float(report.get("totalAssets")),
                    "total_current_assets": self._safe_float(report.get("totalCurrentAssets")),
                    "cash_and_cash_equivalents": self._safe_float(report.get("cashAndCashEquivalentsAtCarryingValue")),
                    "cash_and_short_term_investments": self._safe_float(report.get("cashAndShortTermInvestments")),
                    "inventory": self._safe_float(report.get("inventory")),
                    "current_net_receivables": self._safe_float(report.get("currentNetReceivables")),
                    "total_non_current_assets": self._safe_float(report.get("totalNonCurrentAssets")),
                    "property_plant_equipment": self._safe_float(report.get("propertyPlantEquipment")),
                    "intangible_assets": self._safe_float(report.get("intangibleAssets")),
                    "goodwill": self._safe_float(report.get("goodwill")),
                    "short_term_investments": self._safe_float(report.get("shortTermInvestments")),
                    "other_current_assets": self._safe_float(report.get("otherCurrentAssets")),
                    
                    # Liabilities  
                    "total_liabilities": self._safe_float(report.get("totalLiabilities")),
                    "total_current_liabilities": self._safe_float(report.get("totalCurrentLiabilities")),
                    "current_accounts_payable": self._safe_float(report.get("currentAccountsPayable")),
                    "current_debt": self._safe_float(report.get("currentDebt")),
                    "short_term_debt": self._safe_float(report.get("shortTermDebt")),
                    "total_non_current_liabilities": self._safe_float(report.get("totalNonCurrentLiabilities")),
                    "long_term_debt": self._safe_float(report.get("longTermDebt")),
                    "current_long_term_debt": self._safe_float(report.get("currentLongTermDebt")),
                    "short_long_term_debt_total": self._safe_float(report.get("shortLongTermDebtTotal")),
                    "other_current_liabilities": self._safe_float(report.get("otherCurrentLiabilities")),
                    "other_non_current_liabilities": self._safe_float(report.get("otherNonCurrentLiabilities")),
                    
                    # Equity
                    "total_shareholder_equity": self._safe_float(report.get("totalShareholderEquity")),
                    "treasury_stock": self._safe_float(report.get("treasuryStock")),
                    "retained_earnings": self._safe_float(report.get("retainedEarnings")),
                    "common_stock": self._safe_float(report.get("commonStock")),
                    "common_stock_shares_outstanding": self._safe_float(report.get("commonStockSharesOutstanding")),
                    
                    "raw_data": json.dumps(report)
                }
                parsed_reports.append(parsed_report)
            except Exception as e:
                logger.error(f"Error parsing balance sheet report: {e}")
                continue
        
        return parsed_reports
    
    def parse_income_statement(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse income statement data into standardized format"""
        if not data or "annualReports" not in data:
            return []
        
        parsed_reports = []
        # Use the most recent 10 years for comprehensive trend analysis
        for report in data["annualReports"][:10]:
            try:
                parsed_report = {
                    "ticker": data.get("symbol"),
                    "fiscal_date_ending": report.get("fiscalDateEnding"),
                    "reported_currency": report.get("reportedCurrency", "USD"),
                    
                    # Revenue and Profitability
                    "total_revenue": self._safe_float(report.get("totalRevenue")),
                    "gross_profit": self._safe_float(report.get("grossProfit")),
                    "operating_income": self._safe_float(report.get("operatingIncome")),
                    "net_income": self._safe_float(report.get("netIncome")),
                    "ebitda": self._safe_float(report.get("ebitda")),
                    
                    # Additional useful fields
                    "cost_of_revenue": self._safe_float(report.get("costOfRevenue")),
                    "operating_expenses": self._safe_float(report.get("operatingExpenses")),
                    "income_before_tax": self._safe_float(report.get("incomeBeforeTax")),
                    "income_tax_expense": self._safe_float(report.get("incomeTaxExpense")),
                    
                    "raw_data": json.dumps(report)
                }
                parsed_reports.append(parsed_report)
            except Exception as e:
                logger.error(f"Error parsing income statement report: {e}")
                continue
        
        return parsed_reports
    
    def parse_cash_flow(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse cash flow data into standardized format"""
        if not data or "annualReports" not in data:
            return []
        
        parsed_reports = []
        # Use the most recent 10 years for comprehensive trend analysis
        for report in data["annualReports"][:10]:
            try:
                parsed_report = {
                    "ticker": data.get("symbol"),
                    "fiscal_date_ending": report.get("fiscalDateEnding"),
                    "reported_currency": report.get("reportedCurrency", "USD"),
                    
                    # Key cash flow metrics
                    "operating_cashflow": self._safe_float(report.get("operatingCashflow")),
                    "net_income": self._safe_float(report.get("netIncome")),
                    "capital_expenditures": self._safe_float(report.get("capitalExpenditures")),
                    "cashflow_from_investment": self._safe_float(report.get("cashflowFromInvestment")),
                    "cashflow_from_financing": self._safe_float(report.get("cashflowFromFinancing")),
                    "dividend_payout": self._safe_float(report.get("dividendPayout")),
                    "depreciation_depletion_amortization": self._safe_float(report.get("depreciationDepletionAndAmortization")),
                    
                    "raw_data": json.dumps(report)
                }
                parsed_reports.append(parsed_report)
            except Exception as e:
                logger.error(f"Error parsing cash flow report: {e}")
                continue
        
        return parsed_reports
    
    def _safe_float(self, value: Any) -> Optional[float]:
        """Safely convert a value to float, handling None strings and invalid values"""
        if value is None or value == "None" or value == "":
            return None
        
        try:
            return float(value)
        except (ValueError, TypeError):
            return None
    
    async def get_company_overview(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Fetch company overview data for a symbol"""
        try:
            await self._rate_limit_delay()
            
            params = {
                "function": "OVERVIEW",
                "symbol": symbol,
                "apikey": self.api_key
            }
            
            response = await self.client.get(self.base_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            # Check for API errors
            if "Error Message" in data:
                logger.error(f"Alpha Vantage API error for {symbol}: {data['Error Message']}")
                return None
            
            if "Information" in data:
                logger.warning(f"Alpha Vantage API info for {symbol}: {data['Information']}")
                return None
            
            return data
            
        except Exception as e:
            logger.error(f"Error fetching company overview for {symbol}: {e}")
            return None

    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()


# Global instance
alpha_vantage_service = AlphaVantageService()
