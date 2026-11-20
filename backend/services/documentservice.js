const fs = require("fs/promises");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");

// Extract readable text from PDF and DOCX files.
const extractDocumentText = async (file) => {
  const extension = file.originalname.split(".").pop().toLowerCase();

  // PDF extraction.
  if (extension === "pdf") {
    try {
      const fileBuffer = await fs.readFile(file.path);

      const pdfData = await pdf(fileBuffer);

      if (!pdfData.text || !pdfData.text.trim()) {
        throw new Error("No readable text found in this PDF");
      }

      return pdfData.text;
    } catch (error) {
      console.error("PDF extraction failed:", error.message);

      throw new Error(
        "Unable to extract text from this PDF. " +
          "Please try another PDF file.",
      );
    }
  }

  // DOCX extraction.
  if (extension === "docx") {
    const result = await mammoth.extractRawText({
      path: file.path,
    });

    return result.value;
  }

  throw new Error("Unsupported document format");
};

module.exports = {
  extractDocumentText,
};
