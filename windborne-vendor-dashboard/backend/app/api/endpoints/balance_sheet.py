from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api.deps import get_database, get_alphavantage_service
from app.models.vendor import Vendor, BalanceSheetData, BalanceSheetMetrics, IncomeStatementData, ProfitabilityMetrics, CashFlowData
from app.schemas.vendor import (
    Vendor as VendorSchema,
    VendorCreate,
    VendorSummary,
    VendorComparison,
    BalanceSheetData as BalanceSheetDataSchema,
    BalanceSheetMetrics as BalanceSheetMetricsSchema,
    IncomeStatementData as IncomeStatementDataSchema,
    ProfitabilityMetrics as ProfitabilityMetricsSchema
)
from app.services.alphavantage import AlphaVantageService
from app.services.calculator import FinancialCalculator
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Target vendors for WindBorne Systems
TARGET_VENDORS = [
    {"ticker": "TEL", "name": "TE Connectivity", "sector": "Technology", "industry": "Electronic Components"},
    {"ticker": "ST", "name": "Sensata Technologies", "sector": "Technology", "industry": "Electronic Components"},
    {"ticker": "DD", "name": "DuPont de Nemours", "sector": "Materials", "industry": "Chemicals"},
    {"ticker": "CE", "name": "Celanese", "sector": "Materials", "industry": "Chemicals"},
    {"ticker": "LYB", "name": "LyondellBasell", "sector": "Materials", "industry": "Chemicals"},
]


@router.get("/vendors", response_model=List[VendorSchema])
async def get_vendors(db: Session = Depends(get_database)):
    """Get all vendors"""
    vendors = db.query(Vendor).all()
    return vendors


@router.post("/vendors", response_model=VendorSchema)
async def create_vendor(
    vendor: VendorCreate,
    db: Session = Depends(get_database)
):
    """Create a new vendor"""
    # Check if vendor already exists
    existing_vendor = db.query(Vendor).filter(Vendor.ticker == vendor.ticker).first()
    if existing_vendor:
        raise HTTPException(status_code=400, detail="Vendor with this ticker already exists")
    
    db_vendor = Vendor(**vendor.dict())
    db.add(db_vendor)
    db.commit()
    db.refresh(db_vendor)
    return db_vendor


@router.get("/vendors/{ticker}", response_model=VendorSchema)
async def get_vendor(ticker: str, db: Session = Depends(get_database)):
    """Get vendor by ticker"""
    vendor = db.query(Vendor).filter(Vendor.ticker == ticker.upper()).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor


@router.post("/vendors/{ticker}/refresh-balance-sheet")
async def refresh_vendor_balance_sheet(
    ticker: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_database),
    av_service: AlphaVantageService = Depends(get_alphavantage_service)
):
    """Refresh balance sheet data for a vendor"""
    ticker = ticker.upper()
    
    # Check if vendor exists, create if not
    vendor = db.query(Vendor).filter(Vendor.ticker == ticker).first()
    if not vendor:
        # Try to find vendor in target list first
        target_vendor = next((v for v in TARGET_VENDORS if v["ticker"] == ticker), None)
        
        if target_vendor:
            # Use predefined vendor info
            vendor_create = VendorCreate(**target_vendor)
            vendor = Vendor(**vendor_create.dict())
        else:
            # For dynamic vendors, create with minimal info (will be populated from API data)
            vendor_create = VendorCreate(
                ticker=ticker,
                name=f"{ticker} Corporation",  # Placeholder name
                sector="Unknown",  # Will be updated when we get company overview
                industry="Unknown"
            )
            vendor = Vendor(**vendor_create.dict())
        
        db.add(vendor)
        db.commit()
        db.refresh(vendor)
    
    # Add background task to fetch data
    background_tasks.add_task(fetch_financial_data, ticker, av_service)
    
    return {"message": f"Balance sheet data refresh initiated for {ticker}"}


@router.get("/vendors/{ticker}/balance-sheet", response_model=List[BalanceSheetDataSchema])
async def get_vendor_balance_sheet(ticker: str, db: Session = Depends(get_database)):
    """Get balance sheet data for a vendor"""
    ticker = ticker.upper()
    
    balance_sheet_data = (
        db.query(BalanceSheetData)
        .filter(BalanceSheetData.ticker == ticker)
        .order_by(desc(BalanceSheetData.fiscal_date_ending))
        .all()
    )
    
    return balance_sheet_data


@router.get("/vendors/{ticker}/balance-sheet-metrics", response_model=List[BalanceSheetMetricsSchema])
async def get_vendor_balance_sheet_metrics(ticker: str, db: Session = Depends(get_database)):
    """Get calculated balance sheet metrics for a vendor"""
    ticker = ticker.upper()
    
    metrics = (
        db.query(BalanceSheetMetrics)
        .filter(BalanceSheetMetrics.ticker == ticker)
        .order_by(desc(BalanceSheetMetrics.fiscal_date_ending))
        .all()
    )
    
    return metrics


