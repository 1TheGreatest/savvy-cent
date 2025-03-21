"use client";
import useFetch from "@/hooks/use-fetch";
import { createTransaction } from "@/lib/actions/transaction.actions";
import { transactionSchema } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const AddTransactionForm = ({
  accounts,
  categories,
}: TransactionFormProps[]) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "EXPENSE",
      amount: "",
      description: "",
      date: new Date(),
      accountId: accounts.find((ac) => ac.isDefault)?.id,
      category: "",
      isRecurring: false,
    },
  });

  // Invoking the server actions
  const {
    data: transactionResult,
    loading: createTransactionLoading,
    error,
    fn: createTransactionFn,
  } = useFetch(createTransaction);

  useEffect(() => {
    if (transactionResult && !createTransactionLoading) {
      toast.success("Transaction created successfully");
      // reset();
      // setOpen(false);
    }
  }, [createTransactionLoading, transactionResult, reset]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to create transaction. Please try again.");
    }
  }, [error]);

  const onSubmit = async (values: z.infer<typeof accountSchema>) => {
    await createTransactionFn(values);
  };

  return (
    <form>
      {/* AI SC */}
      <div>
        <label htmlFor="">Type</label>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </form>
  );
};

export default AddTransactionForm;
