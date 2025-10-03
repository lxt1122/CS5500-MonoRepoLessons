# Client-Server Architecture Analysis Assignment

## Part 1: Understanding the Project Structure

### 1. Explore the Repository

The code for this assignment is in **lesson-04** in the mono repo.

You already have access to the repository containing the NodeJS backend and React-Typescript frontend. Get familiar with the folder structure, key files, and the build system.

### 2. Explore Design Patterns

Identify and document at least three design patterns used in the client-server architecture. Examples of common patterns might include the following. Note that not all of these are necessarily in here, and there may be some that are in the code but not mentioned here:

- **Singleton** for managing single instances of services
- **Observer or Publisher-Subscriber** for handling real-time communication between the client and server
- **Model-View-Controller (MVC)** for separating concerns in the backend

Provide examples of where and how these patterns are implemented in the code.

## Part 2: Analyzing the Backend (NodeJS)

### 1. Examine the RESTful API

Explore how the backend is structured to serve API requests. Identify key API endpoints that the client interacts with and document:

- How data is created, read, updated, and deleted (CRUD operations)
- How the server validates and processes client requests before responding

### 2. Real-Time Communication (if applicable)

If the project includes real-time communication (e.g., using WebSockets), investigate:

- How the client and server establish real-time connections
- How messages are exchanged between the client and server, and what kind of data is sent

### 3. User Management

Analyze how the backend manages user authentication and roles. Specifically:

- How is user authentication handled (e.g., via JWT, OAuth)?
- How does the backend differentiate between user types (e.g., admin, regular user) and provide different levels of access?
- What mechanisms are used to secure sensitive user data?

### 4. Middleware and Error Handling

Investigate how the backend uses middleware to handle tasks like:

- Authentication and session management
- Data validation and error handling

Document examples from the code that show how middleware simplifies request handling.

## Part 3: Analyzing the Frontend (React TypeScript)

### 1. Multi-Screen Navigation

Examine how the React app handles navigation between different screens and UI components:

- How is routing set up (e.g., using React Router)?
- How does the app handle protected routes (i.e., only allowing certain users to access specific pages)?

### 2. State Management

Investigate how the app manages state across different screens and components:

- How is user state (e.g., authentication status, role) maintained and shared between components?
- Are tools like Redux or Context API used to manage global state?

### 3. API Interaction

Analyze how the frontend communicates with the backend:

- How are API calls made (e.g., using fetch, axios) and how is the data from the backend processed and displayed in the UI?
- How is the client updated so that they can see other users updating the cells?

### 4. User Interface

Investigate how the app displays different UI components based on user roles:

- How does the frontend handle the display of real-time data if applicable (e.g., chat messages, notifications)?
- How is the cell ownership displayed to the users?

## Part 4: Frontend and Backend Interaction

### 1. API Request-Response Flow

Trace the flow of data from the moment the frontend sends a request to the server to when it receives a response:

- Identify key points in the code where data flows from the server to the client and vice versa
- How does the frontend handle errors returned by the server?

### 2. Real-Time Interaction (if applicable)

If the project includes real-time communication, investigate how the client and server communicate in real-time:

- How are updates pushed from the server to the client, and how does the UI handle them?

## Recommendation on How to Proceed

For this assignment, you will split into two subteams:

### Team Division

1. **Frontend Team**: Focus on analyzing the React TypeScript frontend. Dive into the routing system, state management, API interaction, and design patterns used in the client codebase.

2. **Backend Team**: Focus on analyzing the NodeJS backend. Explore the REST API, real-time communication (if applicable), user authentication, and middleware.

### Deliverables

Each subteam should analyze their part of the system and then present their findings to the other team. This should include:

- A description of the design patterns used in each part of the codebase
- An explanation of how their part interacts with the other team's work (e.g., how the frontend sends requests and processes responses from the backend)
- Key challenges and design choices that improve the performance and scalability of the application

### Final Collaboration

After the presentations, work together as a larger group to discuss how the frontend and backend can be further optimized for:

- **Performance**
- **Security** 
- **User Experience**