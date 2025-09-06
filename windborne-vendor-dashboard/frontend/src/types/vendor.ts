export interface Vendor {
  id: number;
  ticker: string;
  name: string;
  sector?: string;
  industry?: string;
  created_at: string;
  updated_at?: string;
}

export interface FinancialData {
  id: number;
  ticker: string;
  fiscal_date_ending: string;
  report_type: string;
  reported_currency: string;

  // Balance Sheet
  total_assets?: number;
  total_current_assets?: number;
  cash_and_cash_equivalents?: number;
  current_net_receivables?: number;
  inventory?: number;
  total_liabilities?: number;
  total_current_liabilities?: number;
  current_accounts_payable?: number;
  short_term_debt?: number;
  long_term_debt?: number;
  total_shareholder_equity?: number;
  common_stock_shares_outstanding?: number;

  // Income Statement
  total_revenue?: number;
  gross_profit?: number;
  operating_income?: number;
  net_income?: number;
  ebitda?: number;
  eps?: number;

  // Cash Flow
  operating_cash_flow?: number;
  capital_expenditures?: number;
  free_cash_flow?: number;

  // Market Data
  market_cap?: number;

  created_at: string;
  updated_at?: string;
}

export interface CalculatedMetrics {
  id: number;
  ticker: string;
  fiscal_date_ending: string;

  // Liquidity
  current_ratio?: number;
  quick_ratio?: number;

  // Leverage
  debt_to_equity?: number;
  debt_ratio?: number;

  // Profitability
  net_margin?: number;
  gross_margin?: number;
  operating_margin?: number;
  roe?: number;
  roa?: number;

  // Cash Quality
  ocf_to_net_income?: number;

  // Growth
  revenue_cagr_3y?: number;

  // Flags
  liquidity_flag: boolean;
  leverage_flag: boolean;
  profitability_flag: boolean;

  created_at: string;
  updated_at?: string;
}

export interface VendorSummary {
  ticker: string;
  name: string;
  sector?: string;

  // Balance Sheet highlights
  total_assets?: number;
  total_current_assets?: number;
  total_current_liabilities?: number;
  total_shareholder_equity?: number;
  cash_and_cash_equivalents?: number;

  // Key metrics (from Balance Sheet only)
  current_ratio?: number;
  debt_to_equity?: number;
  quick_ratio?: number;
  debt_ratio?: number;

  // Flags
  liquidity_flag: boolean;
  leverage_flag: boolean;

  last_updated?: string;
}

export interface VendorComparison {
  vendors: VendorSummary[];
}

export interface TrendData {
  fiscal_date_ending: string;
  total_revenue?: number;
  net_income?: number;
  operating_cash_flow?: number;
}

export interface VendorTrends {
  ticker: string;
  name: string;
  trends: TrendData[];
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface RefreshResponse {
  message: string;
}
