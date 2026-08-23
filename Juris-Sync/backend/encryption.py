import os
from cryptography.fernet import Fernet
from dotenv import load_dotenv

load_dotenv()

# We load the key from the environment. If it doesn't exist, we generate a temporary one for the session.
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
if not ENCRYPTION_KEY:
    ENCRYPTION_KEY = Fernet.generate_key().decode()
    print("WARNING: No ENCRYPTION_KEY found in .env. Generated a temporary key for this session.")

fernet = Fernet(ENCRYPTION_KEY.encode())

def encrypt_data(data: str) -> str:
    if not data:
        return ""
    return fernet.encrypt(data.encode()).decode()

def decrypt_data(token: str) -> str:
    if not token:
        return ""
    try:
        return fernet.decrypt(token.encode()).decode()
    except Exception as e:
        print(f"Decryption error: {e}")
        return "[DECRYPTION_FAILED]"
