import logging
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from paddleocr import PaddleOCR

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="UitSphere OCR Service")

ocr = PaddleOCR(lang="en")
logger.info("PaddleOCR initialized successfully")

SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg"}
SUPPORTED_CONTENT_TYPES = {"image/png", "image/jpeg", "image/jpg"}


def extract_text(results) -> str:
    text_lines = []

    for result in results:
        try:
            data = result.json

            rec_texts = data.get("rec_texts", [])

            for text in rec_texts:
                if text and text.strip():
                    text_lines.append(text)

        except Exception as e:
            logger.error("Text extraction error: %s", e)

    return "\n".join(text_lines).strip()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/ocr/extract")
async def extract(file: UploadFile = File(...)):
    print(f"Received file: {file.filename}, content type: {file.content_type}")

    extension = Path(file.filename or "").suffix.lower()

    if (
        extension not in SUPPORTED_EXTENSIONS
        or file.content_type not in SUPPORTED_CONTENT_TYPES
    ):
        raise HTTPException(
            status_code=415,
            detail="This file type is not supported."
        )

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="The uploaded image is empty."
        )

    temporary_path = None

    try:
        with tempfile.NamedTemporaryFile(
            suffix=extension,
            delete=False
        ) as temporary_file:
            temporary_file.write(contents)
            temporary_path = Path(temporary_file.name)

        results = ocr.predict(str(temporary_path))

        text = extract_text(results)

        return {
            "text": text
        }

    except Exception as exc:
        print("OCR ERROR:", repr(exc))
        raise HTTPException(
            status_code=503,
            detail=str(exc)
        ) from exc

    finally:
        if temporary_path:
            temporary_path.unlink(missing_ok=True)