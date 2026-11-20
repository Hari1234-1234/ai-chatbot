// Split the extracted document text into smaller chunks.

const chunkText = (text, chunkSize = 1000, overlap = 150) => {
  // Check whether valid text was provided.
  if (!text || typeof text !== "string") {
    return [];
  }

  // Validate chunk size and overlap.
  if (chunkSize <= 0 || overlap < 0 || overlap >= chunkSize) {
    throw new Error("Invalid chunk size or overlap");
  }

  // Remove extra spaces and line breaks.
  const cleanedText = text.replace(/\s+/g, " ").trim();

  if (!cleanedText) {
    return [];
  }

  const chunks = [];
  let start = 0;

  // Continue until we reach the end of the text.
  while (start < cleanedText.length) {
    let end = Math.min(start + chunkSize, cleanedText.length);

    // Try to end the chunk at a word boundary.
    if (end < cleanedText.length) {
      const lastSpace = cleanedText.lastIndexOf(" ", end);

      if (lastSpace > start + chunkSize * 0.7) {
        end = lastSpace;
      }
    }

    // Extract the current chunk.
    const chunk = cleanedText.slice(start, end).trim();

    if (chunk) {
      chunks.push(chunk);
    }

    // Stop if we have reached the end.
    if (end >= cleanedText.length) {
      break;
    }

    // Move forward while retaining some overlapping text.
    start = end - overlap;
  }

  return chunks;
};

module.exports = chunkText;
