import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {RentEntity} from "../entity/rent.entity";
import {db} from "../../db/db";
import * as moment from "moment";
import { QueryParams } from '../interface/query-params';
import { getSkipPaginationValue } from '../../shared/utils';

@Injectable()
export class RentRepository {

    async create(entity: RentEntity) {
        const rent = await db.query(
          'INSERT INTO rent (car_id, created_at, day, price) values ($1, $2, $3, $4) RETURNING *',
          [entity.car_id, moment(entity.created_at).utc(true), entity.day, entity.price])
        return rent.rows[0]
    }

    async findAll( { page = 0, limit = 20, car_id }: QueryParams) {
        const skip = getSkipPaginationValue(page, limit);
        const rents = await db.query(
          `SELECT * FROM rent 
                        ${car_id && `WHERE car_id = ${car_id}`} 
                        LIMIT ($1) OFFSET ($2)`,
          [limit, skip]);
        return rents.rows
    }

    async findById( id: number){
        const rent = await db.query('SELECT * FROM rent WHERE id=$1', [id])
        if (rent.rows.length == 0) {
            throw new HttpException({
                status: HttpStatus.NOT_FOUND,
                error: 'Unable found',
            }, HttpStatus.NOT_FOUND);
        }
        return rent.rows[0]
    }

    async findByCarId( id: number) {
        const rents = await db.query(
          'SELECT * FROM rent WHERE car_id = $1 ORDER BY created_at DESC LIMIT 1',
          [id]);
        return rents.rows
    }

    async findByCardIds( ids: number[]) {
        if (ids.length < 1){
            return [];
        }
        const rents = await db.query(
            `SELECT * FROM rent WHERE car_id IN (${ids.join(', ')})`,
            []);
        return rents.rows
    }

    async findAllByCarId( id: number) {
        const rents = await db.query(
            'SELECT * FROM rent WHERE car_id = $1',
            [id]);
        return rents.rows
    }
}
