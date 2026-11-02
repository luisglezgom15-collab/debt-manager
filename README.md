# Debt Manager

Debt Manager is a personal debt management application that allows users to register, track, update, and manage debts through a web interface.

The application provides a dashboard to monitor total debt, payments, outstanding balances, and payment progress. It uses PostgreSQL for persistent data storage and a REST API built with FastAPI to connect the backend with the frontend.

This project was developed as a learning-by-building initiative to strengthen software development skills, including backend development, frontend development, database management, automated testing, containerization, and version control.

## Features

- Create new debts
- View all registered debts
- Update existing debts
- Delete debts
- Calculate remaining debt automatically
- Track total debt, total payments, and outstanding balances
- Monitor payment progress through dashboard indicators
- Validate user input and API requests
- Persist debt records using PostgreSQL
- Access debt management operations through a REST API
- Automated backend testing with pytest
- Containerized application using Docker and Docker Compose

## Tech Stack

### Backend

- **Python** — backend application logic
- **FastAPI** — REST API development
- **Pydantic** — data validation and serialization
- **PostgreSQL** — relational database and persistent data storage
- **Psycopg** — PostgreSQL database connectivity
- **python-dotenv** — environment variable management

### Frontend

- **Next.js** — React framework for the web application
- **React** — user interface development
- **TypeScript** — static typing for JavaScript
- **Tailwind CSS** — interface styling

### Testing

- **pytest** — backend automated testing
- **pytest-cov** — test coverage measurement
- **ESLint** — frontend code analysis

### DevOps and Development Tools

- **Docker** — application containerization
- **Docker Compose** — multi-container application orchestration
- **Git & GitHub** — version control and project management

## Project Structure

```text
debt-manager/
├── app/
│   ├── __init__.py
│   ├── api.py
│   ├── database.py
│   ├── debts.py
│   ├── inputs.py
│   └── main.py
│
├── tests/
│   ├── test_api.py
│   ├── test_database.py
│   ├── test_debts.py
│   └── test_main.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   └── app/
│   ├── .dockerignore
│   ├── .env.example
│   ├── Dockerfile
│   ├── eslint.config.mjs
│   ├── next.config.ts
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
│
├── .dockerignore
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── init.sql
├── pytest.ini
├── requirements.txt
├── requirements-dev.txt
└── README.md
```

The project is organized into three main areas:

- `app/` contains the Python backend, including the REST API, database operations, and debt management logic.
- `frontend/` contains the Next.js application, including the user interface, page layout, styles, and static assets.
- `tests/` contains the automated backend test suite, covering API endpoints, database operations, business logic, and CLI functionality.

The root directory also contains the Docker configuration files used to build and run the application in containers.

## Requirements

### Local Development

- Python 3.14+
- PostgreSQL
- Node.js and npm
- Git

### Docker Deployment

- Docker Desktop or Docker Engine
- Docker Compose

## Installation

Clone the repository and navigate to the project directory:

```bash
git clone https://github.com/luisglezgom15-collab/debt-manager.git
cd debt-manager
```

### Backend Setup

Create and activate a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the backend dependencies:

```bash
pip install -r requirements-dev.txt
```

### Frontend Setup

Navigate to the frontend directory and install the dependencies:

```bash
cd frontend
npm ci
```

Return to the project root:

```bash
cd ..
```

## Environment Variables

### Backend Configuration

Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

Configure the following environment variables:

```env
DB_HOST=127.0.0.1
DB_USER=debt_app
DB_PASSWORD=your_password
DB_NAME=debt_manager
FRONTEND_URL=http://localhost:3000
```

### Frontend Configuration

Create a `.env.local` file inside the `frontend/` directory based on `frontend/.env.example`:

```bash
cp frontend/.env.example frontend/.env.local
```

Configure the API URL:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Do not commit `.env` or `.env.local` files to the repository.

## Running the Application

### Start the Backend

From the project root, activate the virtual environment and start the FastAPI server:

