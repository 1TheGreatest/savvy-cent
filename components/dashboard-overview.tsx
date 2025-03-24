"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { format } from "date-fns";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// Define colors array
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

const DashboardOverview = ({
  accounts,
  transactions,
}: DashboardOverviewProps) => {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((account) => account.isDefault)?.id || accounts[0]?.id
  );

  // Filter transactions by selected account
  const filteredTransactions = transactions.filter(
    (transaction) => transaction.accountId === selectedAccountId
  );

  const recentTransactions = filteredTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  //Calculate expense breakdown for current month
  const currentDate = new Date();
  const currentMonthExpenses = filteredTransactions.filter(
    (transaction) =>
      transaction.type === "EXPENSE" &&
      new Date(transaction.date).getMonth() === currentDate.getMonth() &&
      new Date(transaction.date).getFullYear() === currentDate.getFullYear()
  );

  // Group expenses by category
  const groupedExpenses = currentMonthExpenses.reduce(
    (acc: { [key: string]: number }, transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = 0; // Initialize category if it doesn't exist
      }
      acc[category] += transaction.amount;
      return acc;
    },
    {}
  );

  // Format data for pie chart
  const pieChartData = Object.entries(groupedExpenses).map(
    ([category, amount]) => ({
      name: category,
      value: amount,
    })
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
          <CardTitle className="text-base font-normal">
            Recent Transactions
          </CardTitle>
          <Select
            value={selectedAccountId}
            onValueChange={(value) => setSelectedAccountId(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No recent transactions
              </p>
            ) : (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm leading-none">
                      {transaction.description || "Untitled Transaction"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), "PP")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex items-center",
                        transaction.type === "INCOME"
                          ? "text-green-500"
                          : "text-red-500"
                      )}
                    >
                      {transaction.type === "INCOME" ? (
                        <ArrowUpRight className="mr-1 h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="mr-1 h-4 w-4" />
                      )}
                      <p>${transaction.amount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-normal">
            Monthly Expense Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-5">
          {pieChartData.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No expenses this month
            </p>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) =>
                      `${name} - $${value.toFixed(2)}`
                    }
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `$${Number(value).toFixed(2)}`}
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
