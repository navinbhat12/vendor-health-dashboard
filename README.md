# WindBorne Systems Vendor Health Dashboard

A comprehensive financial analysis dashboard for evaluating potential vendors, built with FastAPI and React. This application provides real-time financial metrics, trend analysis, and vendor comparison capabilities to help WindBorne Systems make informed procurement decisions.

## 🚀 Features

### 📊 Financial Metrics & Analysis

The dashboard evaluates vendors across **four key financial umbrellas**:

#### 1. **Liquidity Metrics**

- **Current Ratio**: Measures short-term liquidity (assets vs liabilities)
- **Quick Ratio**: Excludes inventory for more conservative liquidity assessment
- **Color Coding**: Green (>1.5), Yellow (1.2-1.5), Red (<1.2)

#### 2. **Leverage Metrics**

- **Debt-to-Equity Ratio**: Indicates financial leverage and risk
- **Debt Ratio**: Shows proportion of assets financed by debt
- **Color Coding**: Green (<1.0), Yellow (1.0-2.0), Red (>2.0)

#### 3. **Profitability Metrics**

- **Net Margin**: Percentage of revenue retained as profit
- **Operating Margin**: Efficiency of core business operations
- **Return on Equity (ROE)**: Profitability relative to shareholder equity
- **3-Year Revenue CAGR**: Compound annual growth rate

#### 4. **Cash Quality Metrics**

- **Operating Cash Flow to Net Income Ratio**: Quality of earnings
- **Color Coding**: Green (>100%), Yellow (50-100%), Red (<50%)

### 🚩 Risk Flagging System

The dashboard implements an intelligent flagging system to highlight potential concerns:

- **Liquidity Flags**: Triggered when current ratio < 1.2 or quick ratio < 0.8
- **Leverage Flags**: Triggered when debt-to-equity > 2.0 or debt ratio > 0.5
- **Visual Indicators**: Warning triangles with color-coded alerts
- **Risk Assessment**: Automatic identification of vendors requiring closer scrutiny

### 🏢 Individual Vendor Pages

Each vendor has a dedicated detail page featuring:

- **Company Overview**: Market cap, sector, and business description
- **Financial Highlights**: Key metrics in organized card layout
- **Historical Trends**: Interactive line charts showing 10-year revenue and net income trends
- **Balance Sheet Overview**: Comprehensive asset and liability breakdown
- **Real-time Data**: Refresh capability to update financial information

### 📈 Interactive Charts

- **Revenue & Net Income Trends**: 10-year historical data visualization
- **Responsive Design**: Charts adapt to different screen sizes
- **Interactive Tooltips**: Hover for detailed data points
- **Color-coded Lines**: Blue for revenue, green for net income

### 📋 Comparison Table

A comprehensive side-by-side analysis featuring:

- **Sortable Columns**: Click headers to sort by any metric
- **All Vendors**: Includes both pre-loaded and dynamically added vendors
- **Export Functionality**: Download data as CSV for external analysis
- **Visual Organization**: Color-coded sections for each metric category
- **Delete Capability**: Remove dynamically added vendors with X buttons

### ➕ Dynamic Vendor Addition

**Custom Feature**: Add any publicly traded company for analysis:

- **Real-time Addition**: Enter ticker symbol to add new vendors
- **API Integration**: Automatic data fetching from Alpha Vantage
- **Persistence**: Added vendors persist across navigation and page refreshes
- **State Management**: Shared state across all components using React Context
- **Delete Functionality**: Remove added vendors (original 5 are protected)

## 🔌 API Endpoints

### Backend Endpoints

- `GET /health` - Health check endpoint
- `GET /api/v1/comparison` - Retrieve all vendor comparison data
- `GET /api/v1/vendors/{ticker}/summary` - Get vendor financial summary
- `GET /api/v1/vendors/{ticker}/trends` - Get 10-year historical trends
- `GET /api/v1/vendors/{ticker}/overview` - Get company overview data
- `POST /api/v1/vendors/{ticker}/refresh` - Refresh vendor data from API
- `POST /api/v1/initialize` - Initialize default vendor data

### External API Integration

- **Alpha Vantage API**: Financial data provider
  - Balance Sheet data
  - Income Statement data
  - Company overview information
  - Real-time financial metrics

## 🏆 Notable Accomplishments

### 🔒 Security & Best Practices

- **API Key Protection**: Backend proxy prevents API key exposure in browser
- **Environment Variables**: Secure configuration management
- **CORS Configuration**: Proper cross-origin resource sharing setup

### ⚡ Performance & Reliability

- **SQLite Caching**: Lightweight database for efficient data storage and retrieval
- **Extended Cache Duration**: Optimized caching strategy for quarterly financial updates
- **API Rate Limiting**: Intelligent rotation system using multiple API keys
- **Error Handling**: Comprehensive error management and user feedback

### 🎨 User Experience

- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Dark Theme**: Professional, easy-on-the-eyes interface
- **Real-time Updates**: Live data refresh capabilities
- **Intuitive Navigation**: Clear routing between dashboard, comparison, and detail views

### 🔄 State Management

- **Persistent Storage**: Dynamic vendors saved to localStorage
- **Context API**: Shared state across all components
- **Real-time Synchronization**: Changes reflect immediately across all views

## 🛠️ Tech Stack

### Frontend

- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Interactive chart library
- **Lucide React**: Modern icon library
- **Vite**: Fast build tool and development server

### Backend

- **FastAPI**: Modern, fast Python web framework
- **SQLAlchemy**: Python SQL toolkit and ORM
- **SQLite**: Lightweight, file-based database
- **Pydantic**: Data validation using Python type annotations
- **Uvicorn**: ASGI server for FastAPI
- **HTTPX**: Modern HTTP client for API requests

### Deployment & Infrastructure

- **Railway**: Backend hosting platform
- **Vercel**: Frontend hosting platform
- **Docker**: Containerization for consistent deployments
- **GitHub**: Version control and CI/CD

### External Services

- **Alpha Vantage API**: Financial data provider
- **Multiple API Keys**: Rate limiting mitigation through key rotation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/navinbhat12/windborne-swe.git
   cd windborne-swe/windborne-vendor-dashboard
   ```

2. **Backend Setup**

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp env.example .env
   # Add your Alpha Vantage API keys to .env
   uvicorn app.main:app --reload
   ```

3. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Environment Variables

Create a `.env` file in the backend directory with:

```
ALPHA_VANTAGE_API_KEY=your_primary_key
ALPHA_VANTAGE_API_KEY_1=your_backup_key_1
ALPHA_VANTAGE_API_KEY_2=your_backup_key_2
ALPHA_VANTAGE_API_KEY_3=your_backup_key_3
ALPHA_VANTAGE_API_KEY_4=your_backup_key_4
DATABASE_URL=sqlite:///./vendor_data.db
FRONTEND_URL=http://localhost:5173
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---
