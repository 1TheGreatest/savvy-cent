import AccountCard from "@/components/account-card";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { getUserAccounts } from "@/lib/actions/dashboard.actions";
import { Plus } from "lucide-react";
import React from "react";

const DashboardPage = async () => {
  const accounts = await getUserAccounts();
  return (
    <div className="px-5">
      Budget Progess over all budget account grid
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

            // <Card key={account.id}>
            //   <CardContent>
            //     <h3 className="text-lg font-semibold">{account.name}</h3>
            //     <p className="text-sm text-muted-foreground">
            //       {account.transactions} transactions
            //     </p>
            //   </CardContent>
            // </Card>
          ))}
      </div>
    </div>
  );
};

export default DashboardPage;
