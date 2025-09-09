Rediscuss Platform
Rediscuss is a modern, feature-rich, Reddit-like social platform built with a microservices architecture. It allows users to create and join communities (called "Subredises"), share posts, comment, vote, and engage in discussions. The project is divided into a .NET-based backend with multiple microservices and a Next.js frontend.

Features
User Authentication: Secure user registration and login system with JWT-based authentication.

Subredis (Communities): Users can create their own communities (Subredises) with custom names and descriptions.

Posts & Comments: Create, view, and delete posts within Subredises. Engage in discussions through a nested comment system.

Voting System: Upvote and downvote posts and comments to highlight the best content.

Subscriptions: Users can subscribe to their favorite Subredises to personalize their content feed.

Role-Based Access Control: Differentiates between regular users and administrators, with specific permissions for each role.

Personalized Feed: The homepage feed is populated with posts from the user's subscribed Subredises.

Tech Stack
Backend
.NET 8: The core framework for building the backend microservices.

ASP.NET Core: For building robust and high-performance web APIs.

Microservices Architecture: The backend is logically separated into the following services:

Identity Service: Manages users, roles, and authentication using JWT.

Forum Service: Handles all forum-related functionalities like Subredises, posts, comments, and subscriptions.

API Gateway: A single entry point for all client requests, built with YARP (Yet Another Reverse Proxy).

Databases:

SQL Server: Used by the Identity Service for user and role management, leveraging Entity Framework Core.

MongoDB: The primary database for the Forum Service, chosen for its flexibility and scalability.

Redis: Implemented for caching, especially for the high-traffic voting system to ensure fast response times.

Messaging:

MassTransit with RabbitMQ: Facilitates asynchronous communication between microservices, ensuring loose coupling and scalability.

Frontend
Next.js: A powerful React framework for building a server-rendered, modern frontend.

React: The core library for building the user interface.

TypeScript: For adding static types to JavaScript, improving code quality and maintainability.

Tailwind CSS: A utility-first CSS framework for rapid UI development.

TanStack Query (React Query): For efficient data fetching, caching, and state management.

Axios: A promise-based HTTP client for making requests to the backend.

Lucide React: A beautiful and consistent icon library.

Architecture
The project follows a microservices architecture to ensure scalability, maintainability, and separation of concerns.

API Gateway: All incoming requests from the frontend are routed through the YARP API Gateway, which directs them to the appropriate microservice.

Identity Service: This service is the authority for user authentication. It issues JWT tokens upon successful login, which are then used to authorize requests in other services.

Forum Service: This is the core service of the application, responsible for all the business logic related to content and community management.

Asynchronous Communication: When a new user registers with the Identity Service, a UserCreated event is published to a RabbitMQ queue. The Forum Service subscribes to this queue and creates a corresponding user profile in its own database, ensuring data consistency across services.

Getting Started
Follow these instructions to get the project up and running on your local machine.

Prerequisites
.NET 8 SDK

Node.js (v18 or later recommended)

Docker

1. Set Up the Development Environment
The project includes a docker-compose.yml file to easily set up the necessary infrastructure (SQL Server, MongoDB, Redis, and RabbitMQ).

Bash

cd Rediscuss.Microservices
docker-compose up -d
2. Run the Backend Microservices
A PowerShell script is provided to start all the backend services in the correct order.

PowerShell

# Make sure you are in the root directory of the project
./startup.dev.ps1
This script will start the Identity Service, Forum Service, and the API Gateway.

3. Run the Frontend Application
Navigate to the rediscuss-ui directory to install dependencies and start the Next.js development server.

Bash

cd rediscuss-ui
npm install
npm run dev
The application will be available at http://localhost:3000.

Available Scripts
The repository includes PowerShell scripts to streamline the development workflow:

startup.dev.ps1: Starts all the backend microservices and the necessary infrastructure using Docker.

stop.ps1: Stops all running .NET processes related to the project.

test.ps1: A utility script for various testing purposes.
