import { InternalServerErrorException } from '@nestjs/common';

export class AiResponseGenerationException extends InternalServerErrorException {
  constructor(message: string) {
    super(message);
  }
}
