import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const serializeTransaction = (obj: SerializedAccount) => {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  // if (obj.amount) {
  //   serialized.amount = obj.amount.toNumber();
  // }
  return serialized;
};

export const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};
