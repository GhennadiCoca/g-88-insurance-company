import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Public } from '../auth/types/auth.decorators';
import { IngestionService } from './ingestion.service';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';
import { IngestDocumentDto } from './dto/ingest-document.dto';

@Controller('ingestion')
export class IngestionController {
  constructor(private readonly service: IngestionService) {}

  @Public()
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() ingestDocumentDto: IngestDocumentDto,
  ): Promise<void> {
    await this.service.ingest(file, ingestDocumentDto);
  }
}
