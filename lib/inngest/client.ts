import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "savvycent",
  name: "SavvyCent",
  retryFunction: async (attempt: number) => ({
    delay: Math.pow(2, attempt) * 1000, // Exponential backoff
    maxAttempts: 2, // Maximum of 2 attempts
  }),
});
