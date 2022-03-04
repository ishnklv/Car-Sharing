import { IPagination } from '../../shared/interface/pagination';

export interface QueryParams extends IPagination{
  keyword?: string;
  state_number?: string;
}
