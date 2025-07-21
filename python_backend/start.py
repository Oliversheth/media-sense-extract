
#!/usr/bin/env python3
import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    print("Installing requirements...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

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
    
    # Install requirements
    try:
        install_requirements()
        print("✓ Requirements installed")
    except Exception as e:
        print(f"✗ Failed to install requirements: {e}")
        sys.exit(1)
    
    # Check Ollama
    if not check_ollama():
        print("\nPlease start Ollama first:")
        print("  ollama serve")
        print("\nThen make sure you have the required models:")
        print("  ollama pull codellama:instruct")
        print("  ollama pull deepseek-coder:instruct")
        sys.exit(1)
    
    print("\n🎯 Starting FastAPI server...")
    print("Backend will be available at: http://localhost:8000")
    print("API docs at: http://localhost:8000/docs")
    print("\nPress Ctrl+C to stop the server")
    print("=" * 50)
    
    # Start the server
    os.system("python main.py")

if __name__ == "__main__":
    main()
