import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module.js';
import { CarsModule } from './cars/cars.module.js';
import { PoliciesModule } from './policies/policies.module.js';

@Module({
  imports: [UsersModule, CarsModule, PoliciesModule],
})
export class AppModule {}
