import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { CarsModule } from './cars/cars.module';
import { PoliciesModule } from './policies/policies.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guards/auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { ConfirmationCodesModule } from './confirmation-codes/confirmation-codes.module';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './ai/ai.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { VectorStorageModule } from './vector-storage/vector-storage.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    UsersModule,
    CarsModule,
    PoliciesModule,
    AuthModule,
    ConfirmationCodesModule,
    EmailModule,
    AiModule,
    IngestionModule,
    VectorStorageModule,
    ChatModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5431,
      username: 'admin',
      password: 'secret',
      database: 'g_88_insurance_company',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
