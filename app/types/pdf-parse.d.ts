// types/pdf-parse.d.ts

declare module 'pdf-parse' {
    import { Readable } from 'stream';
  
    interface PDFInfo {
      PDFFormatVersion: string;
      IsAcroFormPresent: boolean;
      IsXFAPresent: boolean;
      [key: string]: any;
    }
  
    interface PDFMeta {
      [key: string]: any;
    }
  
    interface PDFParseResult {
      numpages: number;
      numrender: number;
      info: PDFInfo;
      metadata: PDFMeta | null;
      text: string;
      version: string;
    }
  
    function pdfParse(
      dataBuffer: Buffer | Uint8Array | Readable,
      options?: any
    ): Promise<PDFParseResult>;
  
    export = pdfParse;
  }
  