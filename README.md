# 🚀 Team Task Manager

A full-stack task management web application that helps teams collaborate, assign tasks, and track progress efficiently.

---

## 📌 Overview

Team Task Manager is designed to streamline team workflows by providing a centralized platform where users can create, assign, and manage tasks in real time. It supports authentication, task tracking, and collaborative features to improve productivity.

---

## ✨ Features

* 🔐 User Authentication (Login / Register)
* 📋 Create, Update, Delete Tasks
* 👥 Assign tasks to team members
* 📊 Track task status (Pending / In Progress / Completed)
* 🗂️ Organized dashboard for task overview
* ⚡ Responsive UI for smooth experience

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS / CSS
* Axios

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Tools & Others

* Git & GitHub
* Postman (API testing)

---

## 📂 Project Structure

```
team-task-manager/
│
├── frontend/          # React frontend
│   ├── src/
│   └── public/
│
├── backend/           # Node.js backend
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── config/
│   └── server.js
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```
git clone https://github.com/ssachin15/team-task-manager.git
cd team-task-manager
```

---

### 2️⃣ Setup Backend

```
cd backend
npm install
```

Create a `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

Run backend:

```
npm run dev
```

---

### 3️⃣ Setup Frontend

```
cd frontend
npm install
npm start
```

---

## 🔗 API Endpoints (Sample)

| Method | Endpoint           | Description   |
| ------ | ------------------ | ------------- |
| POST   | /api/auth/register | Register user |
| POST   | /api/auth/login    | Login user    |
| GET    | /api/tasks         | Get all tasks |
| POST   | /api/tasks         | Create task   |
| PUT    | /api/tasks/:id     | Update task   |
| DELETE | /api/tasks/:id     | Delete task   |

---

## 🧠 Key Learnings

* Built REST APIs using Express.js
* Implemented authentication using JWT
* Managed state in React
* Connected frontend with backend APIs
* Structured scalable project architecture

---

## 🚧 Future Improvements

* 🔔 Real-time notifications
* 📅 Deadline reminders
* 📱 Mobile app version
* 🌐 Deployment (Vercel + Render)

---

## 🌍 Deployment

*(Add links after deployment)*

* Frontend: Coming soon
* Backend: Coming soon

---

## 👨‍💻 Author

Sachin Singh

---

## 📜 License

This project is licensed under the MIT License.

---
