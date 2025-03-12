import { endOfDay, format, startOfDay, subDays } from "date-fns";
import React, { useMemo, useState } from "react";

const DATE_RANGES: { [key: string]: { label: string; days: number | null } } = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  ALL: { label: "All Time", days: null },
};

const AccountChart = ({ transactions }: TransactionsProps) => {
  //   const [dateRange, setDateRange] = useState<keyof typeof DATE_RANGES>("1M");
  const [dateRange, setDateRange] = useState("1M");

  const filteredTransactions = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(new Date(0));

    // Filter transactions based on the date range
    const filtered = transactions.filter(
      (transaction) =>
        new Date(transaction.date) >= startDate &&
        new Date(transaction.date) <= endOfDay(now)
    );

    const grouped = filtered.reduce((acc: AccumulatorProps, transaction) => {
      const date = format(new Date(transaction.date), "MMM dd");
      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 };
      }
      if (transaction.type === "INCOME") {
        acc[date].income += transaction.amount;
      } else {
        acc[date].expense += transaction.amount;
      }

      return acc;
    }, {});

    // Convert to array and sort by date
    return Object.values(grouped).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [transactions, dateRange]);

  return <div>AccountChart</div>;
};

export default AccountChart;
