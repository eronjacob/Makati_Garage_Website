# Makati_Garage_Booking_Website

![Makati Garage Website Screenshot](./assets/images/AMIResponsive.png)

[Link to deployed website](https://eb546.github.io/Makati_Garage_Booking_Website/)

# 🚗 Makati Garage – Online Auto Service Booking System

A modern, responsive web application for an auto repair shop that allows customers to register, log in, book service appointments, and manage their booking history in real time. Built with **HTML, CSS, JavaScript**, and **Firebase**, the system delivers a smooth user experience with secure authentication, dynamic scheduling, and real-time data handling.

---

## 🌟 Project Overview

**Makati Garage** is a complete front-end booking platform designed for automotive service businesses. It enables customers to browse services, reserve available time slots, and track their service appointments, all within a visually engaging interface enhanced by animated backgrounds and smooth transitions.

This project demonstrates real-world web application features such as authentication, database integration, state-based navigation, and responsive UI design.

---

## ✨ Key Features

### 🔐 Authentication (Firebase Auth)

* User registration and login
* Secure email/password authentication
* Persistent login sessions
* Logout functionality

### 📅 Smart Booking System

* Real-time appointment booking
* Dynamic time slot generation
* Automatic prevention of double bookings
* Past-time slot disabling for same-day bookings
* Firestore-backed booking storage

### 📂 My Bookings Dashboard

* View booking history per user
* Real-time data retrieval from Firestore
* Status display for each booking

### 🧰 Services Showcase

* Grid-based service listing
* Visual icons and detailed descriptions
* Mobile-responsive layout

### 🎨 Modern UI & UX

* Full-screen background slideshow
* WebGL animated “Threads” background
* Smooth page transitions and hover effects
* Responsive design for mobile, tablet, and desktop

### 📬 Contact & Social Integration

* Contact form with confirmation feedback
* Social media and contact shortcuts
* Business location and operating hours display

---

## 🛠 Tech Stack

* **HTML5** – Semantic page structure
* **CSS3** – Responsive layouts, animations, and UI styling
* **JavaScript (Vanilla)** – Application logic and DOM handling
* **Firebase Authentication** – User management
* **Firebase Firestore** – Real-time database for bookings
* **WebGL (Custom Shader)** – Animated background effects
* **Font Awesome** – Icons
* **Live Server** – Local development server

---

## 📁 Project Structure

```
/assets
  /css
    style.css
  /js
    script.js
  /images
    /backgrounds
    /services
index.html
```

---

## ⚙️ Setup & Installation

### 1️⃣ Prerequisites

* Modern web browser
* Visual Studio Code (recommended)
* Internet connection (for Firebase & CDN assets)

### 2️⃣ Live Server Configuration

This project uses Live Server with a custom port:

```json
{
  "liveServer.settings.port": 5501
}
```

### 3️⃣ Firebase Setup

* Create a Firebase project
* Enable **Authentication (Email/Password)**
* Enable **Cloud Firestore**
* Replace the Firebase configuration in `script.js` with your own credentials

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  ...
};
```

### 4️⃣ Run the Project

* Open `index.html`
* Right-click → **Open with Live Server**
* Visit: `http://localhost:5501`

---

## 📸 Screens & Output

* Login & Registration modal
* Services overview page
* Booking form with time slot selection
* My Bookings history page
* Contact & social links
* Animated background visuals

---

## 🔒 Security Notes

* Firebase credentials are client-side by design
* Firestore rules should be configured to restrict access per user
* No sensitive logic is exposed beyond standard frontend usage

---

## 🚀 Possible Enhancements

* Admin dashboard for managing bookings
* Email notifications on booking confirmation
* Payment integration
* Booking cancellation & rescheduling
* Role-based access control (Admin / Customer)

---

## 📄 License

This project is intended for educational, portfolio, and small-business use. Feel free to modify and extend it for your own needs.

---

**Makati Garage**
*Driven by Trust. Powered by Precision.*

---
