import {CarEntity} from "../../car/entity/car.entity";

export class RentEntity {
    id: number;
    car_id: number;
    car: CarEntity;
    day: number;
    created_at: Date;
    price: number;
}
