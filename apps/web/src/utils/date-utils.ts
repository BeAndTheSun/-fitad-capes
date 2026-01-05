import { format } from 'date-fns';

export type DateRangeResult = {
  dateFrom: Date;
  dateTo: Date;
  groupBy: string;
};

export const calculateDateRange = (
  dateRangeSelect: string
): DateRangeResult => {
  const dateTo = new Date();
  const dateFrom = new Date();
  let groupBy = '';

  switch (dateRangeSelect) {
    case 'today':
      dateFrom.setHours(0, 0, 0, 0);
      groupBy = 'day';
      break;

    case '7days':
      dateFrom.setDate(dateTo.getDate() - 6);
      groupBy = 'day';
      break;

    case '3Months':
      dateFrom.setMonth(dateTo.getMonth() - 2);
      groupBy = 'month';
      break;

    case '6Months':
      dateFrom.setMonth(dateTo.getMonth() - 5);
      groupBy = 'month';
      break;

    case 'year':
      dateFrom.setMonth(dateTo.getMonth() - 11);
      groupBy = 'month';
      break;

    default:
      throw new Error(`Invalid date range: ${dateRangeSelect}`);
  }

  return { dateFrom, dateTo, groupBy };
};

export const handleDate = (date: string, showTime: boolean): string => {
  const localDate = new Date(date);

  const pattern = showTime ? 'yyyy-MM-dd - hh:mm a' : 'yyyy-MM-dd';
  return format(localDate, pattern);
};
