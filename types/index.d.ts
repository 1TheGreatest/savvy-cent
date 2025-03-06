declare interface CreateAccountProps {
  name: string;
  type: $Enums.AccountType;
  balance: Decimal;
  isDefault: boolean;
}

declare interface SerializedAccount {
  balance: Decimal;
  type: $Enums.AccountType;
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  isDefault: boolean;
}
