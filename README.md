# School Application Project

## Backend
URL:
https://schoolapplication-backend.onrender.com

Health check:
/health

## Test Accounts
Teacher:
email: teacher@test.com
password: 123456

Student:
email: student@test.com
password: 123456

## How login works
- Login returns userId + role
- App stores these in UserSession
- All API calls use the userId

## Important
- Do NOT change backend URL
- Do NOT hardcode IDs
