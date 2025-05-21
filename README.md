https://github.com/user-attachments/assets/630fc23e-a807-475e-a4fa-f4d249d57833



## Project Structure

```
root/
├── backend/
└── frontend/
    └── Task-Manager/
```

---

## Getting Started

### Backend Setup (Express.js)

1. Navigate to the `backend` directory:

    ```bash
    cd backend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up MongoDB:
   - Create a free cluster
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
     
     ```bash
   MONGODB_URI = `Replace `<username>` and `<password>` with your actual database user password`
   JWT_SECRET = `any secret key - must be secured`
   ADMIN_INVITE_TOKEN= `any secret number`
   PORT = `8000`
   CLIENT_URL=http://localhost:5173
   JITSI_DOMAIN=your.domain.com
   JITSI_APP_ID=task-manager-app
   JITSI_SECRET=your-jitsi-secret-key
     ```

6. Generate JWT Secret:

    ```bash
    node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
    ```

7. Add the generated secret to `.env`:

    ```
    JWT_SECRET=your_generated_jwt_secret
    ```
    ```
    JITSI_SECRET=your_generated_jwt_secret
    ```

8. Start backend server:

    ```bash
    npm run dev
    ```

---

### Frontend Setup (React.js)

1. Configure the environment variables file `.env` in the frontend folder. The `.env` file contains the following environment variables:

   - VITE_BACKEND_URL=http://localhost:8000

2. Navigate to the frontend directory:

    ```bash
    cd frontend/Task-Manager
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

4. Start React development server:

    ```bash
    npm run dev
    ```

This will open the app in your default browser.

Access the app at: http://localhost:5173.

---

## You're All Set!

If you've followed the steps above, the Task Manager App should now be up and running. Enjoy managing your tasks efficiently! 🚀

&nbsp;

## For Support, Contact: https://avijitkumaryadav.netlify.app/

<img width="100%" src="https://camo.githubusercontent.com/525201e24fcf0d7d87f167b8f972bf33242f0588d8bb426b7df5e2911bcc609a/68747470733a2f2f7777772e616e696d61746564696d616765732e6f72672f646174612f6d656469612f3536322f616e696d617465642d6c696e652d696d6167652d303138342e676966"/>
