# Project Setup
npm install

- create a .env file and write some variables in there, you can change the value based on your psql configuration:
  PORT=3000
  SESSION_SECRET=secret
  
  DB_USER=postgres
  DB_HOST=localhost
  DB_PORT=5432
  DB_DATABASE=login_psql
  DB_PASSWORD=insert_your_psql_password_here

- open postgreSQL, create a database "login_psql" with a table named "users".
  create several columns:
  - id (Data type: SERIAL, FOREIGN KEY)
  - name (Data type: VARCHAR(255))
  - email (Data type: VARCHAR(255))
  - password (Data type: VARCHAR(255))

# Run Project
npm run dev
