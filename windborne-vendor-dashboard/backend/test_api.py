import asyncio
import httpx

async def test_api():
    url = 'https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol=IBM&apikey=3SH8I6KZFECR4OLC'
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
