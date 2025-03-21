declare interface CreateAccountProps {
  name: string;
  type: $Enums.AccountType;
  balance: Decimal;
  isDefault: boolean;
}

declare interface SerializedAccountProps {
  balance: Decimal;
  type: $Enums.AccountType;
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  isDefault: boolean;
}

declare interface SerializedTransactionProps {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  type: $Enums.TransactionType;
  amount: Decimal;
  description: string | null;
  date: Date;
  accountId: string;
  category: string;
  isRecurring: boolean;
  recurringInterval: $Enums.RecurringInterval;
  status: $Enums.TransactionStatus;
  receiptUrl: string | null;
  nextRecurringDate: Date | null;
  lastProcessed: Date | null;
}

declare interface TransactionsProps {
  transactions: SerializedTransactionProps[];
}

declare interface ParamProps {
  params: Promise<{ id: string }>;
}

declare interface AccumulatorProps {
  [key: string]: { date: string; income: number; expense: number };
}
// { [key: string]: { date: string; income: number; expense: number } }

declare interface BudgetProgressProps {
  initialBudget:
    | {
        amount: number;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        lastAlertSent: Date | null;
      }
    | null
    | undefined;
  currentExpenses: number;
}
declare interface TransactionFormProps {
  accounts: {
    balance: Decimal;
    type: $Enums.AccountType;
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    isDefault: boolean;
  }[];
  categories: (
    | {
        id: string;
        name: string;
        type: string;
        color: string;
        icon: string;
        subcategories?: undefined;
      }
    | {
        id: string;
        name: string;
        type: string;
        color: string;
        icon: string;
        subcategories: string[];
      }
  )[];
}
