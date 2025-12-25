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









## DevOps & CI/CD Setup

This project demonstrates basic DevOps practices using Docker and GitHub Actions.

### Docker
- The backend is containerized using a Dockerfile.
- This ensures the application runs consistently across environments.
- The Docker image can be built locally or in CI.

### CI/CD (GitHub Actions)
A GitHub Actions workflow automatically runs on every push or pull request.

The pipeline:
1. Checks out the repository
2. Sets up Node.js
3. Installs dependencies
4. Verifies backend syntax
5. Builds the Docker image

This ensures broken code cannot be merged and that the backend is always buildable.

### Tools Used
- Docker
- GitHub Actions
- Node.js
- Ubuntu (CI runner)
