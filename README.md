# Brightline Dental

A full-stack dental appointment booking web application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features
- 🔐 JWT-based authentication with role-based access control (patients & dentists)
- 📅 Appointment booking with real-time availability checking
- 🦷 Dentist profiles with specialization and working hours
- 🌗 Dark/light theme toggle
- 🛡️ Security hardened with Helmet, rate limiting, and input sanitization

## Tech Stack
- Frontend: React, Vite, Axios
- Backend: Node.js, Express.js, MongoDB (Mongoose), JWT
- Deployment: Vercel (frontend), Render (backend), MongoDB Atlas (database)

## Getting Started
1. Clone the repo
2. Install dependencies in both `/frontend` and `/backend`
3. Copy `.env.example` to `.env` in `/backend` and fill in your own credentials
4. Run `npm run dev` in both folders

## Live Demo
[https://brightline-dental-lac.vercel.app](https://brightline-dental-lac.vercel.app)
