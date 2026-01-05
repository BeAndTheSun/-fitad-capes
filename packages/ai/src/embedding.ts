import { OpenAIClient } from './client';

export class EmbeddingService {
  private openai: OpenAIClient;

  public constructor() {
    this.openai = new OpenAIClient();
  }

  public async generateEmbeddings(texts: string[]): Promise<number[][]> {
    return this.openai.getEmbeddings(texts);
  }

  public async generateEmbeddingForQuery(query: string): Promise<number[]> {
    const embeddings = await this.openai.getEmbeddings([query]);
    return embeddings[0] || [];
  }
}
