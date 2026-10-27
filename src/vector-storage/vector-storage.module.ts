import { Module } from '@nestjs/common';
import { VectorStorageService } from './vector-storage.service';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import { QdrantVectorStore } from '@langchain/qdrant';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { FilterService } from './filter.service';

// Вариант для OpenAI
// import { OpenAIEmbeddings } from '@langchain/openai';

// Вариант для Gemini
@Module({
  providers: [
    VectorStorageService,
    FilterService,
    {
      provide: GoogleGenerativeAIEmbeddings,
      useFactory: (configService: ConfigService) => {
        return new GoogleGenerativeAIEmbeddings({
          apiKey: configService.getOrThrow('GEMINI_API_KEY'),
          model: configService.getOrThrow('GEMINI_EMBEDDING_MODEL'),
        });
      },
      inject: [ConfigService],
    },
    {
      provide: QdrantClient,
      useFactory: (configService: ConfigService): QdrantClient => {
        return new QdrantClient({
          url: configService.getOrThrow('QDRANT_URL'),
        });
      },
      inject: [ConfigService],
    },
    {
      provide: QdrantVectorStore,
      useFactory: (
        client: QdrantClient,
        embeddings: GoogleGenerativeAIEmbeddings,
        config: ConfigService,
      ) => {
        return new QdrantVectorStore(embeddings, {
          client,
          collectionName: config.getOrThrow('KNOWLEDGE_DB_COLLECTION_NAME'),
        });
      },
      inject: [
        QdrantClient,
        GoogleGenerativeAIEmbeddings,
        ConfigService,
      ],
    },
  ],
  exports: [VectorStorageService],
})
export class VectorStorageModule {}

// Вариант для OpenAI
// @Module({
//   providers: [
//     VectorStorageService,
//     {
//       provide: OpenAIEmbeddings,
//       useFactory: (configService: ConfigService) => {
//         return new OpenAIEmbeddings({
//           apiKey: configService.getOrThrow('OPENAI_API_KEY'),
//           model: configService.getOrThrow('OPENAI_EMBEDDING_MODEL'),
//         });
//       },
//       inject: [ConfigService],
//     },
//     {
//       provide: QdrantClient,
//       useFactory: (configService: ConfigService): QdrantClient => {
//         return new QdrantClient({
//           url: configService.getOrThrow('QDRANT_URL'),
//         });
//       },
//       inject: [ConfigService],
//     },
//     {
//       provide: QdrantVectorStore,
//       useFactory: (
//         client: QdrantClient,
//         embeddings: OpenAIEmbeddings,
//         config: ConfigService,
//       ) => {
//         return new QdrantVectorStore(embeddings, {
//           client,
//           collectionName: config.getOrThrow('KNOWLEDGE_DB_COLLECTION_NAME'),
//         });
//       },
//       inject: [QdrantClient, OpenAIEmbeddings, ConfigService],
//     },
//   ],
//   exports: [VectorStorageService],
// })
// export class VectorStorageModule {}
