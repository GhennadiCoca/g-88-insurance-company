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
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const sslEnabled =
          configService.getOrThrow<string>('DB_SSL') === 'true';

        return {
          type: 'postgres',
          host: configService.getOrThrow<string>('DB_HOST'),
          port: Number(configService.getOrThrow<string>('DB_PORT')),
          username: configService.getOrThrow<string>('DB_USERNAME'),
          password: configService.getOrThrow<string>('DB_PASSWORD'),
          database: configService.getOrThrow<string>('DB_DATABASE'),
          autoLoadEntities: true,
          synchronize: true,

          ...(sslEnabled && {
            ssl: {
              rejectUnauthorized: false,
            },
          }),
        };
      },
      inject: [ConfigService],
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
