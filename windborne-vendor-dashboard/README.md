# WindBorne Systems Vendor Health Dashboard

A financial health analysis dashboard for potential WindBorne Systems vendors using Alpha Vantage API.

## Project Structure

```
windborne-vendor-dashboard/
├── backend/                 # FastAPI Python backend
├── frontend/               # React TypeScript frontend
├── docker-compose.yml      # Local development setup
└── README.md              # This file
```

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- Alpha Vantage API key

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Add your Alpha Vantage API key to .env
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` in the backend directory and add your Alpha Vantage API key:

```
ALPHA_VANTAGE_API_KEY=your_api_key_here
```

## Target Vendors

- **Sensors**: TE Connectivity (TEL), Sensata Technologies (ST)
- **Plastics/Materials**: DuPont de Nemours (DD), Celanese (CE), LyondellBasell (LYB)

## Features (Balance Sheet Focus)

- Balance Sheet-based financial health analysis
- Key liquidity metrics (Current Ratio, Quick Ratio)
- Leverage analysis (Debt-to-Equity, Debt Ratio)
- Risk flag identification (liquidity and leverage warnings)
- Vendor comparison dashboard
- Rate limiting and data caching
- Real-time data refresh from Alpha Vantage API

## Development

- Backend runs on http://localhost:8000
- Frontend runs on http://localhost:5173
- API docs available at http://localhost:8000/docs