def _get_vendor_summary_data(ticker: str, db: Session) -> VendorSummary:
    """Helper function to get vendor summary data using an existing database session"""
    ticker = ticker.upper()
    
    vendor = db.query(Vendor).filter(Vendor.ticker == ticker).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    # Get latest balance sheet data
    latest_balance_sheet = (
        db.query(BalanceSheetData)
        .filter(BalanceSheetData.ticker == ticker)
        .order_by(desc(BalanceSheetData.fiscal_date_ending))
        .first()
    )
    
    # Get latest calculated balance sheet metrics
    latest_metrics = (
        db.query(BalanceSheetMetrics)
        .filter(BalanceSheetMetrics.ticker == ticker)
        .order_by(desc(BalanceSheetMetrics.fiscal_date_ending))
        .first()
    )
    
    # Get latest income statement data
    latest_income_statement = (
        db.query(IncomeStatementData)
        .filter(IncomeStatementData.ticker == ticker)
        .order_by(desc(IncomeStatementData.fiscal_date_ending))
        .first()
    )
    
    # Get latest profitability metrics
    latest_profitability_metrics = (
        db.query(ProfitabilityMetrics)
        .filter(ProfitabilityMetrics.ticker == ticker)
        .order_by(desc(ProfitabilityMetrics.fiscal_date_ending))
        .first()
    )
    
    summary = VendorSummary(
        ticker=vendor.ticker,
        name=vendor.name,
        sector=vendor.sector,
        # Balance Sheet highlights
        total_assets=latest_balance_sheet.total_assets if latest_balance_sheet else None,
        total_current_assets=latest_balance_sheet.total_current_assets if latest_balance_sheet else None,
        total_current_liabilities=latest_balance_sheet.total_current_liabilities if latest_balance_sheet else None,
        total_shareholder_equity=latest_balance_sheet.total_shareholder_equity if latest_balance_sheet else None,
        cash_and_cash_equivalents=latest_balance_sheet.cash_and_cash_equivalents if latest_balance_sheet else None,
        # Income Statement highlights
        total_revenue=latest_income_statement.total_revenue if latest_income_statement else None,
        net_income=latest_income_statement.net_income if latest_income_statement else None,
        operating_income=latest_income_statement.operating_income if latest_income_statement else None,
        # Balance Sheet metrics
        current_ratio=latest_metrics.current_ratio if latest_metrics else None,
        debt_to_equity=latest_metrics.debt_to_equity if latest_metrics else None,
        quick_ratio=latest_metrics.quick_ratio if latest_metrics else None,
        debt_ratio=latest_metrics.debt_ratio if latest_metrics else None,
        # Profitability metrics
        net_margin=latest_profitability_metrics.net_margin if latest_profitability_metrics else None,
        operating_margin=latest_profitability_metrics.operating_margin if latest_profitability_metrics else None,
        return_on_equity=latest_profitability_metrics.return_on_equity if latest_profitability_metrics else None,
        revenue_cagr_3y=latest_profitability_metrics.revenue_cagr_3y if latest_profitability_metrics else None,
        # Cash Quality metrics
        ocf_to_net_income=latest_profitability_metrics.ocf_to_net_income if latest_profitability_metrics else None,
        # Flags
        liquidity_flag=latest_metrics.liquidity_flag if latest_metrics else False,
        leverage_flag=latest_metrics.leverage_flag if latest_metrics else False,
        last_updated=latest_balance_sheet.updated_at if latest_balance_sheet else None
    )
    
    return summary


@router.get("/vendors/{ticker}/summary", response_model=VendorSummary)
async def get_vendor_summary(ticker: str, db: Session = Depends(get_database)):
    """Get vendor summary for dashboard card"""
    return _get_vendor_summary_data(ticker, db)


@router.get("/comparison", response_model=VendorComparison)
async def get_vendor_comparison(db: Session = Depends(get_database)):
    """Get comparison data for all vendors"""
    summaries = []
    
    for target_vendor in TARGET_VENDORS:
        try:
            summary = _get_vendor_summary_data(target_vendor["ticker"], db)
            summaries.append(summary)
        except HTTPException:
            # If vendor data not available, create empty summary
            empty_summary = VendorSummary(
                ticker=target_vendor["ticker"],
                name=target_vendor["name"],
                sector=target_vendor["sector"]
            )
            summaries.append(empty_summary)
    
    return VendorComparison(vendors=summaries)


