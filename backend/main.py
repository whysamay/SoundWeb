import os
import litserve as ls
import torchaudio
from audiocraft.models import MusicGen
from audiocraft.data.audio import audio_write
import time
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Response, UploadFile, Form, Request
import torch
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s')
logger = logging.getLogger(__name__)

class MusicGenLitAPI(ls.LitAPI):
    def setup(self, device):
        self.model = MusicGen.get_pretrained('facebook/musicgen-small')
        self.model.set_generation_params(duration=25)

    def decode_request(self, request):
        path = f"tmp/input_{time.time()}"
        with open(path, "wb") as f:
            f.write(request["content"].file.read())
        prompt = request["prompt"]
        return {
            "path": path,
            "prompt": prompt
        }

    def predict(self, params):
        melody, sr = torchaudio.load(params["path"])
        os.remove(params["path"])
        wav = self.model.generate([params["prompt"]])
        for idx, one_wav in enumerate(wav):
            path = audio_write(f'tmp/output_{time.time()}', one_wav.cpu(), self.model.sample_rate, strategy="loudness", loudness_compressor=True)
            with open(path, "rb") as f:
                data = f.read()
            os.remove(path)
            return data

    def encode_response(self, prediction):
        return Response(content=prediction, headers={"Content-Type": "audio/wav"})

# Ensure tmp directory exists
os.makedirs('tmp', exist_ok=True)

# Add CORS and health check
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

# --- Add a POST endpoint for frontend ---
# Load the model once for the FastAPI endpoint
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"[INFO] Using device: {device}")
musicgen_model = MusicGen.get_pretrained('facebook/musicgen-small')
musicgen_model.set_generation_params(duration=25)

@app.post("/")
async def generate_lofi(request: Request, content: UploadFile = None, prompt: str = Form(None), duration: str = Form("5")):
    # If no prompt is provided, use a default prompt
    if prompt is None or prompt.strip() == "":
        prompt = "A relaxing lofi beat"
    if "loop" not in prompt.lower():
        prompt += ", seamless loop"
    logger.info(f"Received prompt: {prompt}")
    # Parse duration
    try:
        duration_val = int(duration)
        if duration_val not in [5, 10, 15, 30]:
            duration_val = 5
    except Exception:
        duration_val = 5
    musicgen_model.set_generation_params(duration=duration_val)
    # If no file is uploaded or file is empty, generate from prompt only
    if content is None or content.filename == "":
        wav = musicgen_model.generate([prompt])
    else:
        file_bytes = await content.read()
        if not file_bytes or len(file_bytes) < 44:  # 44 bytes is the minimum for a valid WAV header
            wav = musicgen_model.generate([prompt])
        else:
            # Save uploaded file
            path = f"tmp/input_{time.time()}"
            with open(path, "wb") as f:
                f.write(file_bytes)
            try:
                melody, sr = torchaudio.load(path)
                wav = musicgen_model.generate_with_chroma([prompt], melody, sr)
            except Exception as e:
                wav = musicgen_model.generate([prompt])
            finally:
                os.remove(path)
    for idx, one_wav in enumerate(wav):
        out_path = audio_write(f'tmp/output_{time.time()}', one_wav.cpu(), musicgen_model.sample_rate, strategy="loudness", loudness_compressor=True)
        with open(out_path, "rb") as f:
            data = f.read()
        os.remove(out_path)
        return Response(content=data, headers={"Content-Type": "audio/wav"})

if __name__ == "__main__":
    # api = MusicGenLitAPI()
    # server = ls.LitServer(api, accelerator="gpu", timeout=10000, workers_per_device=2)
    # server.run(port=8000)
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 