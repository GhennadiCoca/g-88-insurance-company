import { Injectable } from '@nestjs/common';
import { Car } from './car.entity';
import { CarsRepository } from './cars.repository';
import { UsersService } from '../users/users.service';
import { CarsMapper } from './dto/cars.mapper';
import { CarSaveDto } from './dto/car.save-dto';
import { CarDto } from './dto/car.dto';
import { CarUpdateDto } from './dto/car.update-dto';
import { EntitySaveException } from '../exceptions/types/entity-save.exception';
import { EntityNotFoundException } from '../exceptions/types/entity-not-found.exception';
import { User } from '../users/user.entity';
import { EntityUpdateException } from '../exceptions/types/entity-update.exception';

@Injectable()
export class CarsService {
  constructor(
    private readonly repository: CarsRepository,
    private readonly userService: UsersService,
    private readonly mapper: CarsMapper,
  ) {}

  async create(saveDto: CarSaveDto): Promise<CarDto> {
    if (await this.repository.isVinExists(saveDto.vin)) {
      throw new EntitySaveException(Car.name, 'vin');
    }

    const entity: Car = this.mapper.mapDtoToEntity(saveDto);
    entity.active = true;
    await this.repository.save(entity);
    return this.mapper.mapEntityToDto(entity);
  }

  async getAllActiveCars(): Promise<CarDto[]> {
    const cars: Car[] = await this.repository.findAllActive();

    if (cars.length == 0) {
      throw new EntityNotFoundException(Car.name);
    }

    return this.mapper.mapEntityListToDtoList(cars);
  }

  async getActiveCarById(id: number): Promise<CarDto> {
    const car: Car = await this.getActiveEntityById(id);
    return this.mapper.mapEntityToDto(car);
  }

  async getActiveEntityById(id: number): Promise<Car> {
    const car: Car | null = await this.repository.findById(id);

    if (!car || !car.active) {
      throw new EntityNotFoundException(Car.name, id);
    }

    return car;
  }

  async update(id: number, updateDto: CarUpdateDto): Promise<void> {
    const foundCar: Car = await this.getActiveEntityById(id);
    foundCar.color = updateDto.newColor;
    await this.repository.save(foundCar);
  }

  async deleteById(id: number): Promise<void> {
    const car: Car = await this.getActiveEntityById(id);
    car.active = false;
    await this.repository.save(car);
  }

  async restoreById(id: number): Promise<void> {
    const car: Car | null = await this.repository.findById(id);

    if (!car) {
      throw new EntityNotFoundException(Car.name, id);
    }

    if (!car.active) {
      car.active = true;
      await this.repository.save(car);
    }
  }

  async setActiveOwnerToActiveCar(
    carId: number,
    ownerId: number,
  ): Promise<void> {
    const car: Car = await this.getActiveEntityById(carId);
    const owner: User = await this.userService.getActiveEntityById(ownerId);

    if (car.owner?.id === owner.id) {
      throw new EntityUpdateException(
        `User id ${ownerId} is already owner of the car id ${carId}`,
      );
    }

    car.owner = owner;
    await this.repository.save(car);
  }
}
