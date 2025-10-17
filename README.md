> ## 🚀 Rediscuss Platform
>
> Rediscuss is a modern, feature-rich, Reddit-like social platform built with a microservices architecture. It allows users to create and join communities (called "Discuites"), share posts, comment, vote (called "Chips"), and engage in discussions. The project is divided into a .NET-based and NestJs backend with multiple microservices and a Next.js frontend.
>
> ---
>
> ### ✨ **Features**
>
> - **User Authentication**: Secure user registration and login system with JWT-based authentication.
> - **Discuit (Communities)**: Users can create their own communities (Discuites) with custom names and descriptions.
> - **Posts & Comments**: Create, view, and delete posts within Discuites. Engage in discussions through a nested comment system.
> - **Voting System (Chips)**: Upvote and downvote posts and comments to highlight the best content.
> - **Subscriptions**: Users can subscribe to their favorite Discuites to personalize their content feed.
> - **Role-Based Access Control**: Differentiates between regular users and administrators, with specific permissions for each role.
> - **Personalized Feed**: The homepage feed is populated with posts from the user's subscribed Discuites.
>
> ---
>
> ### 🛠️ **Tech Stack**
>
> #### **Backend**
>
> - **.NET 8**: The core framework for building the backend microservices.
> - **ASP.NET Core**: For building robust and high-performance web APIs.
> - **Microservices Architecture**:
>   - **Identity Service**: Manages users, roles, and authentication using JWT.
>   - **Forum Service**: Now a **NestJS (Node.js)** microservice responsible for all forum-related functionalities like Discuites, posts, comments, and subscriptions.
>   - **API Gateway**: A single entry point for all client requests, built with **YARP (Yet Another Reverse Proxy)**.
> - **Databases**:
>   - **SQL Server**: Used by the Identity Service for user and role management, leveraging **Entity Framework Core**.
>   - **MongoDB**: The primary database for the Forum Service, chosen for its flexibility and scalability.
>   - **Redis**: Implemented for caching, especially for the high-traffic Chips (voting) system to ensure fast response times.
> - **Messaging**:
>   - **MassTransit** & **RabbitMQ**: Facilitates asynchronous communication between microservices, ensuring loose coupling and scalability.
>
> #### **Frontend**
>
> - **Next.js**: A powerful React framework for building a server-rendered, modern frontend.
> - **React**: The core library for building the user interface.
> - **TypeScript**: For adding static types to JavaScript, improving code quality and maintainability.
> - **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
> - **TanStack Query (React Query)**: For efficient data fetching, caching, and state management.
> - **Lucide React**: A beautiful and consistent icon library.
>
> ---
>
> ### 🏛️ **Architecture**
>
> The project follows a microservices architecture to ensure scalability, maintainability, and separation of concerns.
>
> - **API Gateway**: All incoming requests from the frontend are routed through the YARP API Gateway, which directs them to the appropriate microservice.
> - **Identity Service**: This service is the authority for user authentication. It issues JWT tokens upon successful login, which are then used to authorize requests in other services.
> - **Forum Service (NestJS)**: This is the core service of the application, responsible for all the business logic related to content and community management.
> - **Asynchronous Communication**: When a new user registers with the Identity Service, a `UserCreated` event is published to a RabbitMQ queue. The Forum Service subscribes to this queue and creates a corresponding user profile in its own database, ensuring data consistency across services.
>
> ---
>
> ### 🚀 **Getting Started**
>
> Follow these instructions to get the project up and running on your local machine.
>
> #### **Prerequisites**
>
> - .NET 8 SDK
> - Node.js (v18 or later recommended)
> - Docker
>
> #### **1. Set Up the Development Environment and Run the Backend Microservices**
>
> The project includes a `docker-compose.yml` file to easily set up the necessary infrastructure (SQL Server, MongoDB, Redis, and RabbitMQ) also start the all backend servcices in the correct order.
>
> ```bash
> cd Rediscuss.Microservices
> docker-compose up -d
> ```
>
> #### **2. Run the Frontend Application**
>
> Navigate to the `rediscuss-ui` directory to install dependencies and start the Next.js development server.
>
> ```bash
> cd rediscuss-ui
> npm install
> npm run dev
> ```
>
> The application will be available at [http://localhost:3000](http://localhost:3000).
>
> ---
>
> ### 📜 **Available Scripts**
>
> The repository includes PowerShell scripts to streamline the development workflow:
>
> - **`startup.local-dotnet.ps1`**: Starts all the .net backend microservices (include gateway and identity services).
>

>
> Navigate to the `rediscuss-ui` directory to install dependencies and start the Next.js development server.
>
> ```bash
> cd rediscuss-ui
> npm install
> npm run dev
> ```
>
> The application will be available at [http://localhost:3000](http://localhost:3000).
>
> ---
