import { Module } from '@nestjs/common';
import { PoliciesController } from './policies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Policy } from './policy.entity';
import { CarsModule } from '../cars/cars.module';
import { PoliciesService } from './policies.service';
import { PoliciesRepository } from './policies.repository';

@Module({
  controllers: [PoliciesController],
  imports: [TypeOrmModule.forFeature([Policy]), CarsModule],
  providers: [PoliciesService, PoliciesRepository],
})
export class PoliciesModule {}
