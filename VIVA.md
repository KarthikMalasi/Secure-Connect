# Viva Questions & Answers – Lab 4: Secure Connect

### 1. What is Node.js?
Node.js is an open-source, cross-platform JavaScript runtime environment built on Chrome's V8 engine. It allows developers to run JavaScript on the server side outside of a web browser, using an event-driven, non-blocking I/O model.

### 2. What is Express.js?
Express.js is a minimal and flexible web application framework for Node.js. It simplifies building REST APIs and web servers by providing clean abstractions for routing, middleware, HTTP request/response handling, and static file serving.

### 3. What is JWT?
JWT (JSON Web Token) is a compact, URL-safe token format used for securely transmitting information between parties as a JSON object. It consists of three parts: **Header**, **Payload** (claims like user ID and role), and **Signature** (verified using a secret key). It enables stateless authentication.

### 4. What is bcrypt and why is password hashing needed?
`bcrypt` is a password-hashing library that uses salt rounds (e.g., 10 rounds) to convert plain-text passwords into irreversible hashes. Hashing is needed so that even if a database is leaked or compromised, attackers cannot read users' actual passwords. Adding a salt also prevents rainbow table attacks.

### 5. Authentication vs Authorization
- **Authentication** verifies *who* the user is (e.g., logging in with email and password, or verifying a JWT). Returns `401 Unauthorized` on failure.
- **Authorization** verifies *what* the authenticated user is allowed to do (e.g., checking if `role === 'admin'` or if the user owns a note). Returns `403 Forbidden` on failure.

### 6. What is middleware?
Middleware in Express is a function that executes during the request-response cycle before the final route handler. It has access to `req`, `res`, and `next()`. In this project, `authenticateToken` and `authorizeRoles` are middleware functions that validate tokens and check user roles.

### 7. What is RBAC?
RBAC (Role-Based Access Control) is an access control mechanism that restricts system resources based on a user's assigned role (e.g., `user` vs `admin`). Only users with the required role can access specific endpoints like `/api/admin/dashboard`.

### 8. What is CRUD?
CRUD stands for the four basic database operations:
- **C**reate (`POST /api/notes`)
- **R**ead (`GET /api/notes`, `GET /api/notes/:id`)
- **U**pdate (`PUT /api/notes/:id`)
- **D**elete (`DELETE /api/notes/:id`)

### 9. What is Socket.IO?
Socket.IO is a JavaScript library that enables real-time, bidirectional, event-based communication between web clients and servers. It uses WebSockets when available and falls back to HTTP long-polling if needed, while adding features like rooms and connection middleware.

### 10. WebSocket vs HTTP
- **HTTP** is stateless and unidirectional (client sends a request, server sends a response, and the connection closes).
- **WebSocket** provides a persistent, full-duplex (two-way) TCP connection where both the client and server can push data to each other at any time without re-establishing a connection.

### 11. What is EventEmitter?
`EventEmitter` is a built-in Node.js class (from the `events` module) that implements the observer pattern. It allows objects to emit named events (`eventEmitter.emit(...)`) and register listener functions (`eventEmitter.on(...)`) that run when those events occur, keeping side effects like logging decoupled from controllers.

### 12. What is dotenv?
`dotenv` is a Node.js package that loads environment variables from a `.env` file into `process.env`. This keeps sensitive configuration values—such as database URIs, port numbers, and JWT secrets—out of source code.

### 13. Why should JWT secrets be kept private?
The `JWT_SECRET` is used to sign and verify tokens. If an attacker obtains the secret, they can forge valid JWTs for any user or role (including `admin`), completely bypassing authentication and authorization.

### 14. Why should users only access their own notes?
Enforcing ownership checks (`note.userId.toString() === req.user.id`) prevents **Broken Object Level Authorization (BOLA / IDOR)** vulnerabilities. Without this check, any authenticated user who guesses or obtains another user's note ID could read, modify, or delete private notes belonging to someone else.
