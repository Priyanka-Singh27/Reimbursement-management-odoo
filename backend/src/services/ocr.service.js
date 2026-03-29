const Tesseract = require("tesseract.js");

function parseAmount(text) {
  const amountMatches = text.match(
    /(?:INR|USD|EUR|GBP|Rs\.?|\$|€|£)?\s?(\d+(?:[.,]\d{1,2})?)/gi
  );
  if (!amountMatches || amountMatches.length === 0) return null;
  const last = amountMatches[amountMatches.length - 1].replace(/[^\d.,]/g, "").replace(",", ".");
  const value = Number(last);
  return Number.isNaN(value) ? null : value;
}

function parseDate(text) {
  const dateMatch = text.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/);
  if (!dateMatch) return null;
  return dateMatch[1];
}

function parseMerchant(text) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return lines[0] || null;
}

async function extractReceiptData(imagePath) {
  const result = await Tesseract.recognize(imagePath, "eng");
  const rawText = result.data.text || "";

  return {
    rawText,
    amount: parseAmount(rawText),
    date: parseDate(rawText),
    merchantName: parseMerchant(rawText),
    description: "Auto-filled from OCR scan",
  };
}

module.exports = { extractReceiptData };
