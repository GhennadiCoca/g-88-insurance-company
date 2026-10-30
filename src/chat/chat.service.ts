import { Injectable } from '@nestjs/common';
import { VectorStorageService } from '../vector-storage/vector-storage.service';
import { AiService } from '../ai/ai.service';
import { PromptService } from './prompt.service';
import { ChatMessage } from './types/chat-message';
import { User } from '../users/user.entity';

@Injectable()
export class ChatService {
  private readonly chatHistory: Map<number, ChatMessage[]> = new Map<
    number,
    ChatMessage[]
  >();

  constructor(
    private readonly vectorStorageService: VectorStorageService,
    private readonly aiService: AiService,
    private readonly promptService: PromptService,
  ) {}

  async generateResponse(request: string, user: User): Promise<string> {
    console.log('\nUser request:\n');
    console.log(request + '\n');

    const chatHistory: ChatMessage[] = this.getChatHistoryByUserId(user.id);

    console.log(`\nChat history has ${chatHistory.length} messages\n`);

    let prompt: string = this.promptService
      .buildPromptForInsuranceType()
      .withUserRole(user.role)
      .withChatHistory(chatHistory)
      .withQuestion(request)
      .build();

    console.log('\nPrompt:\n');
    console.log(prompt + '\n');

    const insuranceType: string = await this.aiService.generateResponse(prompt);

    console.log('\nInsurance type:\n');
    console.log(insuranceType + '\n');

    const relevantChunks: string[] =
      await this.vectorStorageService.getRelevantChunks(
        request,
        insuranceType,
        user.role,
      );

    prompt = this.promptService
      .buildPromptForChat()
      .withUserRole(user.role)
      .withContext(relevantChunks)
      .withChatHistory(chatHistory)
      .withQuestion(request)
      .build();

    console.log('\nPrompt:\n');
    console.log(prompt + '\n');

    const aiResponse: string = await this.aiService.generateResponse(prompt);

    console.log('\nAI response:\n');
    console.log(aiResponse + '\n');

    this.addChatHistoryByUserId(user.id, request, aiResponse);

    return aiResponse;
  }

  private getChatHistoryByUserId(userId: number): ChatMessage[] {
    return this.chatHistory.get(userId)?.slice(-10) ?? [];
  }

  private addChatHistoryByUserId(
    userId: number,
    userRequest: string,
    aiResponse: string,
  ): void {
    const message: ChatMessage = new ChatMessage();
    message.userRequest = userRequest;
    message.aiAnswer = aiResponse;

    if (this.chatHistory.has(userId)) {
      this.chatHistory.get(userId)?.push(message);
    } else {
      this.chatHistory.set(userId, [message]);
    }
  }
}
