#!/usr/bin/env python3
"""
Script to safely check the database schema and identify any issues
"""
import sqlite3
import sys
import os

# Add the app directory to Python path
sys.path.insert(0, '/Users/navinbhat/windborne_swe/windborne-swe/windborne-vendor-dashboard/backend')

def check_database():
    db_path = '/Users/navinbhat/windborne_swe/windborne-swe/windborne-vendor-dashboard/backend/vendor_data.db'
    
    if not os.path.exists(db_path):
        print("❌ Database file does not exist!")
        return
        
    print("✅ Database file exists")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get all table names
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        print(f"\n📊 Found {len(tables)} tables:")
        for table in tables:
            table_name = table[0]
            print(f"  - {table_name}")
            
            # Get column info for each table
            cursor.execute(f"PRAGMA table_info({table_name});")
            columns = cursor.fetchall()
            for col in columns[:3]:  # Show first 3 columns
                print(f"    • {col[1]} ({col[2]})")
            if len(columns) > 3:
                print(f"    • ... and {len(columns) - 3} more columns")
        
        # Check if our new tables exist
        expected_tables = ['vendors', 'balance_sheet_data', 'income_statement_data', 'cash_flow_data', 'profitability_metrics']
        missing_tables = []
        
        existing_table_names = [t[0] for t in tables]
        for expected in expected_tables:
            if expected not in existing_table_names:
                missing_tables.append(expected)
        
        if missing_tables:
            print(f"\n⚠️  Missing tables: {missing_tables}")
        else:
            print(f"\n✅ All expected tables exist!")
            
        # Check if there's any data
        for table_name in existing_table_names:
            if table_name in expected_tables:
                cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
                count = cursor.fetchone()[0]
                print(f"  📈 {table_name}: {count} records")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error checking database: {e}")

if __name__ == "__main__":
    check_database()
