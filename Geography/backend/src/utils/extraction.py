import fitz  # PyMuPDF
import json
import re
from pathlib import Path
from pdf2image import convert_from_path

# =====================================================
# CONFIG
# =====================================================

POPPLER_PATH = r"C:\poppler-25.12.0\Library\bin"

BASE_DIR = Path(__file__).resolve().parents[2]
PDF_PATH = BASE_DIR / "src" / "rough" / "geography6.pdf"

DB_BASE = BASE_DIR / "src" / "db" / "geography6"
FIGURE_DIR = DB_BASE / "figures"
JSON_PATH = DB_BASE / "pages.json"

FIGURE_DIR.mkdir(parents=True, exist_ok=True)

# =====================================================
# STRICT FIGURE CAPTURE PATTERN
# =====================================================

FIGURE_PATTERN = re.compile(
    r"""
    (
        ^\s*(fig|figure)\.?\s+\d+(\.\d+)?\s*:\s+[a-zA-Z].+ |
        ^\s*source:\s+.+ |
        ^\s*india:\s+.+ 
    )
    """,
    re.IGNORECASE | re.MULTILINE | re.VERBOSE
)

# =====================================================
# TEXT EXTRACTION
# =====================================================

print("📄 Extracting text from PDF...")

doc = fitz.open(PDF_PATH)
pages_data = []
figure_pages = []

for page_index, page in enumerate(doc):
    pdf_page = page_index + 1

    text = page.get_text("text").strip()
    lines = [line.strip() for line in text.split("\n") if line.strip()]

    # -----------------------------
    # BOOK PAGE DETECTION
    # -----------------------------
    if lines and lines[0].isdigit():
        book_page = int(lines[0])
    else:
        book_page = None

    # -----------------------------
    # FIGURE DETECTION
    # -----------------------------
    has_figure = any(FIGURE_PATTERN.search(line) for line in lines)

    pages_data.append({
        "pdfPage": pdf_page,
        "bookPage": book_page,
        "lines": lines,
        "hasFigure": has_figure
    })

    if has_figure:
        figure_pages.append(pdf_page)

    print(
        f"PDF Page {pdf_page} | "
        f"Book Page: {book_page} | "
        f"Capture Image: {has_figure}"
    )

# =====================================================
# IMAGE EXTRACTION (ONLY FIGURE PAGES)
# =====================================================

if figure_pages:
    print("\n🖼️ Rendering figure pages only...")

    images = convert_from_path(
        PDF_PATH,
        dpi=200,
        poppler_path=POPPLER_PATH
    )

    for page_no in figure_pages:
        img = images[page_no - 1]
        img_path = FIGURE_DIR / f"page_{page_no}.png"
        img.save(img_path, "PNG")
        print(f"🖼️ Saved image: page_{page_no}.png")
else:
    print("\n⚠️ No figure pages detected.")

# =====================================================
# SAVE JSON
# =====================================================

DB_BASE.mkdir(parents=True, exist_ok=True)

with open(JSON_PATH, "w", encoding="utf-8") as f:
    json.dump(
        {
            "source": "geography10.pdf",
            "totalPages": len(pages_data),
            "figurePages": figure_pages,
            "pages": pages_data
        },
        f,
        indent=2,
        ensure_ascii=False
    )

print("\n🎉 DONE")
print(f"📄 JSON saved at: {JSON_PATH}")
print(f"🖼️ Figures saved in: {FIGURE_DIR}")
print(f"📊 Total figure pages: {len(figure_pages)}")