```bash
source .venv/bin/activate
uvicorn app.api:app --reload
```

The backend API will be available at:

`http://127.0.0.1:8000`

Interactive API documentation is available at:

`http://127.0.0.1:8000/docs`

### Start the Frontend

Open a separate terminal, navigate to the frontend directory, and start the development server:

```bash
cd frontend
npm run dev
```

The web application will be available at:

`http://localhost:3000`

### Run the Command-Line Interface (CLI)

Alternatively, you can run the command-line version from the project root:

```bash
python -m app.main
```

The CLI provides the following options:

1. View debts
2. Add a debt
3. Delete a debt
4. Update a debt
5. Exit

## Running with Docker

The application can also be executed using Docker Compose. This configuration starts three services:

- **Frontend:** Next.js application.
- **Backend:** FastAPI REST API.
- **Database:** PostgreSQL 18.

### Configure Environment Variables

Make sure the root `.env` file exists and contains a non-empty `DB_PASSWORD` value.

This password is used by the PostgreSQL Docker container and the backend to establish a database connection.

Do not share or commit your `.env` file.

### Build and Start the Containers

From the project root, execute:

```bash
docker compose up --build -d
```

This command builds the application images and starts all services in the background.

### Verify the Containers

Check the status of the services:

```bash
docker compose ps
```

PostgreSQL should report a healthy status, while the frontend and backend should be running.

### Access the Application

The application will be available at:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API documentation: `http://localhost:8000/docs`

### View Application Logs

To inspect the logs of all services:

```bash
docker compose logs
```

To display only the latest 50 lines:

```bash
docker compose logs --tail=50
```

### Stop the Containers

To stop and remove the containers and the Docker network:

```bash
docker compose down
```

The PostgreSQL data volume is preserved when using this command.

To start the application again without rebuilding the images:

```bash
docker compose up -d
```

### Database Persistence

Docker Compose uses a named volume called `postgres_data` to persist PostgreSQL data.

The database is initialized using `init.sql` when the PostgreSQL volume is created for the first time.

The Docker database is independent of any PostgreSQL database running directly on the host machine. Existing local database records are not automatically migrated into the Docker database.

**Important:** Avoid using `docker compose down -v` unless you intentionally want to delete the PostgreSQL volume and its stored data.

## Running Tests

### Backend Tests

Run the complete backend test suite from the project root:

```bash
python -m pytest -v
```

To run the tests with code coverage:

```bash
python -m pytest --cov=app --cov-report=term-missing
```

The backend test suite currently contains **55 tests**.

### Frontend Checks

Navigate to the frontend directory:

```bash
cd frontend
```

Run ESLint to check code quality:

```bash
npm run lint
```

Run TypeScript type checking:

```bash
npx tsc --noEmit
```

Build the application to verify that it compiles successfully:

```bash
npm run build
```

## Project Status

Debt Manager currently provides a functional web application for managing personal debts, supported by a REST API and persistent PostgreSQL storage.

The project includes:

- Full CRUD operations for debt management
- Interactive web dashboard
- Debt and payment tracking
- Input validation and API request validation
- REST API built with FastAPI
- PostgreSQL database integration
- Persistent data storage
- Command-line interface (CLI)
- Automated backend test suite with 55 passing tests
- Frontend code quality and build checks
- Environment-based configuration
- Dockerfiles for the backend and frontend
- Docker Compose orchestration
- Persistent PostgreSQL storage using Docker volumes

The application has been tested locally and with Docker, including debt creation, editing, deletion, dashboard updates, communication between services, and data persistence after container restarts.

The next development stage focuses on deploying Debt Manager 1.0 and preparing the project for future improvements.

## Future Improvements

Planned improvements for future versions include:

- Add user registration and authentication
- Implement secure user-specific debt management
- Add detailed debt payment history
- Allow users to track individual payments over time
- Improve dashboard analytics and financial insights
- Enhance the user interface and overall user experience