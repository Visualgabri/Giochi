import os
import shutil
import requests
from bs4 import BeautifulSoup

# --- CONFIGURAZIONE ---
SOURCE_DIR = r"C:\Repos\Giochi\Julie\compiti"
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3"  # Assicurati che Ollama sia attivo e il modello scaricato

def get_subject_from_ai(text_content):
    """Chiede all'IA di classificare il testo in una singola parola."""
    prompt = f"""
    Analizza il contenuto scolastico qui sotto. 
    Rispondi esclusivamente con il nome della materia (es. Matematica, Italiano, Scienze, Storia, Inglese).
    NON aggiungere spiegazioni, NON usare punteggiatura. 
    Se non sei sicuro, scrivi 'Altro'.

    Testo: {text_content[:600]}
    Materia:"""
    
    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False,
        "options": {
            "num_predict": 10,    # Limita fisicamente la lunghezza della risposta
            "temperature": 0.1     # Riduce la creatività per essere più precisi
        }
    }
    
    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=10)
        response.raise_for_status()
        res_text = response.json().get('response', 'Altro').strip()
        
        # Pulizia: prendiamo solo la prima parola, togliamo tutto ciò che non è lettera
        materia = res_text.split()[0]
        materia = "".join(filter(str.isalpha, materia))
        
        # Se l'IA ha comunque scritto troppo, usiamo un fallback
        if len(materia) > 20 or len(materia) < 2:
            return "Altro"
            
        return materia.capitalize()
    except Exception as e:
        print(f"Errore chiamata IA: {e}")
        return "Da_Classificare"

def clean_html(file_path):
    """Estrae solo il testo utile dall'HTML, ignorando script e tag CSS."""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            soup = BeautifulSoup(f, 'html.parser')
            for element in soup(["script", "style", "nav", "footer"]):
                element.decompose()
            return soup.get_text(separator=' ', strip=True)
    except Exception as e:
        print(f"Errore lettura {file_path}: {e}")
        return ""

def organize_files():
    if not os.path.exists(SOURCE_DIR):
        print(f"Errore: Il percorso {SOURCE_DIR} non esiste.")
        return

    print(f"--- Avvio Smistamento Compiti di Julie ---")
    
    files = [f for f in os.listdir(SOURCE_DIR) if f.lower().endswith(".html")]
    
    if not files:
        print("Nessun file HTML trovato nella cartella.")
        return

    for filename in files:
        file_path = os.path.join(SOURCE_DIR, filename)
        
        # 1. Estrazione testo
        text = clean_html(file_path)
        if not text:
            print(f"File vuoto o illeggibile: {filename}")
            continue
            
        # 2. Classificazione via IA
        materia = get_subject_from_ai(text)
        print(f"File: {filename:30} --> Materia: {materia}")
        
        # 3. Creazione cartella e spostamento
        target_folder = os.path.join(SOURCE_DIR, materia)
        os.makedirs(target_folder, exist_ok=True)
        
        try:
            shutil.move(file_path, os.path.join(target_folder, filename))
        except Exception as e:
            print(f"Errore nello spostamento di {filename}: {e}")

if __name__ == "__main__":
    organize_files()
    print("--- Operazione completata ---")