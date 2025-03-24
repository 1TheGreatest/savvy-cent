"use client";
import useFetch from "@/hooks/use-fetch";
import { createTransaction } from "@/lib/actions/transaction.actions";
import { transactionSchema } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import CreateAccountDrawer from "./create-account-drawer";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { Switch } from "./ui/switch";
import { useRouter } from "next/navigation";
import ReceiptScanner from "./receipt-scanner";

const AddTransactionForm = ({ accounts, categories }: TransactionFormProps) => {
  console.log(accounts.find((ac) => ac.isDefault)?.id);
  const router = useRouter();

  // React Hook Form
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
    reset,
  } = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "EXPENSE",
      amount: "",
      description: "",
      date: new Date(),
      accountId: accounts.find((ac) => ac.isDefault)?.id || "",
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
      reset();
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [createTransactionLoading, transactionResult, reset, router]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to create transaction. Please try again.");
    }
  }, [error]);

  const onSubmit = async (values: z.infer<typeof transactionSchema>) => {
    const formValues = {
      ...values,
      amount: parseFloat(values.amount),
    };
    await createTransactionFn(formValues);
  };

  const filteredCategories = categories.filter(
    (category) => category.type === watch("type")
  );

  const handleScanComplete = (scannedData: {
    amount: number;
    description: string;
    date: Date;
    category: string;
  }) => {
    if (scannedData) {
      setValue("amount", scannedData.amount.toString());
      if (scannedData.description)
        setValue("description", scannedData.description);
      setValue("date", new Date(scannedData.date));
      if (scannedData.category) setValue("category", scannedData.category);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {/* AI SC */}
      <ReceiptScanner onScanComplete={handleScanComplete} />

      {/* Transaction Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Type</label>
        <Select
          onValueChange={(value) =>
            setValue("type", value as "EXPENSE" | "INCOME")
          }
          defaultValue={watch("type")}
        >
          <SelectTrigger className="">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">Expense</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Amount */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <Input
            type="number"
            id="amount"
            step="0.01"
            placeholder="0.00"
            {...register("amount")}
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        {/* Account selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Account</label>
          <Select
            onValueChange={(value) => setValue("accountId", value)}
            defaultValue={getValues("accountId")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} (${parseFloat(account.balance).toFixed(2)})
                </SelectItem>
              ))}
              <CreateAccountDrawer>
                <Button
                  variant="ghost"
                  className="w-full select-none items-center text-sm outline-none"
                >
                  Create Account
                </Button>
              </CreateAccountDrawer>
            </SelectContent>
          </Select>
          {errors.accountId && (
            <p className="text-sm text-red-500">{errors.accountId.message}</p>
          )}
        </div>
      </div>

      {/* Category selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select
          onValueChange={(value) => setValue("category", value)}
          defaultValue={getValues("category")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>

      {/* Date selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full pl-3 text-left font-normal"
            >
              {watch("date") ? (
                format(watch("date"), "PPP")
              ) : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="h-4 w-4 ml-auto opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={watch("date")}
              onSelect={(date) => setValue("date", date as Date)}
              disabled={(date) =>
                date > new Date() || date < new Date("1970-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Input
          id="description"
          placeholder="Enter description"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Recurring Transaction */}
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-1">
          <label className="text-sm font-medium cursor-pointer">
            Recurring Transaction
          </label>
          <p className="text-sm text-muted-foreground">
            Set this transaction to recur every month
          </p>
        </div>
        <Switch
          id="isRecurring"
          onCheckedChange={(checked) => setValue("isRecurring", checked)}
          checked={watch("isRecurring")}
        />
      </div>

      {/* Recurring Interval selection */}
      {watch("isRecurring") && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Recurring Interval</label>
          <Select
            onValueChange={(value) =>
              setValue(
                "recurringInterval",
                value as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
              )
            }
            defaultValue={getValues("recurringInterval")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
          {errors.recurringInterval && (
            <p className="text-sm text-red-500">
              {errors.recurringInterval.message}
            </p>
          )}
        </div>
      )}

      <div className="flex space-x-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          className="flex-1"
          disabled={createTransactionLoading}
        >
          {createTransactionLoading ? (
            <>
              <Loader2 className="animate-spin" />
              Creating Transaction...
            </>
          ) : (
            "Create Transaction"
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddTransactionForm;
