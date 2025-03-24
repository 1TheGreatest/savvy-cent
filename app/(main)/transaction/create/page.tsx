import AddTransactionForm from "@/components/add-transaction-form";
import { defaultCategories } from "@/data/categories";
import { getUserAccounts } from "@/lib/actions/dashboard.actions";
import { getTransaction } from "@/lib/actions/transaction.actions";
import React from "react";

const AddTransactionPage = async ({
  searchParams,
}: TransactionPageSearchParams) => {
  const accounts = (await getUserAccounts()) ?? [];

  const editId = searchParams?.edit;

  let initialData = null;
  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }

  return (
    <div className="max-w-3xl mx-auto px-5">
      <h1 className="text-5xl gradient-title mb-8">
        {editId ? "Edit" : "Add"} Transaction
      </h1>

      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}
      />
    </div>
  );
};

export default AddTransactionPage;
