import { IPagination } from '../../shared/interface/pagination';

export interface QueryParams extends IPagination {
  car_id?: number;
}
