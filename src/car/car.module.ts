import { Module } from "@nestjs/common";
import { CarService } from "./car.service";
import { CarController } from "./car.controller";
import { RentService } from "../rent/rent.service";
import { RentController } from "../rent/rent.controller";
import {CarRepository} from "./repostory/car.repository";
import {RentRepository} from "../rent/repository/rent.repository";

@Module({
  providers: [CarService, RentService, CarRepository, RentRepository],
  controllers: [CarController, RentController],
  exports: [CarService, RentService]
})
export class CarModule {}
