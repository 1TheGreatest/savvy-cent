import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  // Check if user exist in clerk
  if (!user) {
    return null;
  }

  // Check if user exist in database
  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    // Return user if exist
    if (loggedInUser) {
      return loggedInUser;
    }

    // Create user if not exist
    const name = `${user.firstName} ${user.lastName}`;
    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      },
    });
    return newUser;
  } catch (error) {
    console.error(error);
  }
};
