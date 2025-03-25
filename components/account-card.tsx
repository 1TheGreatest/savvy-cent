"use client";
import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Switch } from "./ui/switch";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import CountUp from "react-countup";
import { updateDefaultAccount } from "@/lib/actions/accounts.actions";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

const AccountCard = ({
  name,
  type,
  balance,
  id,
  isDefault,
}: SerializedAccountProps) => {
  // Fetch the updated account data from the server
  // Invoking the server actions
  const {
    data: updatedAccount,
    loading: updateDefaultLoading,
    error,
    fn: updateDefaultFn,
  } = useFetch(updateDefaultAccount);

  useEffect(() => {
    if (updatedAccount && !updateDefaultLoading) {
      toast.success("Default account updated successfully");
    }
  }, [updateDefaultLoading, updatedAccount]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle the default account change
  const handleDefaultChange = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault(); // Prevent the switch from toggling

    if (isDefault) {
      toast.warning("You need to have at least one default account");
      return; // Do not allow toggling off the default account
    }

    await updateDefaultFn(id);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow group relative cursor-pointer">
      <Link href={`/account/${id}`}>
        <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
          <CardTitle className="text-sm font-medium capitalize">
            {name}
          </CardTitle>
          <Switch
            checked={isDefault}
            onClick={handleDefaultChange}
            disabled={updateDefaultLoading}
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            $
            <CountUp
              end={parseFloat(parseFloat(balance).toFixed(2))}
              duration={0.5}
            />
          </div>
          <p className="text-sm text-muted-foreground">{type} Account</p>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <ArrowUpRight className="h-4 w-4 mr-1 text-green-500" />
            Income
          </div>
          <div className="flex items-center">
            <ArrowDownRight className="h-4 w-4 mr-1 text-red-500" />
            Expense
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

export default AccountCard;
