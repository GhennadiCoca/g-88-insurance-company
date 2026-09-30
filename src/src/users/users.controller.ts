import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { User } from './user.entity';
import { Role } from './enums/role.enum';
import { UsersService } from './users.service';

// http://10.20.30.40:3001/users
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  // POST -> http://10.20.30.40:3001/users
  @Post()
  async create(@Body() user: User): Promise<User> {
    return this.service.create(user);
  }

  // GET 10.20.30.40:3000/users
  @Get()
  async getAll(): Promise<User[]> {
    return this.service.getAllActiveUsers();
  }

  // GET 10.20.30.40:3000/users?id=7 -> '7'
  // GET 10.20.30.40:3000/users/7 - предпочтительный подход для id
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.service.getActiveUserById(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() user: User
  ): Promise<void> {
    await this.service.update(id, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteById(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.deleteById(id);
  }

  // PATCH 10.20.30.40:3000/users/5/set-role/ADMIN
  @Patch(':id/set-role/:role')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setRole(
    @Param('id', ParseIntPipe) id: number,
    @Param('role', new ParseEnumPipe(Role)) role: Role,
  ): Promise<void> {
    await this.service.setRole(id, role);
  }
}
