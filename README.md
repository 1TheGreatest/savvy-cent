# SavvyCent

SavvyCent is a comprehensive **finance management platform** designed to empower users with seamless tracking and analysis of their financial activities. Built with modern technologies like **React**, **Next.js**, and **TailwindCSS**, it offers a user-friendly interface coupled with powerful features to enhance personal and business finance management.

## 🚀 Features

- **Multi-Account Income & Expense Tracking**: Monitor financial transactions across various accounts with intelligent categorization, including labels like shopping, rent, food, and salary

- **AI-Powered Receipt Data Extraction**: Utilize OpenAI's API to automatically extract and categorize data from uploaded receipts, streamlining data entry and organization

- **Recurring Transactions**: Set up and manage recurring transactions to automate regular income and expenses

- **Spending Limit Alerts**: Receive email notifications when approaching predefined spending thresholds, helping maintain budget discipline

- **Interactive Financial Visualizations**: Analyze daily transactions and long-term financial data through dynamic charts and graphs powered by Recharts

- **Personalized Monthly AI Reports**: Get AI-generated monthly email reports providing insights into spending habits and financial health

- **Secure User Authentication**: Implemented via Clerk to ensure robust and seamless user login and registration processes

- **Database Management**: Leveraging Prisma with a PostgreSQL database hosted on Supabase for efficient and scalable data handling

- **Rate Limiting and Security**: Integrated Arcjet to prevent server overload by limiting transaction entries and protecting against potential attacks and bot activities

- **Automated Notifications and Task Scheduling**: Utilized Inngest to set up cron jobs for sending budget alerts, monthly AI insights, and processing recurring transactions

## 🛠️ Tech Stack

- **Frontend** React, Next.js, TailwindCSS

- **Backend** Node.js, Prisma

- **Database** PostgreSQL (hosted on Supabase)

- **Authentication** Clerk

- **AI Integration** OpenAI

- **Data Visualization** Recharts

- **Security and Rate Limiting** Arcjet

- **Task Scheduling** Inngest

## 📂 Project Structure

- \*_`app/`_: Main application components and pages.

- \*_`components/`_: Reusable UI components.

- \*_`data/`_: Static data and configurations.

- \*_`hooks/`_: Custom React hooks for shared logic.

- \*_`lib/`_: Utility functions and libraries.

- \*_`prisma/`_: Prisma schema and database migrations.

- \*_`public/`_: Static assets like images and fonts.

- \*_`types/`_: TypeScript type definitions.

## 🏗️ Installation & Setup

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.og/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.cm/)

### Clone the Repository

```bsh
 git clone https://github.com/1TheGreatest/savvy-cent.git
cd savvy-cent
```

### Install Dependencies

```bsh
 npm install
# or
yarn install
```



### Environment Variables

Create a `.env.local` file in the root directory and configure the following variables:

```nv
 DATABASE_URL=
DIRECT_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

GEMINI_API_KEY=

RESEND_API_KEY=

ARCJET_KEY=
```

Replace the placeholders with your actual credentials.

### Run the Development Server

```bsh
 npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## 🌍 Live Demo

Check out the live version: [SavvyCent](https://savvy-cent.vercel.app/)

## Contact

Feel free to reach out to me via [email](mailto:sampomahdev@gmail.com) or connect with me on [LinkedIn](https://www.linkedin.com/in/solomon-ampomah-a67128141/).
