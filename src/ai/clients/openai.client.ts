import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiResponseGenerationException } from '../../exceptions/types/ai-response-generation.exception';
import { OpenAI } from 'openai';

@Injectable()
export class OpenAiClient {
  private readonly ai: OpenAI;
  private readonly generationModel: string;

  constructor(private readonly configService: ConfigService) {
    this.ai = new OpenAI({
      apiKey: this.configService.getOrThrow('OPENAI_API_KEY'),
    });

    this.generationModel = this.configService.getOrThrow(
      'OPENAI_GENERATION_MODEL',
    );
  }

  async generateContent(request: string): Promise<string> {
    const response =
      await this.ai.responses.create({
        model: this.generationModel,
        input: request,
      });

    if (!response.output_text) {
      throw new AiResponseGenerationException(
        'Could not receive OpenAI AI response',
      );
    }

    return response.output_text;
  }
}
