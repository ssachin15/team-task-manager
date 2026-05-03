# 🚀 Team Task Manager

A full-stack task management web application with Role-Based Access Control (RBAC) that helps teams collaborate, assign tasks, and track progress efficiently.

---

## 📌 Overview

Team Task Manager is designed to streamline team workflows by providing a centralized platform where users can create, assign, and manage tasks in real time. It features a comprehensive RBAC system with Admin and Member roles, project ownership management, and detailed task tracking including creator visibility.

---

## ✨ Features

### Core Features
* 🔐 User Authentication (Login / Register)
* 📋 Create, Update, Delete Tasks
* 👥 Assign tasks to team members
* 📊 Track task status (Pending / In Progress / Completed)
* 🗂️ Organized dashboard for task overview
* ⚡ Responsive UI for smooth experience

### RBAC (Role-Based Access Control)
* 👑 **Admin Role**: Full system access, can view all projects/tasks and see creators
* 👤 **Member Role**: Limited access to owned/assigned projects and tasks
* 🏗️ **Project Ownership**: Automatic owner assignment on project creation
* 🔍 **Creator Visibility**: Admins can see who created which task and project
* 🛡️ **Protected Routes**: Frontend and backend middleware enforcing access control

---

## 🛠️ Tech Stack

### Frontend
* React.js
* Tailwind CSS
* Axios
* React Router DOM

### Backend
* Node.js
* Express.js
* JSON Web Token (JWT)
* bcryptjs

### Database
* MongoDB with Mongoose

### Tools & Others
* Git & GitHub
* Postman (API testing)

---

## 👥 User Roles & Permissions

### Admin
* View **all** projects and tasks across the system
* See **who created** each project and task
* Create, update, delete **any** project
* Add/remove members from **any** project
* Full edit access on **all** tasks
* Delete **any** task

### Member
* View only **owned/assigned** projects
* Create projects (automatically becomes owner)
* Edit/delete **own** projects only
* Add members only to **owned** projects
* Create tasks in **assigned** projects
* Edit **own** tasks (or status if assigned)
* Delete **own** tasks only

### Project Owner (Resource-Level)
* Automatically assigned when creating a project
* Can edit/delete their own projects
* Can manage members in owned projects
* Can create and modify tasks within owned projects

---

## 📂 Project Structure

```
team-task-manager/
│
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── utils/           # Utilities (rbac.js)
│   │   ├── hooks/           # Custom hooks (useRBAC)
│   │   ├── context/         # Auth context
│   │   └── services/        # API services
│   └── public/
│
├── backend/                  # Node.js backend
│   ├── models/              # Mongoose models (User, Project, Task)
│   ├── routes/              # API routes
│   ├── controllers/         # Business logic
│   ├── middleware/          # Auth & RBAC middleware
│   ├── config/              # Configuration files
│   └── server.js
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/ssachin15/team-task-manager.git
cd team-task-manager
```

---

### 2️⃣ Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Run backend server:

```bash
npm run dev
```

---

### 3️⃣ Setup Frontend

```bash
cd frontend
npm install
npm start
```

---

## 🔗 API Endpoints

### Authentication
| Method | Endpoint           | Description       | Access    |
| ------ | ------------------ | ----------------- | --------- |
| POST   | /api/auth/register | Register new user | Public    |
| POST   | /api/auth/login    | Login user        | Public    |
| GET    | /api/auth/me       | Get current user  | Protected |

### Projects
| Method | Endpoint           | Description           | Access              |
| ------ | ------------------ | --------------------- | ------------------- |
| GET    | /api/projects      | Get all projects      | Admin: All, Member: Owned/Assigned |
| POST   | /api/projects      | Create new project    | Protected           |
| GET    | /api/projects/:id  | Get project details   | Owner/Member/Admin  |
| PUT    | /api/projects/:id  | Update project        | Owner/Admin         |
| DELETE | /api/projects/:id  | Delete project        | Owner/Admin         |
| POST   | /api/projects/:id/members | Add member     | Owner/Admin         |

### Tasks
| Method | Endpoint       | Description        | Access                              |
| ------ | -------------- | ------------------ | ----------------------------------- |
| GET    | /api/tasks     | Get tasks          | Admin: All, Member: Assigned/Owned  |
| POST   | /api/tasks     | Create task        | Protected (in assigned projects)     |
| GET    | /api/tasks/:id | Get task details   | Creator/Assigned/Owner/Admin        |
| PUT    | /api/tasks/:id | Update task        | Creator/Admin (Assigned: status only)|
| DELETE | /api/tasks/:id | Delete task        | Creator/Owner/Admin                 |

---

## 🔒 RBAC Implementation Details

### Backend Middleware (`backend/middleware/auth.js`)
* `protect` - JWT verification, attaches user to request
* `authorize(...roles)` - Role-based route guard
* `checkProjectOwnership` - Verifies user has project access
* `checkProjectModifyAccess` - Verifies owner or admin for edits
* `checkTaskAccess` - Complex task authorization based on HTTP method

### Frontend Utilities (`frontend/src/utils/rbac.js`)
* `hasRole(userRole, requiredRole)` - Role hierarchy check
* `isAdmin(userRole)` - Admin check
* `canModifyTask(userRole, taskCreatorId, currentUserId)` - Task modification check
* `canManageProject(userRole)` - Project management check

### Database Models
* **User**: `{ role: 'Admin' | 'Member' }`
* **Project**: `{ owner: ObjectId, members: [ObjectId] }`
* **Task**: `{ createdBy: ObjectId, assignedTo: ObjectId, project: ObjectId }`

---

## 🧠 Key Learnings

* Built REST APIs using Express.js
* Implemented authentication using JWT
* Designed and implemented Role-Based Access Control (RBAC)
* Managed state in React with Context API
* Connected frontend with backend APIs
* Structured scalable project architecture
* Implemented middleware-based authorization
* Created reusable RBAC hooks and utilities

---

## 🚧 Future Improvements

* 🔔 Real-time notifications (Socket.io)
* 📅 Task deadline reminders
* 📊 Advanced analytics dashboard for admins
* 📱 Mobile app version (React Native)
* 🌐 Deployment (Vercel + Render)
* 📄 File attachments for tasks
* 💬 Comments on tasks

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
