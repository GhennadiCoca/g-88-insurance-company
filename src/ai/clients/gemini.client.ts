import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerateContentResponse, GoogleGenAI } from '@google/genai';
import { AiResponseGenerationException } from '../../exceptions/types/ai-response-generation.exception';

@Injectable()
export class GeminiClient {
  private readonly ai: GoogleGenAI;
  private readonly generationModel: string;

  constructor(private readonly configService: ConfigService) {
    this.ai = new GoogleGenAI({
      apiKey: this.configService.getOrThrow('GEMINI_API_KEY'),
    });

    this.generationModel = this.configService.getOrThrow(
      'GEMINI_GENERATION_MODEL',
    );
  }

  async generateContent(request: string): Promise<string> {
    const response: GenerateContentResponse =
      await this.ai.models.generateContent({
        model: this.generationModel,
        contents: request,
      });

    if (!response.text) {
      throw new AiResponseGenerationException(
        'Could not receive Gemini AI response'
      );
    }

    return response.text;
  }
}
