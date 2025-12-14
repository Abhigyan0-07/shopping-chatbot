# Chatbot Application

A modern, full-stack chatbot application built with Node.js, Express, and React (Vite). This project features a responsive frontend and a robust backend API.

## Features

-   **Interactive Chat Interface**: Clean and responsive UI for chatting.
-   **Real-time Communication**: (Add details if sockets are used, otherwise 'Fast API responses').
-   **Full Stack Architecture**: Separated backend (API) and frontend (Client).
-   **Modern Tech Stack**: Uses ES6+, React hooks, and Vite for fast development.

## Tech Stack

-   **Frontend**: React, Vite, HTML5, CSS3
-   **Backend**: Node.js, Express
-   **Database**: (Mention if any, e.g., MongoDB, SQLite, or 'Memory' if stateless)

## Project Structure

```bash
chatbot/
├── backend/    # Node.js/Express Server
├── frontend/   # Vite/React Client
└── ...
```

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v14 or higher)
-   npm (or yarn/pnpm)

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository_url>
    cd chatbot
    ```

2.  **Setup Backend**
    ```bash
    cd backend
    npm install
    # Create a .env file if required (see .env.example if available)
    ```

3.  **Setup Frontend**
    ```bash
    cd ../frontend
    npm install
    ```

## Running the Application

To run the application, you need to start both the backend and frontend servers.

1.  **Start Backend**
    ```bash
    cd backend
    npm start
    # or npm run dev if nodemon is configured
    ```

2.  **Start Frontend** (in a new terminal)
    ```bash
    cd frontend
    npm run dev
    ```

3.  **Access the App**
    Open your browser and navigate to the URL shown in the frontend terminal (usually `http://localhost:5173`).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
