import {forwardRef, HttpException, HttpStatus, Inject, Injectable} from "@nestjs/common";
import * as moment from "moment";
import {CarService} from "../car/car.service";
import {CreateRentDto} from "./dto/create-rent.dto";
import {CarStatus} from "../shared/car-status";
import {RentRepository} from "./repository/rent.repository";
import {RentEntity} from "./entity/rent.entity";
import { RENT_MAX_DAYS, RENT_MIN_DAYS, SATURDAY, SUNDAY } from './constants';
import { QueryParams } from './interface/query-params';
import { models } from '../config/models';
import { Moment } from 'moment';
import { IReport } from './interface/report';
import { CarEntity } from '../car/entity/car.entity';
import { calcTotalPriceOfMonth } from '../shared/utils';

@Injectable()
export class RentService {
  constructor(
      @Inject(forwardRef(() => CarService))
      private readonly autoService: CarService,
      private readonly rentRepository: RentRepository,
  ) {}

  async findByCarId( id: number): Promise<RentEntity[]> {
    return await this.rentRepository.findByCarId(id);
  }

  async create(dto: CreateRentDto) {
    const availability = await this.autoService.checkStatusForDates(dto.car_id, dto.date, dto.day);
    if (availability.status === CarStatus.UNAVAILABLE) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: 'This car unavailable to rent to this period',
      }, HttpStatus.FORBIDDEN);
    } else if (availability.status === CarStatus.IN_REPOSE) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: `Car in rest (${models.reposeDay} days) after previous rent`,
      }, HttpStatus.FORBIDDEN);
    }
    if (dto.day > RENT_MAX_DAYS || dto.day < RENT_MIN_DAYS){
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: `Invalid value for "days", you can rent car only for ${RENT_MIN_DAYS}-${RENT_MAX_DAYS} days`,
      }, HttpStatus.FORBIDDEN);
    }
    const beginDate: Moment = moment(dto.date);
    const beginDateWeekDay = beginDate.day();
    const endDate: Moment = moment(dto.date).add(dto.day, 'day');
    const endDateWeekDay = endDate.day();
    const deprecatedDays = [SATURDAY, SUNDAY];
    if (
        deprecatedDays.includes(beginDateWeekDay) ||
        deprecatedDays.includes(endDateWeekDay)
    ) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: 'You can not rent a car in that period. (beginning or end of period in not working days)',
      }, HttpStatus.FORBIDDEN);
    }
    const entity: RentEntity = new RentEntity();
    entity.created_at = dto.date;
    entity.car_id = dto.car_id;
    entity.day = dto.day;
    entity.price = calcTotalPriceOfMonth(dto.day)
    return await this.rentRepository.create(entity);
  }

  async createReport(month: number = 0): Promise<IReport[]> {
    const reportMonthBeginning: Moment = moment().startOf('month').add(month).startOf('month');
    const daysInCurrentMonth: number = reportMonthBeginning.daysInMonth();
    const cars: Array<CarEntity> = await this.autoService.findAll( { limit: 100, page: 0 });
    if (!cars.length) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: 'Unable found cars'
      }, HttpStatus.NOT_FOUND);
    }

    const carIds: Array<number> = cars.map(car => car.id);
    const rents: Array<RentEntity> = await this.rentRepository.findByCardIds(carIds);
    if (!rents.length) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: 'Unable found rents by cars'
      }, HttpStatus.NOT_FOUND);
    }
    const carRentCollection  = {};
    rents.forEach(rent => {
      let rentDaysInThisMonth = 0;
      const date: Moment = moment(rent.created_at)
      for (let i: number = 0; i < rent.day; i++){
        if(date.isSame(reportMonthBeginning, 'month')){
          rentDaysInThisMonth++;
        }
        date.add(1, 'day');
      }
      const id: number = rent.car_id;
      if(id in carRentCollection){
        carRentCollection[id].days += rentDaysInThisMonth;
      } else {
        carRentCollection[id] = {
          days: rentDaysInThisMonth,
        }
      }
    })
    return cars.map(car => {
      const report: IReport = {
        car_id: car.id,
        name: `${car.brand} ${car.model}`,
        state_number: car.state_number,
        percentage: `${0}%`,
      };
      if(car.id in carRentCollection){
        let days = carRentCollection[car.id].days
        report.percentage = Math.floor((100 / daysInCurrentMonth) * days) + '%';
      }
      return report;
    })
  }

  async findAll(query: QueryParams): Promise<RentEntity[]> {
    return await this.rentRepository.findAll(query);
  }

  async findRentsByCarId( id: number): Promise<RentEntity[]> {
    return await this.rentRepository.findAllByCarId(id);
  }

  async findOne( id: number): Promise<RentEntity> {
    return await this.rentRepository.findById(id);
  }
}
