import 'server-only';
import mammoth from 'mammoth';

export interface ExtractionResult {
  text: string;
  wordCount: number;
  fileName: string;
  fileType: string;
}

/**
 * Extracts raw textual content from uploaded PDF, DOCX, or TXT file buffers.
 * Enforces file size limits and structural validation.
 */
export async function extractResumeText(
  buffer: Buffer,
  fileName: string,
  mimeType?: string
): Promise<ExtractionResult> {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

  if (!buffer || buffer.length === 0) {
    throw new Error('Unable to read this resume. Please upload a valid PDF or DOCX file.');
  }

  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error('File size exceeds the 10MB limit. Please upload a smaller file.');
  }

  const lowerName = fileName.toLowerCase();
  let extracted = '';
  let fileType = 'unknown';

  if (lowerName.endsWith('.pdf') || mimeType === 'application/pdf') {
    fileType = 'pdf';
    try {
      // Dynamic require to prevent client bundling issues
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse');
      const res = await pdfParse(buffer);
      extracted = typeof res === 'string' ? res : res?.text || '';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('PDF text extraction failure:', msg);
      throw new Error('Unable to read this resume. Please upload a valid PDF or DOCX file.');
    }
  } else if (
    lowerName.endsWith('.docx') ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    fileType = 'docx';
    try {
      const result = await mammoth.extractRawText({ buffer });
      extracted = result.value || '';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('DOCX text extraction failure:', msg);
      throw new Error('Unable to read this resume. Please upload a valid PDF or DOCX file.');
    }
  } else if (
    lowerName.endsWith('.txt') ||
    mimeType === 'text/plain'
  ) {
    fileType = 'txt';
    try {
      extracted = buffer.toString('utf-8');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('TXT text extraction failure:', msg);
      throw new Error('Unable to read this resume. Please upload a valid PDF or DOCX file.');
    }
  } else {
    throw new Error('Invalid file type. Please upload a PDF, DOCX, or TXT file.');
  }

  // Clean extracted text: collapse excessive whitespace but preserve line breaks
  const cleanedText = extracted
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Validate extracted text length
  if (!cleanedText || cleanedText.length < 20) {
    throw new Error('Unable to read this resume. Please upload a valid PDF or DOCX file.');
  }

  const words = cleanedText.split(/\s+/).filter(Boolean);

  return {
    text: cleanedText,
    wordCount: words.length,
    fileName,
    fileType,
  };
}
