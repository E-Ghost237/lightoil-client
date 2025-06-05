# 🚀 Lightoil_frontend Docker Deployment

This repository contains a Dockerized setup for deploying a lighoil-api application on an Ubuntu server using **Docker** and **Docker Compose**.

---

## 📦 Prerequisites

Make sure your server has the following installed **before proceeding**:

- ✅ Docker (v20+ recommended):  Check with ```docker --version```
- ✅ Docker Compose (v2+):  Check with ```docker compose version```
- ✅ Nginx Proxy and Let's Encrypt Companion:  Check running containers with ```docker ps```

If Docker, Nginx Proxy, or Let's Encrypt Companion are not installed, you can quickly set them up by cloning and running our setup script:

```git clone https://github.com/merveille-nitcheu/scripts.git```

## Usage

### 📁 Clone the Lightoil-frontend Project

```git clone https://gitlab.com/light-technical/soft/lightoil-version-2/service-station-client.git```

### Navigate to the Lightoil-api folder

```cd service-station-client```

### 🐳 Run the Application

```docker compose up -d --build```

### Access

Access to lightoil_frontend via: [https://lightoil.cm]
