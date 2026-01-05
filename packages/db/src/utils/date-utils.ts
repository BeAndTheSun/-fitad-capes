/**
 * Generates an array of date strings (YYYY-MM-DD) for the past 28 days, including today.
 *
 * TODO: Use this in the query functions that fetch metrics to ensure all dates in the
 * range are covered, filling missing dates with a default value (e.g., 0 count).
 *
 * @returns {string[]} - Array of date strings
 */

export const generateDatesFrom28DaysAgo = (): string[] => {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 28; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(today.getDate() - i);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    const formattedDate = `${yyyy}-${mm}-${dd}`;
    dates.push(formattedDate);
  }

  return dates;
};

export const generateFullPeriodRange = (
  groupBy: string,
  dateFrom?: string,
  dateTo?: string
): string[] => {
  const start = new Date(dateFrom || new Date());
  const end = new Date(dateTo || new Date());
  const periods: string[] = [];

  const current = new Date(start);
  if (groupBy === 'day') {
    while (current <= end) {
      periods.push(
        current.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      );
      current.setDate(current.getDate() + 1);
    }
  } else if (groupBy === 'month') {
    while (current <= end) {
      periods.push(
        current.toLocaleDateString('en-GB', {
          month: 'short',
          year: 'numeric',
        })
      );
      current.setMonth(current.getMonth() + 1);
    }
  }

  return periods;
};
