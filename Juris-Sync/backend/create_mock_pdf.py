from fpdf import FPDF

pdf = FPDF()
pdf.add_page()
pdf.set_font("Arial", size=12)

# Page 1 content (Deed)
pdf.cell(200, 10, txt="WARRANTY DEED", ln=1, align="C")
pdf.cell(200, 10, txt="Date: January 10, 2026", ln=1, align="L")
pdf.cell(200, 10, txt="Grantor: Bob Smith", ln=1, align="L")
pdf.cell(200, 10, txt="Purchase Price: $1.25M", ln=1, align="L")

pdf.add_page()

# Page 2 content (Agreement)
pdf.cell(200, 10, txt="REAL ESTATE PURCHASE AGREEMENT", ln=1, align="C")
pdf.cell(200, 10, txt="Date: January 15, 2026", ln=1, align="L")
pdf.cell(200, 10, txt="Buyer: Robert J. Smith", ln=1, align="L")
pdf.cell(200, 10, txt="Purchase Price: $1,500,000", ln=1, align="L")

pdf.output("JurisSync_Demo_Legal_Bundle.pdf")
