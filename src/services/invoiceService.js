// PDF invoice — wire up with pdfkit or puppeteer when ready
const invoiceService = {
  async generate(sale, items, customer, business) {
    // TODO: implement PDF generation with pdfkit
    // const doc = new PDFDocument();
    // ... build invoice layout ...
    // return buffer;
    throw new Error('PDF invoice generation not yet implemented. Install pdfkit and implement this service.');
  },
};

module.exports = invoiceService;
