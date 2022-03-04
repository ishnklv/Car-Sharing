import { CarEntity } from "../entity/car.entity";
import { db } from "../../db/db";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { QueryParams } from '../interface/query-params';
import { getSkipPaginationValue } from '../../shared/utils';

@Injectable()
export class CarRepository {
    async create(auto: CarEntity) {
        const data = await db.query(
            'INSERT INTO car (brand, model, state_number, vin) values ($1, $2, $3, $4) RETURNING *',
            [auto.brand, auto.model, auto.state_number, auto.vin]);
        if (data.rows.length == 0) {
            throw new HttpException({
                status: HttpStatus.NOT_FOUND,
                error: 'Could not create car, please try later',
            }, HttpStatus.NOT_FOUND);
        }
        return data.rows[0]
    }

    async findById( id: number): Promise<CarEntity> {
        const res = await db.query('SELECT * FROM car WHERE id = $1', [id]);
        if (res.rows.length == 0) {
            throw new HttpException({
                status: HttpStatus.NOT_FOUND,
                error: 'Unable found',
            }, HttpStatus.NOT_FOUND);
        }
        return res.rows[0];
    }

    async findAll( { page = 0, limit = 20, keyword = ''}: QueryParams){
        const skip = getSkipPaginationValue(page, limit);
        const data = await db.query(
          `SELECT * FROM car
                            WHERE brand LIKE ($1) OR model LIKE ($1) 
                            LIMIT ($2) OFFSET ($3)`,
          [`%${keyword}%`, limit, skip])
        return data.rows
    }
}
