import { QdrantPayload } from './qdrant-payload';

export class SimilaritySearchResult {
  payload: QdrantPayload;
  score: number;
}
