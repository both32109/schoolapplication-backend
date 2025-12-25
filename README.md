# School Application Project

## Backend  DO NOT CHANGE ANYTHING IN BACKEND OR OTHER FILES IN APP WITHOUT DISCUSSING IN GROUP FIRST(IMPORTANT); MOSTLY JUST TESTING(RUNNING APP) FOR NOW IS OK;  I'LL DIVIDE WORK LATER
URL:
https://schoolapplication-backend.onrender.com   

Health check:
/health

## Test Accounts(5 each)
Teacher:
email:
lim@school.com
cruz@school.com
tan@school.com
reyes@school.com
ortega@school.com
password: password123

Student:
email: 
john.doe@example.com
jane.smith@example.com
mary.w@example.com
mary.w@example.com
mary.w@example.com
password: password123


!!!!!!!!!!MUST READ!!!!!!!!!!
if you change password or email, make sure to change to the original after finishing testing. 

## How login works
- Login returns userId + role
- App stores these in UserSession
- All API calls use the userId

## Important
- Do NOT change backend URL
- Do NOT hardcode IDs














//DevOps

# 🛠 DevOps Integration (Teammate C)

This folder contains the Infrastructure and Automation requirements for the project. 

### 🚀 Instructions for Team Leader
To integrate these DevOps features into the main repository:
1. **Docker:** Move the `Dockerfile` into the `schoolapplication-backend/` folder.
2. **CI/CD:** Move the `.github` folder into the root of the project.
3. **Teacher Grading:** This setup proves the **Containerization** and **CI/CD** requirements are met.

### 📋 What this provides:
* **Automation:** Every time code is pushed to GitHub, it is automatically checked for syntax errors and Docker build compatibility.
* **Consistency:** The `Dockerfile` ensures the backend runs identically on Render, Docker, or any local machine.
* **Safety:** The `node --check` step ensures no broken `server.js` code is deployed.

### 🔧 Tech Stack
* **Docker:** Containerization of Node.js
* **GitHub Actions:** CI/CD Pipeline
* **Linux Environment:** Ubuntu-latest for builds
