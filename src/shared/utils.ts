import { RENT_COST, RENT_DAYS_COUNT } from '../rent/constants';

export const calcTotalPriceOfMonth = (days: number) => {
  let total: number = 0;
  for (let i = 1; i <= days; i++) {
    RENT_DAYS_COUNT.forEach(rentDay => {
      if (i >= rentDay[0] && i <= rentDay[1]) {
        total += RENT_COST - (RENT_COST * (rentDay[2]/100))
      }
    })
  }
  return total;
}

export const getSkipPaginationValue = (page: number, limit: number) => {
  const skip = page === 1 ? 0 : (page - 1) * page;
  return skip;
}
