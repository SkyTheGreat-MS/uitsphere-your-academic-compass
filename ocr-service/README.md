# UitSphere OCR Service

This service extracts text from PNG and JPEG images using PaddleOCR.

## Run locally

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The first OCR request may download PaddleOCR models.

## API

```powershell
curl.exe -X POST http://localhost:8000/ocr/extract -F "file=@lecture-slide.png"
```

Response:

```json
{"text":"Detected lecture text"}
```
