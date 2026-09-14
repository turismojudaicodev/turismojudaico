# Turismo Judaico - ERP & Booking Platform

Full-stack web application and internal ERP built for **Turismo Judaico**, a specialized travel agency. This platform handles the entire lifecycle of international tours, including content management, dynamic pricing, user reservations, and automated administrative workflows.

> **Reference File:** `turismojudaicodev-turismojudaico-8a5edab282632443.txt`

---

## 🚀 Overview

The system is built on **Next.js** with a **MySQL** database. It serves two main purposes:
1. **Client-Facing E-Commerce:** A multilingual (English/Spanish) frontend where users can read blogs, explore city tours, and submit complex booking requests.
2. **Admin Dashboard (ERP):** A comprehensive backend for administrators to manage categories, cities, tours, bookings, and newsletter subscribers.

---

## 🛠️ Tech Stack & Integrations

* **Frontend:** Next.js (React), CSS Modules
* **Backend:** Node.js (Next.js API Routes)
* **Database:** MySQL (`mysql2` connection pool)
* **Media Management:** Cloudinary API
* **Payments:** Stripe API
* **Communications & Documents:** 
  * Gmail API (OAuth2) for automated email threads and draft management.
  * Nodemailer for notifications.
  * PDFKit for dynamic voucher generation.

---

## 📈 Recent Developments & Scaling (My Contributions)

I took ownership of this existing codebase to scale its capabilities, automate manual administrative tasks, and implement complex business logic. My core contributions include:

* **Algorithmic Pricing Engine (`lib/pricing.js`):** Built a robust backend calculator that evaluates complex, non-linear variables (number of passengers, duration, destination-specific logistics like airport/port extras) across +15 global destinations in real-time.
* **Gmail API Integration (`lib/gmail.js`):** Developed a custom integration to completely automate the agency's email workflow. The system now automatically finds email threads by booking ID, creates drafts, and sends emails with generated attachments seamlessly.
* **Financial & Booking Architecture:** Integrated Stripe for secure payment processing and structured the admin API endpoints (`src/pages/api/admin/`) to handle booking approvals, rejections, and payment tracking.
* **Database Optimization:** Maintained and optimized the MySQL connection pooling to ensure the admin dashboard and public-facing site run efficiently without connection leaks.

---

## 📂 Project Structure Highlights

```text
turismojudaicodev-turismojudaico/
├── lib/
│   ├── api.js / mysql.js        # Core DB and API handlers
│   ├── pricing.js               # Complex destination pricing logic
│   ├── gmail.js                 # Automated email and thread tracking via Google APIs
│   └── cloudinary.js            # Image upload management
├── src/
│   ├── components/              # Reusable React components (Admin tables, Tour Cards, etc.)
│   ├── pages/                   
│   │   ├── admin/               # Secured ERP dashboard for managing bookings and content
│   │   └── api/                 # Backend endpoints (Auth, Bookings, Security, Admin actions)
│   └── styles/                  # CSS modules for localized component styling
└── public/locales/              # i18n JSON files for English and Spanish translations
```
---

## ⚙️ Getting Started
Clone the repository and install dependencies:

``` bash
npm install
Configure your environment variables (.env). You will need credentials for:

MySQL Database

Cloudinary API

Gmail OAuth2 (Client ID, Secret, Refresh Token)

Stripe API

Run the development server:

Bash
npm run dev
```
