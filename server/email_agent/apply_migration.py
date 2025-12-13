#!/usr/bin/env python3
"""
Apply migration to Supabase database using direct PostgreSQL connection
"""

import os
import sys
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def apply_migration():
    """Apply the emails table migration"""
    
    # Get Supabase credentials
    supabase_url = os.getenv('VITE_SUPABASE_URL')
    supabase_key = os.getenv('VITE_SUPABASE_PUBLISHABLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("Error: Supabase credentials not found in environment")
        sys.exit(1)
    
    # Read migration file
    migration_file = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        'supabase/migrations/20251212000800_create_emails_table.sql'
    )
    
    with open(migration_file, 'r') as f:
        migration_sql = f.read()
    
    print(f"Applying migration from: {migration_file}")
    print("=" * 80)
    
    # Create Supabase client
    supabase = create_client(supabase_url, supabase_key)
    
    try:
        # Execute the migration SQL
        result = supabase.rpc('exec_sql', {'query': migration_sql}).execute()
        print("✅ Migration applied successfully!")
        print("=" * 80)
        print("The 'emails' table has been created in your Supabase database.")
        print("You can now run the email parser to save emails to the database.")
        
    except Exception as e:
        print(f"❌ Error applying migration: {e}")
        print("\nPlease apply the migration manually:")
        print("1. Go to https://supabase.com/dashboard")
        print("2. Select your project")
        print("3. Go to SQL Editor")
        print(f"4. Copy and paste the contents of: {migration_file}")
        print("5. Run the SQL")
        sys.exit(1)

if __name__ == "__main__":
    apply_migration()
