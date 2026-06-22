## 🚀 Key Features

- **Strict Type Safety**: Fully written in TypeScript with customized interfaces, request/response DTOs, and runtime validation.
- **Dual-Token Authentication (JWT)**: Implementation of short-lived `Access Tokens` (stored in-memory/cookies) and long-lived `Refresh Tokens`.
- **Token Rotation & Revocation**: Refresh tokens are tracked via **Redis** for fast lookups, enabling instant session revocation upon user logout or security breach.
- **Secure Password Hashing**: Utilizes **bcrypt** with optimal salt rounds to safeguard user credentials.
- **Automated Email Workflows**: Integrated with **Nodemailer** for seamless Email Verification and Reset Password flows.
- **Centralized Error Handling**: Custom global error-handling middleware ensuring clean API responses and preventing sensitive data leaks.
- **Prisma ORM**: Abstracted database layer with automated type generation and migration workflows.

---

## 🛠️ Tech Stack

- **Language:** TypeScript
- **Framework:** Express.js
- **Database & ORM:** PostgreSQL / MySQL, Prisma ORM
- **Caching & Session Storage:** Redis
- **Security & Auth:** JSON Web Tokens (JWT), bcrypt
- **Mailing:** Nodemailer

---

## 📂 Project Structure

The project follows a modular and scalable directory structure:

```text
src/
├── @types/            # Custom TypeScript type definitions
├── controllers/       # HTTP Request handlers (Extracts data, passes to services)
├── middlewares/       # Auth guards, request validators
├── routes/            # API routing splitting by domain
├── services/          # Core business logic (JWT processing, Mail sending, Hash helper)
├── utils/             # Helper functions
└── app.ts             # Express app setup and middleware registration
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **npm**
- Running **Redis** instance
- Running Database instance supported by Prisma (PostgreSQL)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Phan-Phuoc-Tai/back-end-authentication.git
   cd back-end-authentication
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:

   ```env
   PORT=5000
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DB_NAME?schema=public"
   HOST=localhost
   REDIS_PORT=6380

   JWT_SECRET="your_super_secret_jwt_key_min_32_chars"
   JWT_EXPIRE=0.25h
   JWT_REFRESH_SECRET="your_super_secret_refresh_key_min_32_chars"
   JWT_REFRESH_EXPIRE=7d

   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USERNAME="your_email@gmail.com"
   SMTP_PASSWORD="your_gmail_app_password"
   SMTP_FROM_NAME=F8 Student
   SMTP_FROM_EMAIL="your_email@gmail.com"
   ```

4. **Generate Prisma client**

   ```bash
   npx prisma generate
   ```

5. **Run Database Migrations**

   ```bash
   npx prisma migrate dev
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

---

## 📡 API Endpoints

### Auth Domain

| Method   | Endpoint                    | Description                                              | Protected |
| :------- | :-------------------------- | :------------------------------------------------------- | :-------: |
| **POST** | `/api/auth/register`        | Register new account & trigger verification email        |    ❌     |
| **POST** | `/api/auth/verify-email`    | Verify account using OTP sent via email                  |    ❌     |
| **POST** | `/api/auth/login`           | Authenticate user, return tokens & save session to Redis |    ❌     |
| **POST** | `/api/auth/refresh-token`   | Generate new Access Token using valid Refresh Token      |    ❌     |
| **POST** | `/api/auth/logout`          | Revoke Refresh Token from Redis & clear session          |    ❌     |
| **POST** | `/api/auth/forgot-password` | Request password reset OTP                               |    ❌     |
| **POST** | `/api/auth/reset-password`  | Reset password using OTP                                 |    ❌     |

---

## 🔒 Security Best Practices Implemented

1. **Token Blacklisting**: Blacklisting compromised tokens in Redis for absolute security.
2. **Environment Isolation**: Critical configuration strictly separation using `.env`.
3. **Safe Error Responses**: Operational errors are formatted cleanly while technical stack traces are hidden in production mode.
