import json
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from paddleocr import PaddleOCR

app = FastAPI(title="UitSphere OCR Service")

ocr = PaddleOCR(
    lang="en",
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False,
    device="cpu",
)

SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg"}
SUPPORTED_CONTENT_TYPES = {"image/png", "image/jpeg", "image/jpg"}


def extract_text(results) -> str:
    text_lines: list[str] = []
    for result in results:
        payload = result.json
        if isinstance(payload, str):
            payload = json.loads(payload)
        data = payload.get("res", payload)
        text_lines.extend(text for text in data.get("rec_texts", []) if text and text.strip())
    return "\n".join(text_lines).strip()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/ocr/extract")
async def extract(file: UploadFile = File(...)) -> dict[str, str]:
    extension = Path(file.filename or "").suffix.lower()
    if extension not in SUPPORTED_EXTENSIONS or file.content_type not in SUPPORTED_CONTENT_TYPES:
        raise HTTPException(status_code=415, detail="This file type is not supported.")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")

    temporary_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(suffix=extension, delete=False) as temporary_file:
            temporary_file.write(contents)
            temporary_path = Path(temporary_file.name)

        results = ocr.predict(str(temporary_path))
        return {"text": extract_text(results)}
    except Exception as exc:
        raise HTTPException(status_code=503, detail="OCR processing failed.") from exc
    finally:
        if temporary_path is not None:
            temporary_path.unlink(missing_ok=True)
