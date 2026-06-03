# 🚀 Sweet Shop Dashboard (MERN Stack)

🔗 **Public Repository:**  
<https://github.com/rajkunal024/sweet-shop-dashboard.git>

---

## 📌 Project Overview

This is a modern, responsive **MERN (MongoDB, Express, React, Node.js) Stack** web application designed to manage a sweet shop's inventory, user profiles, purchases, and administration operations. 

It is split into:
- **`backend/`**: A Node.js + Express API server with MongoDB schemas and models, JWT authentication, role checks, and database seeding.
- **`frontend/`**: A React + JavaScript (JSX) application powered by Vite, Tailwind CSS, shadcn-ui, and React Query.

---

## 🛠️ Technologies Used

### Frontend
- **React (JSX)** – Component-based UI library (pure JavaScript without compiler overhead)
- **Vite** – High-performance development server and bundler
- **Tailwind CSS** – Utility-first CSS styling
- **shadcn-ui & Radix** – Premium, accessible UI components
- **React Query (TanStack)** – Async state management and server-state caching

### Backend
- **Node.js (ESM)** – JavaScript runtime environment using native ES modules
- **Express** – Web application framework for routing and middleware
- **MongoDB & Mongoose** – NoSQL database cluster and ODM modeling
- **JSON Web Tokens (JWT)** – Secure session verification and role-based access
- **Bcrypt.js** – Secure password hashing

---

## 🧭 Account Registration & Authentication

### 🔐 Login
1. Navigate to the **Login** page.
2. Enter your registered email and password.
3. Click **Sign In**.

### 👤 Customer Sign Up
1. Open the app and click **Sign up**.
2. Select **User Signup** tab.
3. Enter your **Full Name**, **Email**, and **Password** (min 6 characters).
4. Click **Create Account**.
> *Note: Customers are blocked from registering with `@sweetshop.com` emails to protect admin access.*

### 🛡️ Admin Sign Up
1. Click **Sign up** and toggle to the **Admin Signup** tab.
2. Enter your **Full Name**, a **`@sweetshop.com` email address**, and **Password**.
3. Enter the **Admin Access Key**: `024`.
4. Click **Register Admin**.
> *Note: Only emails ending with `@sweetshop.com` and verifying the key `024` are granted the administrator role.*

---

## ⚙️ Setup & Run Instructions

### Prerequisites
Make sure you have **Node.js (v20+)** and **npm** installed.

---

### 1. Backend Server Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the `.env` file inside the `backend/` directory:
   ```env
   PORT=5050
   MONGO_URI=mongodb+srv://kunal:xE0YlEjhaq2Tav0h@backendtest.gj3fp3j.mongodb.net/sweet
   JWT_SECRET=1b2b69d594d380b3b4a196845b5768dbfd7eca7b955fb316824454e939007af6
   ```
4. **Seed the database** (creates initial sweets inventory and default accounts):
   ```bash
   npm run seed
   ```
   *Seeded credentials:*
   - **Admin Account**: `admin@sweetshop.com` / `admin123`
   - **Customer Account**: `customer@sweetshop.com` / `customer123`
5. Start the development server (with nodemon auto-restart):
   ```bash
   npm run dev
   ```
   The backend API will run on `http://localhost:5050/api`.

---

### 2. Frontend Application Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the development address in your browser:
   ```
   http://localhost:5173
   ```
5. To test a production build:
   ```bash
   npm run build
   ```
---

# Application Login page
![Login Page](frontend/screenshot/loginpage.png)

# Main Page
![Responsive View](frontend/screenshot/mainpage.png)

# Admin View
![Admin View](frontend/screenshot/admin.png)

---