import { vi } from 'vitest';
import request from 'supertest';
import { app } from '../../app';
import { BookService } from '../../services/bookService';
import { CacheService } from '../../services/cacheService';

// Mock services
vi.mock('../../services/bookService');
vi.mock('../../services/cacheService');

describe('BookController', () => {
  const mockBookService = BookService as vi.MockedClass<typeof BookService>;
  const mockCacheService = CacheService as vi.MockedClass<typeof CacheService>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/books/:id', () => {
    it('should return book from cache', async () => {
      const mockBook = {
        id: '1',
        title: 'Test Book',
        author: 'Test Author'
      };

      mockCacheService.prototype.get.mockResolvedValue(mockBook);

      const response = await request(app)
        .get('/api/books/1')
        .expect(200);

      expect(response.body.book).toEqual(mockBook);
      expect(mockCacheService.prototype.get).toHaveBeenCalledWith('book:1');
      expect(mockBookService.prototype.getBookById).not.toHaveBeenCalled();
    });

    it('should fetch book from database when not in cache', async () => {
      const mockBook = {
        id: '1',
        title: 'Test Book',
        author: 'Test Author'
      };

      mockCacheService.prototype.get.mockResolvedValue(null);
      mockBookService.prototype.getBookById.mockResolvedValue(mockBook);

      const response = await request(app)
        .get('/api/books/1')
        .expect(200);

      expect(response.body.book).toEqual(mockBook);
      expect(mockBookService.prototype.getBookById).toHaveBeenCalledWith('1');
      expect(mockCacheService.prototype.set).toHaveBeenCalledWith('book:1', mockBook, 3600);
    });

    it('should return 404 when book not found', async () => {
      mockCacheService.prototype.get.mockResolvedValue(null);
      mockBookService.prototype.getBookById.mockResolvedValue(null);

      await request(app)
        .get('/api/books/999')
        .expect(404);
    });
  });

  describe('POST /api/books/upload', () => {
    it('should upload PDF successfully', async () => {
      const mockBook = {
        id: '1',
        title: 'Uploaded Book',
        author: 'Unknown Author'
      };

      mockBookService.prototype.processPDF.mockResolvedValue(mockBook);

      const response = await request(app)
        .post('/api/books/upload')
        .attach('pdf', Buffer.from('fake pdf content'), 'test.pdf')
        .expect(200);

      expect(response.body.book).toEqual(mockBook);
    });

    it('should reject non-PDF files', async () => {
      await request(app)
        .post('/api/books/upload')
        .attach('pdf', Buffer.from('fake content'), 'test.txt')
        .expect(400);
    });
  });
});

