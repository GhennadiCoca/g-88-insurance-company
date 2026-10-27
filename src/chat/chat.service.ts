import { Injectable } from '@nestjs/common';
import { VectorStorageService } from '../vector-storage/vector-storage.service';
import { AiService } from '../ai/ai.service';
import { PromptService } from './prompt.service';
import { Role } from '../users/enums/role.enum';

@Injectable()
export class ChatService {
  constructor(
    private readonly vectorStorageService: VectorStorageService,
    private readonly aiService: AiService,
    private readonly promptService: PromptService,
  ) {}

  async generateResponse(request: string, userRole: Role): Promise<string> {
    let prompt: string =
      this.promptService.createPromptForInsuranceType(request);

    console.log('\nPrompt:\n');
    console.log(prompt + '\n');

    const insuranceType: string = await this.aiService.generateResponse(prompt);

    console.log('\nInsurance type:\n');
    console.log(insuranceType + '\n');

    const relevantChunks: string[] =
      await this.vectorStorageService.getRelevantChunks(
        request,
        insuranceType,
        userRole,
      );

    prompt = this.promptService.createPromptForUserRequest(
      relevantChunks,
      request,
    );

    console.log('\nPrompt:\n');
    console.log(prompt + '\n');

    return this.aiService.generateResponse(prompt);
  }
}
