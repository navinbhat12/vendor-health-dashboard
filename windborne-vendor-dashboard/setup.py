#!/usr/bin/env python3
"""
Setup script for WindBorne Systems Vendor Health Dashboard
"""

import os
import subprocess
import sys
from pathlib import Path

def run_command(command, cwd=None):
    """Run a shell command and handle errors"""
    print(f"Running: {' '.join(command)}")
    try:
        subprocess.run(command, check=True, cwd=cwd)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        return False

def setup_backend():
    """Set up Python backend"""
    backend_dir = Path("backend")
    
    print("\n🐍 Setting up Python backend...")
    
    # Create virtual environment
    if not run_command([sys.executable, "-m", "venv", "venv"], backend_dir):
        return False
    
    # Determine activation script path
    if os.name == 'nt':  # Windows
        activate_script = backend_dir / "venv" / "Scripts" / "activate"
        pip_path = backend_dir / "venv" / "Scripts" / "pip"
    else:  # Unix-like
        activate_script = backend_dir / "venv" / "bin" / "activate"
        pip_path = backend_dir / "venv" / "bin" / "pip"
    
    # Install requirements
    if not run_command([str(pip_path), "install", "-r", "requirements.txt"], backend_dir):
        return False
    
    print("✅ Backend setup complete!")
    return True

def setup_frontend():
    """Set up Node.js frontend"""
    frontend_dir = Path("frontend")
    
    print("\n📦 Setting up Node.js frontend...")
    
    # Install npm dependencies
    if not run_command(["npm", "install"], frontend_dir):
        return False
    
    print("✅ Frontend setup complete!")
    return True

def create_env_files():
    """Create environment files from examples"""
    print("\n⚙️  Creating environment files...")
    
    # Backend .env
    backend_env_example = Path("backend/env.example")
    backend_env = Path("backend/.env")
    
    if backend_env_example.exists() and not backend_env.exists():
        backend_env.write_text(backend_env_example.read_text())
        print(f"Created {backend_env}")
    
    # Frontend .env
    frontend_env_example = Path("frontend/env.example")
    frontend_env = Path("frontend/.env")
    
    if frontend_env_example.exists() and not frontend_env.exists():
        frontend_env.write_text(frontend_env_example.read_text())
        print(f"Created {frontend_env}")
    
    print("✅ Environment files created!")

def main():
    """Main setup function"""
    print("🚀 Setting up WindBorne Systems Vendor Health Dashboard")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not Path("backend").exists() or not Path("frontend").exists():
        print("❌ Error: Please run this script from the project root directory")
        sys.exit(1)
    
    # Setup backend
    if not setup_backend():
        print("❌ Backend setup failed")
        sys.exit(1)
    
    # Setup frontend
    if not setup_frontend():
        print("❌ Frontend setup failed")
        sys.exit(1)
    
    # Create environment files
    create_env_files()
    
    print("\n🎉 Setup complete!")
    print("\nNext steps:")
    print("1. Add your Alpha Vantage API key to backend/.env")
    print("2. Start the backend: cd backend && source venv/bin/activate && uvicorn app.main:app --reload")
    print("3. Start the frontend: cd frontend && npm run dev")
    print("4. Visit http://localhost:5173 to view the dashboard")

if __name__ == "__main__":
    main()
