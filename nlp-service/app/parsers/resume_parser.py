"""
Resume Parser
Extracts text from various resume file formats
"""

import io
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class ResumeParser:
    """Parses resume files and extracts text content"""
    
    def parse(self, file_bytes: bytes) -> str:
        """
        Parse resume file and extract text
        
        Args:
            file_bytes: Raw file bytes
            
        Returns:
            Extracted text content
        """
        # Try different parsers based on file signature
        text = None
        
        # Try PDF first
        if file_bytes[:4] == b'%PDF':
            text = self._parse_pdf(file_bytes)
        
        # Try DOCX
        elif file_bytes[:4] == b'PK\x03\x04':
            text = self._parse_docx(file_bytes)
        
        # Try plain text
        else:
            text = self._parse_text(file_bytes)
        
        if text:
            # Clean up text
            text = self._clean_text(text)
            
        return text or ""
    
    def _parse_pdf(self, file_bytes: bytes) -> Optional[str]:
        """Parse PDF file"""
        try:
            import pdfplumber
            
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                text_parts = []
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
                
                return "\n".join(text_parts)
        except ImportError:
            logger.warning("pdfplumber not installed, trying PyPDF2")
            return self._parse_pdf_fallback(file_bytes)
        except Exception as e:
            logger.error(f"PDF parsing error: {e}")
            return self._parse_pdf_fallback(file_bytes)
    
    def _parse_pdf_fallback(self, file_bytes: bytes) -> Optional[str]:
        """Fallback PDF parser using PyPDF2"""
        try:
            from PyPDF2 import PdfReader
            
            reader = PdfReader(io.BytesIO(file_bytes))
            text_parts = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text)
            
            return "\n".join(text_parts)
        except Exception as e:
            logger.error(f"PDF fallback parsing error: {e}")
            return None
    
    def _parse_docx(self, file_bytes: bytes) -> Optional[str]:
        """Parse DOCX file"""
        try:
            from docx import Document
            
            doc = Document(io.BytesIO(file_bytes))
            text_parts = []
            
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    text_parts.append(paragraph.text)
            
            # Also extract from tables
            for table in doc.tables:
                for row in table.rows:
                    for cell in row.cells:
                        if cell.text.strip():
                            text_parts.append(cell.text)
            
            return "\n".join(text_parts)
        except Exception as e:
            logger.error(f"DOCX parsing error: {e}")
            return None
    
    def _parse_text(self, file_bytes: bytes) -> Optional[str]:
        """Parse plain text file"""
        try:
            # Try UTF-8 first
            try:
                return file_bytes.decode('utf-8')
            except UnicodeDecodeError:
                # Try other encodings
                for encoding in ['latin-1', 'cp1252', 'iso-8859-1']:
                    try:
                        return file_bytes.decode(encoding)
                    except UnicodeDecodeError:
                        continue
            return None
        except Exception as e:
            logger.error(f"Text parsing error: {e}")
            return None
    
    def _clean_text(self, text: str) -> str:
        """
        Clean and normalize extracted text while preserving section boundaries,
        structural line breaks, and technical symbols (/, &, +, #, ., -, :, ;).
        """
        import re

        if not text:
            return ""

        # Normalize line breaks
        text = text.replace('\r\n', '\n').replace('\r', '\n')

        # Replace non-standard bullets with standard bullet
        text = re.sub(r'[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25AB\u25CF\u25CB\u25A0\u25A1]', ' • ', text)

        # Replace non-breaking spaces and control characters
        text = re.sub(r'[\xa0\t\f\v]', ' ', text)

        # Remove unprintable / non-ascii strange control characters, but keep printable unicode and punctuation
        text = re.sub(r'[^\x20-\x7E\n•]', ' ', text)

        # Normalize multiple spaces on the same line without destroying newlines
        lines = [re.sub(r' +', ' ', line).strip() for line in text.split('\n')]
        
        # Remove consecutive blank lines
        clean_lines = []
        for line in lines:
            if line:
                clean_lines.append(line)
            elif clean_lines and clean_lines[-1] != "":
                clean_lines.append("")

        return '\n'.join(clean_lines).strip()

