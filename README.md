# Text Analyzer Project

This project is a full-stack application built with **React**, **Tailwind CSS**, **Node.js**, **Express**, and **TypeScript**. It consists of a client-side frontend and a server-side backend, both containerized using Docker. The application is designed to perform text analysis, manage authentication, and maintain logs in a clean and scalable architecture.

## Project Structure

```
text-analyzer
├── frontend                          # Client-side application
│   ├── src                           # Source files for the client
│   │   ├── App.tsx                   # Root component
│   │   ├── main.tsx                  # Entry point
│   │   ├── index.css                 # Global styles
│   │   ├── vite-env.d.ts             # Vite environment types
│   │   ├── components                # Reusable UI components
│   │   ├── contexts                  # React context providers
│   │   ├── pages                     # App pages/views
│   │   └── services                  # API service calls
│   ├── index.html                    # HTML entry point
│   ├── Dockerfile                    # Dockerfile for the frontend
│   ├── vite.config.ts                # Vite configuration
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   ├── postcss.config.js             # PostCSS configuration
│   ├── tsconfig.json                 # Base TypeScript configuration
│   ├── tsconfig.app.json             # TS config for app source
│   ├── tsconfig.node.json            # TS config for node tools
│   ├── eslint.config.js              # ESLint configuration
│   ├── nginx.conf                    # NGINX configuration
│   ├── package.json                  # Frontend dependencies
│   └── package-lock.json             # Lock file
├── backend                           # Server-side application
│   ├── src                           # TypeScript source files
│   │   ├── app.ts                    # App initialization
│   │   ├── server.ts                 # Server entry point
│   │   ├── database.ts               # DB connection setup
│   │   ├── controllers               # API controller logic
│   │   ├── routes                    # Express route definitions
│   │   ├── middlewares               # Express middlewares
│   │   ├── models                    # Mongoose/ORM models
│   │   ├── passport                  # Passport strategies
│   │   ├── services                  # Business logic
│   │   ├── utils                     # Utility functions
│   │   ├── types                     # Custom TypeScript types
│   │   └── tests                     # Unit and integration tests
│   ├── dist                          # Compiled JavaScript output
│   ├── coverage                      # Jest test coverage output
│   ├── Dockerfile                    # Dockerfile for the backend
│   ├── nodemon.json                  # Nodemon configuration
│   ├── jest.config.ts                # Jest config file
│   ├── jest.setup.ts                 # Jest setup
│   ├── tsconfig.json                 # TypeScript config
│   ├── babel.config.js               # Babel config
│   ├── error.log                     # Error log output
│   ├── combined.log                  # Combined log output
│   ├── test_output.txt               # Test results
│   ├── package.json                  # Backend dependencies
│   └── package-lock.json             # Lock file
├── docker-compose.yml                # Docker Compose configuration
└── README.md                         # Project documentation
```

## Getting Started

### Prerequisites

- **Node.js**
- **MongoDB**
- **Docker** and **Docker Compose**

### Running with Docker

1. Stop and remove any existing containers:

   ```bash
   sudo docker-compose down
   ```

2. Build and start everything:

   ```bash
   sudo docker-compose up --build
   ```

3. Visit the app:
   - Frontend: [http://localhost:5000](http://localhost:5000)
   - Backend: [http://localhost:3000](http://localhost:3000)

## Features

- 🧠 Text Analysis & Results
- 🔐 Secure Authentication with Passport
- 🧪 Unit & Integration Testing via Jest
- 🧾 Logging (error + combined logs)
- 🎨 Modern UI with Tailwind + Vite

## Scripts

Run these commands inside either `frontend/` or `backend/`:

```bash
npm install        # Install dependencies
npm run dev        # Start development server
npm run build      # Build production bundle
npm test           # Run tests with Jest
```

Sure! Here's the updated version with your instructions included, using proper markup:

---

## Test

To run tests inside `backend/`:

```bash
npm test           # Run tests with Jest
```

> 💡 **Note:**  
> To run tests and generate a coverage report, ensure a **test database** is running with the following environment variables set (typically in a `.env.test` or test-specific `.env` file):

```
DB_NAME=text_analyzer_test
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=text_analyzer_test
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
NODE_ENV=test
PORT=3000
GOOGLE_CLIENT_ID=google_client_id
GOOGLE_CLIENT_SECRET=google_client_secret
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5000
```

Once tests are executed using `npm test`, a **coverage report** will be generated in the `coverage/` folder.

To view the report:

1. Navigate to the `coverage/` directory.
2. Open the `index.html` file in your browser:

```bash
open coverage/lcov-report/index.html   # macOS
xdg-open coverage/lcov-report/index.html   # Linux
start coverage/lcov-report/index.html   # Windows
```

This will show a detailed test coverage summary with file-by-file breakdowns.
