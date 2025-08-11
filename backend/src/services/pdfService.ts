// backend/src/services/pdfService.ts
import multer from 'multer';
import { PDFExtract } from 'pdf.js-extract';
import { v4 as uuidv4 } from 'uuid';

export class PDFService {
  private pdfExtract = new PDFExtract();

  async processPDF(file: Express.Multer.File, userId: string): Promise<ProcessedBook> {
    const bookId = uuidv4();
    const filePath = await this.saveFile(file, bookId);

    // Extract text content
    const extractedData = await this.pdfExtract.extract(filePath);
    const textContent = this.extractTextFromPages(extractedData.pages);

    // Extract metadata
    const metadata = await this.extractMetadata(extractedData);

    // Generate cover if not present
    const coverUrl = await this.generateCover(metadata.title, metadata.author);

    // Save to database
    const book = await this.bookModel.createBook({
      id: bookId,
      title: metadata.title || file.originalname.replace('.pdf', ''),
      author: metadata.author || 'Unknown Author',
      filePath,
      coverUrl,
      textContent,
      uploadedBy: userId,
      pageCount: extractedData.pages.length
    });

    return book;
  }

  private async extractMetadata(pdfData: any): Promise<BookMetadata> {
    // Use AI to extract title, author, genre from content
    const firstPages = pdfData.pages.slice(0, 3)
      .map(page => page.content.map(item => item.str).join(' '))
      .join('\\n');

    const aiAnalysis = await this.aiService.analyzeBookContent(firstPages);

    return {
      title: aiAnalysis.title,
      author: aiAnalysis.author,
      genre: aiAnalysis.genre,
      description: aiAnalysis.description
    };
  }
}
