import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { VectorStorageModule } from '../vector-storage/vector-storage.module';
import { AiModule } from '../ai/ai.module';
import { PromptService } from './prompt.service';
import { ContextService } from './context.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, PromptService, ContextService],
  imports: [VectorStorageModule, AiModule],
})
export class ChatModule {}
