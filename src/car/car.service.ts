import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import {CreateCarDto} from "./dto/create-car.dto";
import {RentService} from "../rent/rent.service";
import * as moment from "moment";
import {CarStatus} from "../shared/car-status";
import {CarRepository} from "./repostory/car.repository";
import {CarEntity} from "./entity/car.entity";
import { QueryParams } from './interface/query-params';
import { REPOSE_DAY } from '../rent/constants';

@Injectable()
export class CarService {
  constructor(
      @Inject(forwardRef(() => RentService))
      private readonly rentService: RentService,
      private readonly carRepository: CarRepository,
  ) {}

  async create(dto: CreateCarDto) {
    const entity = new CarEntity();
    for (let key in dto) {
      entity[key] = dto[key];
    }

    return await this.carRepository.create(entity)
  }

  async findAll(query: QueryParams) {
    return await this.carRepository.findAll(query)
  }

  async findOne( id: number) {
    return await this.carRepository.findById(id)
  }

  async checkAvailability(id: number) {
    const car = await this.carRepository.findById(id);
    if (!car) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: 'Unable found car'
      }, HttpStatus.NOT_FOUND)
    }

    const rent = await this.rentService.findByCarId(car.id);

    if (!rent) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: 'Unable found rent by car'
      }, HttpStatus.NOT_FOUND)
    }

    if (rent.length == 0) {
      return { status: CarStatus.AVAILABLE }
    }

    const rentEndDate = moment(rent[0].created_at).add(rent[0].day, 'day');
    if (rentEndDate.isBefore(moment())) {
      if (rentEndDate.add(REPOSE_DAY, 'day').isAfter(moment())) {
        return { status: CarStatus.IN_REPOSE }
      }
      return { status: CarStatus.AVAILABLE }
    }
    return { status: CarStatus.UNAVAILABLE }
  }

  async checkStatusForDates( id: number, dateFrom: Date, days) {
    const car = await this.carRepository.findById(id);
    if (!car) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: 'Unable found car'
      }, HttpStatus.NOT_FOUND)
    }

    const rents = await this.rentService.findRentsByCarId(car.id);

    if (!rents.length) {
      return { status: CarStatus.AVAILABLE }
    }

    const startDate = moment(dateFrom);
    const endDate = startDate.clone().add(days,'day')
    for (let i = 0; i < rents.length; i++) {
      const rent = rents[i];
      const rentStartDate = moment(rent.created_at).add(REPOSE_DAY * -1, 'day');
      const rentEndDate = moment(rent.created_at).add(rent.day, 'day').add(REPOSE_DAY, 'day');
      if (
          startDate.isAfter(rentStartDate) && startDate.isBefore(rentEndDate)
          ||
          endDate.isAfter(rentStartDate) && endDate.isBefore(rentEndDate)
          ||
          rentStartDate.isAfter(startDate) && rentStartDate.isBefore(endDate)
          ||
          rentEndDate.isAfter(startDate) && rentEndDate.isBefore(endDate)
      ) {
        return { status: CarStatus.UNAVAILABLE }
      }
    }
    return { status: CarStatus.AVAILABLE }
  }
}
