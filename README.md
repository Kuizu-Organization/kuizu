# Kuizu

Kuizu is an online study platform to help students and teachers revise their
lesson more efficiently.

## Prerequisites

For running Kuizu locally, you will need:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
  (or any other Docker environment that supports Docker Compose)

For local development, you will also need:

- Node.js
- Java JDK 17 or higher

## Secrets

Functionalities like sending OTP via email (for `forget password`)
and authentication with Google requires secrets that should not be put
in public repository like Github. Those can be obtained in the `env`
folder in the Google Drive of the project.

The backend `.env` should be put in the root of the `backend` folder
and named `.env`. The `.env` file for frontend should also be placed
in the root of the `frontend` folder, but should be named `.env.production`
so that is it copied by Docker to the image.

## Getting Started

To run Kuizu locally using Docker, run this in your terminal:

```bash
git clone https://github.com/Kuizu-Organization/kuizu.git
cd kuizu
docker compose up
```

## Contribution

For guidelines on contribution, please see [Contributing guideline](CONTRIBUTING.md).
