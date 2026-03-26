export const getCurrentMonth = (): number => new Date().getMonth() + 1;

export const getCurrentYear = (): number => new Date().getFullYear();

export const getCurrentMonthAndYear = (): { month: number; year: number } => ({
  month: getCurrentMonth(),
  year: getCurrentYear(),
});
