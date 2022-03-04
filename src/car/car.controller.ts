import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CreateCarDto } from "./dto/create-car.dto";
import { CarService } from "./car.service";
import { QueryParams } from './interface/query-params';
import { ApiQuery } from '@nestjs/swagger';
import { CarEntity } from './entity/car.entity';

@Controller('/car')
export class CarController {
  constructor(private carService: CarService) {}

  @Post()
  async create(@Body() dto: CreateCarDto): Promise<CarEntity> {
    return await this.carService.create( dto )
  }

  @Get('/:id/available')
  async checkIfCarIsAvailable(@Param('id', ParseIntPipe) id: number) {
    return await this.carService.checkAvailability(id);
  }

  @Get()
  @ApiQuery({ type: Number, name: 'limit', required: false })
  @ApiQuery({ type: Number, name: 'page', required: false })
  @ApiQuery({ type: String, name: 'keyword', required: false })
  async findAll(@Query() query: QueryParams): Promise<CarEntity[]> {
    return await this.carService.findAll(query)
  }

  @Get('/:id')
  async findOne( @Param('id', ParseIntPipe) id: number): Promise<CarEntity> {
    return await this.carService.findOne(id)
  }
}
