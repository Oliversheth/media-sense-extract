
#!/usr/bin/env python3
import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    print("Installing requirements...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✓ Requirements installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to install requirements: {e}")
        return False
    return True

def check_python_version():
    """Check Python version compatibility"""
    version = sys.version_info
    print(f"Python version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major == 3 and version.minor >= 11:
        print("✓ Python version is compatible")
        return True
    else:
        print("✗ Python 3.11+ required")
        return False

def check_ollama():
    """Check if Ollama is running"""
    try:
        import requests
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json().get('models', [])
            print(f"✓ Ollama is running with {len(models)} models available")
            for model in models:
                print(f"  - {model['name']}")
            return True
        else:
            print("✗ Ollama is not responding properly")
            return False
    except Exception as e:
        print(f"✗ Ollama connection failed: {e}")
        print("Please make sure Ollama is running: 'ollama serve'")
        return False

def main():
    print("🚀 Starting Local Video AI Backend")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("requirements.txt"):
        print("Error: Please run this from the python_backend directory")
        sys.exit(1)
    
    # Check Python version
    if not check_python_version():
        print("\nPlease use Python 3.11.8 or higher")
        sys.exit(1)
    
    # Install requirements
    if not install_requirements():
        sys.exit(1)
    
    # Check Ollama
    if not check_ollama():
        print("\nPlease start Ollama first:")
        print("  ollama serve")
        print("\nThen make sure you have the required models:")
        print("  ollama pull codellama:instruct")
        print("  ollama pull deepseek-coder:instruct")
        sys.exit(1)
    
    print("\n🎯 Starting FastAPI server on port 8001...")
    print("Backend will be available at: http://localhost:8001")
    print("API docs at: http://localhost:8001/docs")
    print("\nPress Ctrl+C to stop the server")
    print("=" * 50)
    
    # Start the server
    try:
        subprocess.run([sys.executable, "main.py"], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"\n✗ Server failed to start: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
