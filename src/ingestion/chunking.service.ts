import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigurationException } from '../exceptions/types/configuration.exception';
import { Document } from 'langchain';
import { IngestDocumentDto } from './dto/ingest-document.dto';

@Injectable()
export class ChunkingService {
  constructor(private readonly configService: ConfigService) {}

  chunkBySentences(text: string): string[] {
    return text.split(/(?<=[.!?])(?: |\r?\n)+/);
  }

  chunkByParagraphs(text: string): string[] {
    return text.split(/(?:\r?\n){2,}/);
  }

  chunkBySize(text: string): string[] {
    const chunkSize: number = this.getChunkSize();

    const result: string[] = [];
    const allWords: string[] = text.split(/\s+/);
    let start: number = 0;

    while (start < allWords.length) {
      const end: number = start + chunkSize;
      const chunk: string = allWords.slice(start, end).join(' ').trim();
      result.push(chunk);
      start = end;
    }

    return result;
  }

  chunkBySizeWithOverlap(
    texts: string[],
    fileName: string,
    ingestDocumentDto: IngestDocumentDto,
  ): Document[] {
    const chunks: Document[] = [];

    for (let i: number = 0; i < texts.length; i++) {
      const currentText: string = texts[i];

      if (currentText && currentText.trim() !== '') {
        const textParts: string[] =
          this.chunkOneTextBySizeWithOverlap(currentText);

        for (const textPart of textParts) {
          const chunk: Document = this.createDocument(
            textPart,
            fileName,
            i + 1,
            ingestDocumentDto,
          );
          chunks.push(chunk);
        }
      }
    }

    return chunks;
  }

  private createDocument(
    text: string,
    fileName: string,
    pageNumber: number,
    ingestDocumentDto: IngestDocumentDto,
  ): Document {
    const chunk: Document = new Document({ pageContent: text });
    chunk.metadata.docTitle = fileName;
    chunk.metadata.page = pageNumber;
    chunk.metadata.insuranceType = ingestDocumentDto.insuranceType;
    chunk.metadata.departments = ingestDocumentDto.departments;
    chunk.metadata.language = ingestDocumentDto.language;
    chunk.metadata.publicAccess = ingestDocumentDto.publicAccess;
    return chunk;
  }

  private chunkOneTextBySizeWithOverlap(text: string): string[] {
    const chunkSize: number = this.getChunkSize();
    const overlap: number = this.getOverlap(chunkSize);

    const result: string[] = [];
    const allWords: string[] = text.split(/\s+/);
    let start: number = 0;

    while (start < allWords.length) {
      const end: number = start + chunkSize;
      const chunk: string = allWords.slice(start, end).join(' ').trim();
      result.push(chunk);
      start = end - overlap;
    }

    return result;
  }

  private getChunkSize(): number {
    const chunkSize: number = Number(
      this.configService.getOrThrow('CHUNK_SIZE_IN_WORDS'),
    );

    if (chunkSize < 1) {
      throw new ConfigurationException(
        'CHUNK_SIZE should be greater than zero',
      );
    }

    return chunkSize;
  }

  private getOverlap(chunkSize: number): number {
    const overlap: number = Number(
      this.configService.getOrThrow('CHUNK_OVERLAP_IN_WORDS'),
    );

    if (overlap < 1) {
      throw new ConfigurationException(
        'Env CHUNK_OVERLAP_IN_WORDS value should be greater than zero',
      );
    }

    if (overlap >= chunkSize) {
      throw new ConfigurationException(
        'Env CHUNK_OVERLAP_IN_WORDS value should be less than CHUNK_SIZE',
      );
    }

    return overlap;
  }
}
