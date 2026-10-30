import { Injectable } from '@nestjs/common';
import { Document } from 'langchain';
import { QdrantVectorStore } from '@langchain/qdrant';
import { ConfigService } from '@nestjs/config';
import { DocumentInterface } from '@langchain/core/documents';
import { FilterService } from './filter.service';
import { Role } from '../users/enums/role.enum';
import { SearchFilterAnd } from './filters/search-filter-and';
import { DocumentVersionConflictException } from '../exceptions/types/document-version-conflict.exception';

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
  ): Promise<string[]> {
    const onlyPublicDocs: boolean = userRole === Role.CUSTOMER;

    const filter: SearchFilterAnd =
      this.filterService.createSearchFilter(insuranceType, onlyPublicDocs);

    const result: DocumentInterface[] = await this.vectorStore.similaritySearch(
      request,
      this.topKValue,
      filter,
    );
    return this.mapDocumentsToTexts(result);
  }

  private mapDocumentsToTexts(documents: DocumentInterface[]): string[] {
    return documents.map((d: DocumentInterface): string => d.pageContent);
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
      }
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

    await this.vectorStore.client.delete(
      this.vectorStore.collectionName,
      {
        filter,
      },
    );
  }
}
