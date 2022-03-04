import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { RentService } from "./rent.service";
import {CreateRentDto} from "./dto/create-rent.dto";
import { QueryParams } from './interface/query-params';
import { ApiQuery } from '@nestjs/swagger';

@Controller('/rent')
export class RentController {
  constructor(private rentService: RentService) {}
  @Post()
  create(@Body() dto: CreateRentDto) {
    return this.rentService.create(dto)
  }

  @Get()
  @ApiQuery({ type: Number, name: 'limit', required: false })
  @ApiQuery({ type: Number, name: 'page', required: false })
  @ApiQuery({ type: Number, name: 'car_id', required: false })
  findAll(@Query() query: QueryParams) {
    return this.rentService.findAll(query)
  }

  @Get('/:id')
  getDetail(@Param('id', ParseIntPipe) id: number) {
    return this.rentService.findOne(id)
  }

  @Get('report/:month')
  async getReport(@Param('month', ParseIntPipe) month: number) {
    return await this.rentService.createReport(month)
  }
}
