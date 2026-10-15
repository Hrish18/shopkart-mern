# ShopKart - MERN E-Commerce Application

A full-stack e-commerce app built with MongoDB, Express, React and Node.js.

## Features

- Customer registration and login (JWT in HttpOnly cookie, bcrypt hashed passwords)
- Product catalogue with search, category filter and price sorting
- Product details page
- Wishlist (add, view, remove)
- Shopping cart with quantity controls and stock validation (React Context API)
- Checkout with shipping form validation
- Razorpay Test Mode payment with server-side signature verification
- Order history and order details

## Tech Stack

- Frontend: React (Vite), React Router DOM, Axios, Context API
- Backend: Node.js, Express.js
- Database: MongoDB Atlas + Mongoose
- Auth: JWT, bcryptjs, cookie-parser
- Payments: Razorpay (Test Mode)

## Setup Instructions

### Prerequisites

- Node.js v18 or higher
- A MongoDB Atlas account (or local MongoDB)
- A Razorpay account in Test Mode

### 1. Backend

Open a terminal and run:

    cd backend
    npm install

Create a file named `.env` inside the `backend` folder (see `.env.example`) and fill in your own values.

Add sample products and start the server:

    node seed.js
    node index.js

Backend runs on http://localhost:5000

### 2. Frontend

Open a second terminal and run:

    cd frontend
    npm install
    npm run dev

Frontend runs on http://localhost:5173

## API Endpoints

- POST /customers/register, POST /customers/login, GET /customers/me, POST /customers/logout, PATCH /customers/change-password
- GET /products (?search=&category=&sort=), GET /products/:id, POST /products
- GET /wishlist, POST /wishlist/:productId, DELETE /wishlist/:productId
- GET /cart, POST /cart/:productId, PATCH /cart/:productId, DELETE /cart/:productId
- POST /orders/create-payment-order, POST /orders/verify-payment, GET /orders, GET /orders/:id

## Testing Payments

Razorpay Test Mode only (no real money). Card 4111 1111 1111 1111, any future expiry, any CVV. Or UPI success@razorpay.

## Security Notes

- Passwords are stored as bcrypt hashes
- JWT is stored in an HttpOnly cookie
- Order totals are calculated on the server
- Payment signatures are verified on the server before an order is marked paid
- .env files are not included in the repository

## Author

Hrishita Tatikar