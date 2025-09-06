import httpx
import json
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from app.config import settings
import asyncio
import logging

logger = logging.getLogger(__name__)


class AlphaVantageService:
    """Service for interacting with Alpha Vantage API"""
    
    def __init__(self):
        self.base_url = settings.alpha_vantage_base_url
        self.api_key = settings.alpha_vantage_api_key
        self.client = httpx.AsyncClient(timeout=30.0)
        self._last_request_time = None
        self._min_interval = 60 / settings.requests_per_minute  # seconds between requests
    
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
        """Make a request to Alpha Vantage API with rate limiting"""
        await self._rate_limit_delay()
        
        params = {
            "function": function,
            "symbol": symbol,
            "apikey": self.api_key,
            **kwargs
        }
        
        try:
            response = await self.client.get(self.base_url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            # Check for API error messages
            if "Error Message" in data:
                logger.error(f"Alpha Vantage API error: {data['Error Message']}")
                return None
            
            if "Note" in data:
                logger.warning(f"Alpha Vantage API note: {data['Note']}")
                return None
            
            return data
            
        except httpx.HTTPError as e:
            logger.error(f"HTTP error fetching {function} for {symbol}: {e}")
            return None
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error for {symbol}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error fetching {function} for {symbol}: {e}")
            return None
    
    async def get_balance_sheet(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get balance sheet data for a symbol"""
        return await self._make_request("BALANCE_SHEET", symbol)
    
    def parse_balance_sheet(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse balance sheet data into standardized format matching Alpha Vantage fields"""
        if not data or "annualReports" not in data:
            return []
        
        parsed_reports = []
        # Use only the most recent report (latest year)
        for report in data["annualReports"][:3]:  # Keep last 3 years for trend analysis
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
    
    
    def _safe_float(self, value: Any) -> Optional[float]:
        """Safely convert a value to float, handling None strings and invalid values"""
        if value is None or value == "None" or value == "":
            return None
        
        try:
            return float(value)
        except (ValueError, TypeError):
            return None
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()


# Global instance
alpha_vantage_service = AlphaVantageService()
