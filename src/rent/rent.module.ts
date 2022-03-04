import { Module } from '@nestjs/common';
import {RentService} from "./rent.service";
import {CarService} from "../car/car.service";
import {CarRepository} from "../car/repostory/car.repository";
import {RentRepository} from "./repository/rent.repository";

@Module({
    providers: [
        RentService,
        CarService,
        CarRepository,
        RentRepository,
    ]
})
export class RentModule {}
