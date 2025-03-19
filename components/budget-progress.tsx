"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Check, Pencil, X } from "lucide-react";
import { Input } from "./ui/input";
import useFetch from "@/hooks/use-fetch";
import { updateBudget } from "@/lib/actions/budget.actions";
import { toast } from "sonner";
import { Progress } from "./ui/progress";

const BudgetProgress = ({
  initialBudget,
  currentExpenses,
}: BudgetProgressProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount.toString() || ""
  );

  const percentUsed = initialBudget
    ? (currentExpenses / initialBudget.amount) * 100
    : 0;

  const {
    data: updateBudgetData,
    loading: updateBudgetLoading,
    error,
    fn: updateBudgetFn,
  } = useFetch(updateBudget);

  useEffect(() => {
    if (updateBudgetData && !updateBudgetLoading) {
      toast.success("Budget updated successfully");
      setIsEditing(false);
    }
  }, [updateBudgetData, updateBudgetLoading]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to update budget. Please try again.");
    }
  }, [error]);

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid budget amount");
      return;
    }

    await updateBudgetFn(amount);
  };

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount.toString() || "");
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle>Monthly Budget (Default Account)</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-32"
                  placeholder="Enter amount"
                  autoFocus
                  disabled={updateBudgetLoading}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUpdateBudget}
                  disabled={updateBudgetLoading}
                >
                  <Check className="h-4 w-4 text-green-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  disabled={updateBudgetLoading}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ) : (
              <></>
            )}
            <CardDescription>
              {initialBudget
                ? `$${currentExpenses.toFixed(
                    2
                  )} of $${initialBudget.amount.toFixed(2)} spent`
                : "No budget set"}
            </CardDescription>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="h-6 w-6"
              hidden={isEditing}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p>
          {initialBudget && (
            <div>
              <Progress value={percentUsed} />
            </div>
          )}
        </p>
      </CardContent>
    </Card>
  );
};

export default BudgetProgress;
