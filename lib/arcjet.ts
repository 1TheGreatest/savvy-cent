import arcjet, { tokenBucket } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  // Track requests by a Clerk user ID
  characteristics: ["userId"],
  rules: [
    // Rate limiting specifically for collection creation
    tokenBucket({
      mode: "LIVE",
      characteristics: ["userId"],
      refillRate: 2, // 5 tokens per interval
      interval: 20, // per hour
      capacity: 2, // maximum bucket capacity of 10
    }),
  ],
});

export default aj;
