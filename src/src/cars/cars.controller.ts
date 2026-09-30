import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CarsService } from './cars.service';
import { Car } from './car.entity';

@Controller('cars')
export class CarsController {
  constructor(private readonly service: CarsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() car: Car): Promise<Car> {
    return await this.service.create(car);
  }

  @Get()
  async getAll(): Promise<Car[]> {
    return await this.service.getAllActiveCars();
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number): Promise<Car> {
    return await this.service.getActiveCarById(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() car: Car,
  ): Promise<void> {
    await this.service.update(id, car);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteById(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.deleteById(id);
  }

  @Patch(':id/restore')
  @HttpCode(HttpStatus.NO_CONTENT)
  async restoreById(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.restoreById(id);
  }

  @Patch(':carId/set-owner/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setOwner(
    @Param('carId', ParseIntPipe) carId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<void> {
    await this.service.setActiveOwnerToActiveCar(carId, userId);
  }
}
