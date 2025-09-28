import asyncio
import httpx

async def test_api():
    # Use environment variable for API key
    import os
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.getenv('ALPHA_VANTAGE_API_KEY')
    if not api_key:
        print('❌ No API key found in environment variables')
        return
        
    url = f'https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol=IBM&apikey={api_key}'
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        data = response.json()
        if 'symbol' in data:
            print('✅ API connection successful!')
            print(f'Symbol: {data["symbol"]}')
            if 'annualReports' in data and len(data['annualReports']) > 0:
                latest = data['annualReports'][0]
                print(f'Latest fiscal year: {latest["fiscalDateEnding"]}')
                print(f'Total assets: ${int(latest["totalAssets"]):,}')
        else:
            print('❌ API Error:')
            print(data)

if __name__ == "__main__":
    asyncio.run(test_api())