@router.post("/initialize-vendors")
async def initialize_target_vendors(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_database),
    av_service: AlphaVantageService = Depends(get_alphavantage_service)
):
    """Initialize all target vendors and fetch their balance sheet data"""
    created_vendors = []
    
    for target_vendor in TARGET_VENDORS:
        # Check if vendor exists
        existing_vendor = db.query(Vendor).filter(
            Vendor.ticker == target_vendor["ticker"]
        ).first()
        
        if not existing_vendor:
            # Create vendor
            vendor_create = VendorCreate(**target_vendor)
            vendor = Vendor(**vendor_create.dict())
            db.add(vendor)
            db.commit()
            db.refresh(vendor)
            created_vendors.append(vendor.ticker)
            
        # Add background task to fetch balance sheet and income statement data
        background_tasks.add_task(
            fetch_financial_data, 
            target_vendor["ticker"],
            av_service
        )
    
    return {
        "message": f"Initialized {len(created_vendors)} vendors",
        "created_vendors": created_vendors
    }


async def fetch_financial_data(
    ticker: str,
    av_service: AlphaVantageService
):
    """Background task to fetch balance sheet and income statement data for a vendor"""
    from app.database import SessionLocal
    
    # Create a new database session for this background task
    db = SessionLocal()
    
    try:
        logger.info(f"Fetching financial data for {ticker}")
        
        # For dynamic vendors, try to get company overview to update name and sector
        vendor = db.query(Vendor).filter(Vendor.ticker == ticker).first()
        if vendor and (vendor.name == f"{ticker} Corporation" or vendor.sector == "Unknown"):
            logger.info(f"Fetching company overview for dynamic vendor {ticker}")
            overview_data = await av_service.get_company_overview(ticker)
            if overview_data:
                # Update vendor with real company info
                vendor.name = overview_data.get("Name", vendor.name)
                vendor.sector = overview_data.get("Sector", vendor.sector)
                vendor.industry = overview_data.get("Industry", vendor.industry)
                db.commit()
                logger.info(f"Updated company info for {ticker}: {vendor.name}")
        
        # Fetch balance sheet data from Alpha Vantage
        balance_sheet_data = await av_service.get_balance_sheet(ticker)
        
        if not balance_sheet_data:
            logger.error(f"Failed to fetch balance sheet data for {ticker}")
            return
        
        # Fetch income statement data from Alpha Vantage
        income_statement_data = await av_service.get_income_statement(ticker)
        
        if not income_statement_data:
            logger.error(f"Failed to fetch income statement data for {ticker}")
            # Continue with just balance sheet data
        
        # Fetch cash flow data from Alpha Vantage
        cash_flow_data = await av_service.get_cash_flow(ticker)
        
        if not cash_flow_data:
            logger.error(f"Failed to fetch cash flow data for {ticker}")
            # Continue without cash flow data
        
        # Parse and store balance sheet data
        balance_sheet_reports = av_service.parse_balance_sheet(balance_sheet_data)
        
        for report in balance_sheet_reports:
            # Check if this data already exists
            existing_data = db.query(BalanceSheetData).filter(
                BalanceSheetData.ticker == ticker,
                BalanceSheetData.fiscal_date_ending == report["fiscal_date_ending"]
            ).first()
            
            if not existing_data:
                # Remove ticker from report data since it's already in the model
                report_data = {k: v for k, v in report.items() if k != "ticker"}
                balance_sheet = BalanceSheetData(ticker=ticker, **report_data)
                db.add(balance_sheet)
        
        # Parse and store income statement data if available
        income_statement_reports = []
        if income_statement_data:
            income_statement_reports = av_service.parse_income_statement(income_statement_data)
            
            for report in income_statement_reports:
                # Check if this data already exists
                existing_data = db.query(IncomeStatementData).filter(
                    IncomeStatementData.ticker == ticker,
                    IncomeStatementData.fiscal_date_ending == report["fiscal_date_ending"]
                ).first()
                
                if not existing_data:
                    # Remove ticker from report data since it's already in the model
                    report_data = {k: v for k, v in report.items() if k != "ticker"}
                    income_statement = IncomeStatementData(ticker=ticker, **report_data)
                    db.add(income_statement)
        
        # Parse and store cash flow data if available
        cash_flow_reports = []
        if cash_flow_data:
            cash_flow_reports = av_service.parse_cash_flow(cash_flow_data)
            
            for report in cash_flow_reports:
                # Check if this data already exists
                existing_data = db.query(CashFlowData).filter(
                    CashFlowData.ticker == ticker,
                    CashFlowData.fiscal_date_ending == report["fiscal_date_ending"]
                ).first()
                
                if not existing_data:
                    # Remove ticker from report data since it's already in the model
                    report_data = {k: v for k, v in report.items() if k != "ticker"}
                    cash_flow = CashFlowData(ticker=ticker, **report_data)
                    db.add(cash_flow)
        
        db.commit()
        
        # Calculate balance sheet metrics for each period
        balance_sheet_records = db.query(BalanceSheetData).filter(
            BalanceSheetData.ticker == ticker
        ).order_by(desc(BalanceSheetData.fiscal_date_ending)).all()
        
        for record in balance_sheet_records:
            # Check if metrics already calculated
            existing_metrics = db.query(BalanceSheetMetrics).filter(
                BalanceSheetMetrics.ticker == ticker,
                BalanceSheetMetrics.fiscal_date_ending == record.fiscal_date_ending
            ).first()
            
            if not existing_metrics:
                # Prepare balance sheet data for calculation
                balance_sheet_data_dict = {
                    "total_current_assets": record.total_current_assets,
                    "total_current_liabilities": record.total_current_liabilities,
                    "inventory": record.inventory,
                    "short_term_debt": record.short_term_debt,
                    "long_term_debt": record.long_term_debt,
                    "short_long_term_debt_total": record.short_long_term_debt_total,
                    "total_assets": record.total_assets,
                    "total_shareholder_equity": record.total_shareholder_equity,
                }
                
                # Calculate metrics
                metrics = FinancialCalculator.calculate_all_balance_sheet_metrics(
                    ticker=ticker,
                    fiscal_date=record.fiscal_date_ending,
                    balance_sheet_data=balance_sheet_data_dict
                )
                
                # Store metrics
                calculated_metrics = BalanceSheetMetrics(**metrics.dict())
                db.add(calculated_metrics)
        
        # Calculate profitability metrics if income statement data available
        if income_statement_reports:
            income_statement_records = db.query(IncomeStatementData).filter(
                IncomeStatementData.ticker == ticker
            ).order_by(desc(IncomeStatementData.fiscal_date_ending)).all()
            
            for i, record in enumerate(income_statement_records):
                # Check if metrics already calculated
                existing_profitability_metrics = db.query(ProfitabilityMetrics).filter(
                    ProfitabilityMetrics.ticker == ticker,
                    ProfitabilityMetrics.fiscal_date_ending == record.fiscal_date_ending
                ).first()
                
                if not existing_profitability_metrics:
                    # Get corresponding balance sheet data for ROE calculation
                    balance_sheet_record = db.query(BalanceSheetData).filter(
                        BalanceSheetData.ticker == ticker,
                        BalanceSheetData.fiscal_date_ending == record.fiscal_date_ending
                    ).first()
                    
                    shareholder_equity = balance_sheet_record.total_shareholder_equity if balance_sheet_record else None
                    
                    # Prepare income statement data for calculation
                    income_statement_data_dict = {
                        "net_income": record.net_income,
                        "total_revenue": record.total_revenue,
                        "operating_income": record.operating_income,
                    }
                    
                    # Prepare historical revenue data for CAGR (use current and previous records)
                    historical_revenue_data = []
                    for j in range(min(3, len(income_statement_records))):
                        if i + j < len(income_statement_records):
                            historical_revenue_data.append({
                                "fiscal_date_ending": income_statement_records[i + j].fiscal_date_ending,
                                "total_revenue": income_statement_records[i + j].total_revenue
                            })
                    
                    # Get corresponding cash flow data for OCF-to-Net Income calculation
                    cash_flow_record = db.query(CashFlowData).filter(
                        CashFlowData.ticker == ticker,
                        CashFlowData.fiscal_date_ending == record.fiscal_date_ending
                    ).first()
                    
                    cash_flow_data_dict = None
                    if cash_flow_record:
                        cash_flow_data_dict = {
                            "operating_cashflow": cash_flow_record.operating_cashflow,
                            "net_income": cash_flow_record.net_income,
                        }
                    
                    # Calculate profitability metrics
                    profitability_metrics = FinancialCalculator.calculate_all_profitability_metrics(
                        ticker=ticker,
                        fiscal_date=record.fiscal_date_ending,
                        income_statement_data=income_statement_data_dict,
                        shareholder_equity=shareholder_equity,
                        cash_flow_data=cash_flow_data_dict,
                        historical_revenue_data=historical_revenue_data
                    )
                    
                    # Store profitability metrics
                    calculated_profitability_metrics = ProfitabilityMetrics(**profitability_metrics.dict())
                    db.add(calculated_profitability_metrics)
        
        db.commit()
        logger.info(f"Successfully processed balance sheet data for {ticker}")
        
    except Exception as e:
        logger.error(f"Error fetching balance sheet data for {ticker}: {e}")
        db.rollback()
    finally:
        # Always close the database session
        db.close()
