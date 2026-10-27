import { Injectable } from '@nestjs/common';
import { GeminiClient } from './clients/gemini.client';
import { OpenAiClient } from './clients/openai.client';
import { ConfigService } from '@nestjs/config';
import { ConfigurationException } from '../exceptions/types/configuration.exception';

@Injectable()
export class AiService {
  private readonly primaryGenerationProvider: string;
  
  constructor(
    private readonly geminiClient: GeminiClient,
    private readonly openAiClient: OpenAiClient,
    private readonly configService: ConfigService,
  ) {
    this.primaryGenerationProvider = this.configService.getOrThrow(
      'PRIMARY_GENERATION_PROVIDER',
    );
  }

  async generateResponse(prompt: string): Promise<string> {
    switch (this.primaryGenerationProvider) {
      case 'openai':
        return this.openAiClient.generateContent(prompt);
      case 'google':
        return this.geminiClient.generateContent(prompt);
      default:
        throw new ConfigurationException(
          `${this.primaryGenerationProvider} AI provider is not supported`
        );
    }
  }
}
