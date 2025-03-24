import AccountCard from "@/components/account-card";
import BudgetProgress from "@/components/budget-progress";
import CreateAccountDrawer from "@/components/create-account-drawer";
import DashboardOverview from "@/components/dashboard-overview";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentBudget } from "@/lib/actions/budget.actions";
import {
  getDashboardData,
  getUserAccounts,
} from "@/lib/actions/dashboard.actions";
import { Plus } from "lucide-react";
import React, { Suspense } from "react";

const DashboardPage = async () => {
  const accounts = (await getUserAccounts()) ?? [];
  const defaultAccount = accounts.find((account) => account.isDefault);

  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  const transactions = (await getDashboardData()) ?? [];
  return (
    <div className="space-y-8 px-5">
      {defaultAccount && (
        <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpenses={budgetData?.currentExpenses || 0}
        />
      )}
      {/* overview */}
      <Suspense fallback={"Loading..."}>
        <DashboardOverview accounts={accounts} transactions={transactions} />
      </Suspense>
      all budget
      {/* account grid */}
      <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer boder-dashed">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {accounts.length > 0 &&
          accounts.map((account) => (
            <AccountCard key={account.id} {...account} />
          ))}
      </div>
    </div>
  );
};

export default DashboardPage;
