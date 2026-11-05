import { Injectable } from '@nestjs/common';
import { Document } from 'langchain';
import { QdrantVectorStore } from '@langchain/qdrant';
import { ConfigService } from '@nestjs/config';
import { DocumentInterface } from '@langchain/core/documents';
import { FilterService } from './filter.service';
import { Role } from '../users/enums/role.enum';
import { SearchFilterAnd } from './filters/search-filter-and';
import { DocumentVersionConflictException } from '../exceptions/types/document-version-conflict.exception';
import { SimilaritySearchResult } from './types/similarity-search-result';
import { QdrantPayload } from './types/qdrant-payload';

@Injectable()
export class VectorStorageService {
  private readonly topKValue: number;

  constructor(
    private readonly vectorStore: QdrantVectorStore,
    private readonly configService: ConfigService,
    private readonly filterService: FilterService,
  ) {
    this.topKValue = Number(this.configService.getOrThrow('TOP_K_VALUE'));
  }

  async saveToDb(chunks: Document[]): Promise<void> {
    await this.deleteOldDocumentVersion(
      chunks[0].metadata.documentId,
      chunks[0].metadata.documentVersion,
    );
    await this.vectorStore.addDocuments(chunks);
  }

  async getRelevantChunks(
    request: string,
    insuranceType: string,
    userRole: Role,
  ): Promise<SimilaritySearchResult[]> {
    const onlyPublicDocs: boolean = userRole === Role.CUSTOMER;

    const filter: SearchFilterAnd = this.filterService.createSearchFilter(
      insuranceType,
      onlyPublicDocs,
    );

    const result: [DocumentInterface, number][] =
      await this.vectorStore.similaritySearchWithScore(
        request,
        this.topKValue,
        filter,
      );
    return this.mapDocumentsToSearchResults(result);
  }

  private mapDocumentsToSearchResults(
    documents: [DocumentInterface, number][],
  ): SimilaritySearchResult[] {
    return documents.map(
      ([document, score]): SimilaritySearchResult => {
        const payload: QdrantPayload = new QdrantPayload();
        payload.content = document.pageContent;
        payload.metadata = document.metadata;

        const result: SimilaritySearchResult = new SimilaritySearchResult();
        result.payload = payload;
        result.score = score;

        return result;
      }
    );
  }

  private async deleteOldDocumentVersion(
    documentId: string,
    documentVersion: number,
  ): Promise<void> {
    if (
      (await this.vectorStore.client.getCollections()).collections.length === 0
    ) {
      return;
    }

    const filter: SearchFilterAnd =
      this.filterService.createScrollFilter(documentId);

    const scrollResult = await this.vectorStore.client.scroll(
      this.vectorStore.collectionName,
      {
        filter,
        limit: 1,
      },
    );

    if (scrollResult.points.length === 0) {
      return;
    }

    const metadata = scrollResult.points[0].payload?.metadata as {
      documentVersion: number;
    };

    const oldVersion: number = metadata.documentVersion;

    if (documentVersion <= oldVersion) {
      throw new DocumentVersionConflictException(oldVersion, documentVersion);
    }

    await this.vectorStore.client.delete(this.vectorStore.collectionName, {
      filter,
    });
  }
}
