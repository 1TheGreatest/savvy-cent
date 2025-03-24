declare interface CreateAccountProps {
  name: string;
  type: $Enums.AccountType;
  balance: Decimal;
  isDefault: boolean;
}
declare interface CreateTransactionProps {
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: Date;
  category: string;
  isRecurring: boolean;
  accountId: string;
  description?: string | undefined;
  recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | undefined;
}

declare interface UpdateTransactionProps {
  amount: number;
  category: string;
  type: "INCOME" | "EXPENSE";
  date: Date;
  isRecurring: boolean;
  accountId: string;
  description?: string | undefined;
  recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | undefined;
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

declare interface DashboardOverviewProps {
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
  transactions: {
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
  }[];
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
  editMode: boolean;
  initialData: SerializedTransactionProps | null;
}

type Account = {
  balance: Decimal;
  type: $Enums.AccountType;
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  isDefault: boolean;
};

type Budget =
  | {
      budget: {
        amount: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        lastAlertSent: Date | null;
      } | null;
      currentExpenses: number;
    }
  | undefined;

type Transaction = {
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
};

type ScannedData = {
  amount: number;
  description: string;
  date: Date;
  category: string;
  merchant: string;
};

declare interface ReceiptScannerProps {
  onScanComplete: (data: ScannedData) => void;
}

declare interface TransactionPageSearchParams {
  searchParams: { edit?: string };
}

interface StatProps {
  totalExpenses: number;
  totalIncome: number;
  byCategory: {
    [key: string]: number;
  };
  transactionCount: number;
}

type MonthlyReportData = {
  month: string;
  stats: {
    totalIncome: number;
    totalExpenses: number;
    byCategory: {
      [key: string]: number;
    };
  };
  insights: string[];
};

type BudgetAlertData = {
  percentageUsed: number;
  budgetAmount: number;
  totalExpenses: number;
};

declare interface EmailTemplateProps {
  userName: string;
  type: string;
  emailData: MonthlyReportData | BudgetAlertData;
}
