import pdfplumber
import sys
import os

pdf_path = "JurisSync_Unredacted_Master_Demo.pdf"
if not os.path.exists(pdf_path):
    print("File not found:", pdf_path)
    sys.exit(1)

with pdfplumber.open(pdf_path) as pdf:
    page = pdf.pages[0]
    words = page.extract_words()
    for w in words:
        print(f"'{w['text']}': [{w['x0']/page.width:.3f}, {w['top']/page.height:.3f}, {(w['x1']-w['x0'])/page.width:.3f}, {(w['bottom']-w['top'])/page.height:.3f}]")
