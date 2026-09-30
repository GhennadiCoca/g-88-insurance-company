import { Module } from '@nestjs/common';
import { CarsController } from './cars.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car } from './car.entity';
import { UsersModule } from '../users/users.module';
import { CarsService } from './cars.service';
import { CarsRepository } from './cars.repository';

@Module({
  controllers: [CarsController],
  imports: [TypeOrmModule.forFeature([Car]), UsersModule],
  providers: [CarsService, CarsRepository],
  exports: [CarsService],
})
export class CarsModule {}
