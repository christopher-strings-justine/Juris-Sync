import pdfplumber
import sys
import os

pdf_path = "JurisSync_Unredacted_Master_Demo.pdf"
if not os.path.exists(pdf_path):
    print("File not found:", pdf_path)
    sys.exit(1)

with pdfplumber.open(pdf_path) as pdf:
    page = pdf.pages[0]
    for w in page.extract_words():
        if 'Sharma' in w['text'] or '1988' in w['text'] or 'ABCPS' in w['text'] or '9012' in w['text'] or '402' in w['text'] or 'Karnataka' in w['text'] or '1,85,00' in w['text']:
            print(f"{w['text']}: x0={w['x0']/page.width:.3f}, top={w['top']/page.height:.3f}, bottom={w['bottom']/page.height:.3f}")
