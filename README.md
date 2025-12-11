# OBDM Frontend

OBDM Frontend is a Vue.js application built using Vite. It serves as the
user interface layer for interacting with the OBDM middleware services.

This project uses **Vite**, **Vue 3**, and supports **hot module
replacement (HMR)** for rapid development.

------------------------------------------------------------------------

## 🚀 Features

-   Vue 3 Composition API
-   Vite for lightning-fast development
-   Auto-reload during development
-   Docker support for containerized deployments

------------------------------------------------------------------------

## 📦 Project Structure

    obdm-frontend/
    ├─ src/
    │  ├─ assets/
    │  ├─ components/
    │  ├─ composable/
    │  ├─ layout/
    │  ├─ router/
    │  ├─ stores/
    │  ├─ views/
    │  ├─ stores/
    │  ├─ App.vue
    │  ├─ axiosInstancePython.js
    │  └─ main.js
    ├─ public/
    ├─ .env
    ├─ package.json
    ├─ vite.config.js
    ├─ postcss.config.js
    ├─ obdm.js
    ├─ server.js
    ├─ tailwind.config.js
    ├─ Dockerfile
    └─ docker-compose.yaml

------------------------------------------------------------------------

## 🛠️ Development Setup

### 1. Install Dependencies

    npm install

### 2. Run Development Server (With Auto Reload)

    npm run dev

This enables **HMR** and automatically reloads when files change.

------------------------------------------------------------------------

## 🐳 Running with Docker (Development Mode)

To enable auto-reload inside Docker, mount the project folder and run
Vite in dev mode.

### Dockerfile (Development)

    FROM node:18-alpine
    WORKDIR /app
    COPY package*.json ./
    RUN npm install
    COPY . .
    EXPOSE 5173
    CMD ["npm", "run", "dev", "--", "--host"]

### docker-compose.yaml

    services:
      obdm-frontend:
        build:
          context: .
          dockerfile: Dockerfile
        container_name: obdm-frontend
        environment:
          VITE_API_URL: "http://10.10.6.50:9891"
          VITE_API_URL2: "http://localhost:5000/api"
        volumes:
          - ./:/app
          - /app/node_modules
        ports:
          - "5173:5173"

*The mounted volume (`./:/app`) allows real-time code updates with
automatic reload.*

------------------------------------------------------------------------

## 📦 Production Build

To build optimized output:

    npm run build

The result is stored in the `dist/` directory.

------------------------------------------------------------------------

## 🐳 Docker Deployment (Production)

### Dockerfile (Production)

    FROM node:18-alpine as build
    WORKDIR /app
    COPY package*.json ./
    RUN npm install
    COPY . .
    RUN npm run build

    FROM nginx:alpine
    COPY --from=build /app/dist /usr/share/nginx/html
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]

### Run Production Image

    docker build -t obdm-frontend .
    docker run -p 80:80 obdm-frontend

------------------------------------------------------------------------

## 🔧 Troubleshooting

### Hot reload not working in Docker?

-   Ensure you mounted the project directory using volumes:

    volumes:
      - ./:/app
      - /app/node_modules

-   Run Vite with `--host`:
    npm run dev -- --host

### Permission issues?

    docker compose down -v

------------------------------------------------------------------------

## 📄 License

This project is based on **Sakai** and uses the official Vue and Vite
tooling.
