# 📝 Task Manager App

## Overview

The **Task Manager App** is a full-stack web application designed to help users manage their tasks efficiently. Built using the MERN (MongoDB, Express.js, React.js, Node.js) stack, it offers a seamless experience for task creation, tracking, and management.

## Features

1. **Task Assignment and Prioritization**  
   Assign tasks to team members with clear deadlines and priority levels.

2. **Deadline Tracking and Notifications**  
   Set task deadlines and receive automated reminders to stay on schedule.

3. **Progress Reporting**  
   Generate reports on task completion and team performance with analytics for better decision-making.

4. **Role-Based Permissions**  
   Control access levels by assigning roles like Admin, Editor, or Viewer to team members.

5. **Real-Time Collaboration**  
   Add comments, share files, and discuss tasks within the platform for seamless teamwork.

6. **Secure Authentication and Authorization**  
   Ensure only verified users can access the platform using secure login (authentication).

---

## 🛠️ Tech Stack & Versions

- **Backend**: Node.js, Express.js  
- **Frontend**: React.js  
- **Database**: MongoDB Atlas  
- **Node Version**: `v23.10.0`  
- **NPM Version**: `v11.2.0`

---

## 📁 Project Structure

```
root/
├── backend/
└── frontend/
    └── Task-Manager/
```

---

## 🚀 Getting Started

### 🔧 Backend Setup (Express.js)

1. Navigate to the `backend` directory:

    ```bash
    cd backend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up MongoDB:
   - Visit [MongoDB Atlas](https://www.mongodb.com/)
   - Log in or create an account
   - Create a **New Project**
   - Click **Next** after naming the project
   - Add members if required and click **Create Project**
   - In the side menu, click **Clusters** → **Build a Cluster**
   - Choose **Free Tier**, provide a cluster name
   - Select a server provider & region → **Create Deployment**

4. Configure Access & Connection:
   - Add your IP address or choose **Allow Access from Anywhere**
   - Create a **Database User**
   - Click **Choose a connection method**
   - Choose **Drivers** → **Node.js**
   - Copy the connection string

5. First, create the environment variables file `.env` in the server folder. The `.env` file contains the following environment variables:

   - MONGODB_URI = `Replace `<password>` with your actual database user password`
        ```
        Update `.env` file: MONGO_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
        ```
   - JWT_SECRET = `any secret key - must be secured`
   - ADMIN_INVITE_TOKEN= `any secret number`
   - PORT = `8000`

6. Generate JWT Secret:

    ```bash
    node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
    ```

7. Add the generated secret to `.env`:

    ```
    JWT_SECRET=your_generated_jwt_secret
    ```

8. Start backend server:

    ```bash
    npm run dev
    ```

---

### 💻 Frontend Setup (React.js)

1. Navigate to the frontend directory:

    ```bash
    cd frontend/Task-Manager
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start React development server:

    ```bash
    npm run dev
    ```

This will open the app in your default browser.

---

## 🎉 You're All Set!

If you've followed the steps above, the Task Manager App should now be up and running. Enjoy managing your tasks efficiently! 🚀

&nbsp;

## For Support, Contact:

- Email: kumaravijit010@gmail.com

<img width="100%" src="https://camo.githubusercontent.com/525201e24fcf0d7d87f167b8f972bf33242f0588d8bb426b7df5e2911bcc609a/68747470733a2f2f7777772e616e696d61746564696d616765732e6f72672f646174612f6d656469612f3536322f616e696d617465642d6c696e652d696d6167652d303138342e676966"/>