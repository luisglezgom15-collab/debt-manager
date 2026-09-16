# Debt Manager

Debt Manager is a command-line application built with Python to manage personal debts. It allows users to create, update, delete, and view debts while keeping the data persistently stored in PostgreSQL.

This project was created as a learning-by-building project to practice Python, database integration, testing, software architecture, and version control with Git and GitHub.

## Features

* Create new debts
* View all registered debts
* Update existing debts
* Delete debts
* Calculate remaining debt
* Detect fully paid debts
* Detect overpayments and calculate available credit
* Validate user input
* Persist data using PostgreSQL
* Automated testing with pytest

## Tech Stack

* **Python** — application logic and CLI
* **PostgreSQL** — persistent data storage
* **Psycopg** — PostgreSQL database connection
* **pytest** — automated testing
* **pytest-cov** — test coverage
* **python-dotenv** — environment variable management
* **Git & GitHub** — version control and project management

## Project Structure

```text
debt-manager/
├── app/
│   ├── database.py    # PostgreSQL database operations
│   ├── debts.py       # Debt-related business logic
│   ├── inputs.py      # CLI input and validation
│   └── main.py        # CLI application flow
│
├── tests/
│   ├── test_database.py
│   ├── test_debts.py
│   └── test_main.py
│
├── .env.example       # Environment variable template
├── .gitignore
├── pytest.ini
├── requirements.txt
└── README.md
```

The application is organized by responsibility:

* `main.py` handles the command-line application flow.
* `inputs.py` handles user input and validation.
* `debts.py` contains the application's business logic.
* `database.py` handles communication with PostgreSQL.
* `tests/` contains the automated test suite.

## Requirements

Before running the project, make sure you have installed:

* Python 3.14+
* PostgreSQL
* Git

## Installation

Clone the repository and navigate to the project directory:

```bash
git clone git@github.com:luisglezgom15-collab/debt-manager.git
cd debt-manager
```

Create and activate a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the project dependencies:

```bash
pip install -r requirements.txt
```

## Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```text
DB_HOST=127.0.0.1
DB_USER=debt_app
DB_PASSWORD=your_password
DB_NAME=debt_manager
```

Do not commit the `.env` file to the repository.

## Running the Application

Run the application from the project root:

```bash
python -m app.main
```

The application provides a command-line menu to:

1. View debts
2. Add a debt
3. Delete a debt
4. Update a debt
5. Exit

## Running Tests

Run the complete test suite with:

```bash
pytest
```

To run the tests with coverage:

```bash
pytest --cov=app
```

The current test suite contains **39 tests** with **98% overall code coverage**.

## Project Status

Debt Manager currently provides a functional command-line interface for managing personal debts with persistent PostgreSQL storage.

The project includes:

* CRUD operations for debts
* Input validation
* PostgreSQL integration
* Automated tests
* 98% overall code coverage
* Environment-based configuration
* Separation of application responsibilities

The next major development stage is the integration of **FastAPI** to expose the application's functionality through a REST API.

## Future Improvements

Planned improvements include:

* Build a REST API with FastAPI
* Add API testing
* Develop a web frontend with Next.js and TypeScript
* Containerize the application with Docker
* Add user authentication
* Deploy the application
