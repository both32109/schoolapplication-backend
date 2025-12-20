# School Application Project

## Backend
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

## How login works
- Login returns userId + role
- App stores these in UserSession
- All API calls use the userId

## Important
- Do NOT change backend URL
- Do NOT hardcode IDs
