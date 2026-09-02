# 🌐 LAN-First Self-Hosted File Storage & Sharing (DFS)

A lightweight, high-performance personal file storage and sharing application designed to turn any laptop, desktop, or device on your local Wi-Fi / LAN into a self-hosted file server (like a private, zero-cloud Google Drive).

---

## ✨ Features

- **⚡ Zero-Cloud Local File Storage:** Store, browse, stream, and manage files on local storage without third-party cloud dependencies.
- **📡 Automatic LAN Discovery:** Servers automatically broadcast their presence on the local network via lightweight UDP heartbeats. Other devices (laptops, phones) discover them automatically without manual IP configuration.
- **🛡️ Secure File Handling:** Streamed uploads and downloads, strict path traversal protection, safe UUID physical storage mapping with MySQL metadata tracking.
- **📱 Responsive Mobile-First Web UI:** Modern React + Tailwind interface that works seamlessly on desktop and mobile browsers.
- **🔄 Multi-Node Support:** View local storage or switch into remote storage mode on any discovered LAN node to browse and transfer files.

---

## 🏗️ Architecture

```
                    ┌────────────────────────┐
                    │   React UI (Vite)      │
                    └───────────┬────────────┘
                                │ HTTP / REST
                                ▼
                    ┌────────────────────────┐
                    │  Express API (Node.js) │
                    └───────┬────────┬───────┘
                            │        │
             Prisma Client  │        │ Stream I/O
                            ▼        ▼
                      ┌──────────┐  ┌──────────────┐
                      │  MySQL   │  │ Local Disk   │
                      │ Metadata │  │  ./storage/  │
                      └──────────┘  └──────────────┘
                            │
                     UDP Discovery Engine
                            │
                     Other LAN Nodes / Phones
```

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended, tested on v22)
- [MySQL](https://www.mysql.com/) 8.0+ or Docker

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone <your-repo-url>
cd dfs-root
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Environment Configuration
Copy the environment template:
```bash
cp .env.example .env
```
Ensure `DATABASE_URL` in `.env` points to your MySQL database:
```env
DATABASE_URL="mysql://root:password@localhost:3306/local_storage"
```

*(Optional: If you want to use Docker for MySQL)*
```bash
docker compose up -d
```

### 3. Database Migration
Run Prisma migration to generate tables:
```bash
npm run prisma:migrate
npm run prisma:generate
```

### 4. Running the Application
Start both the backend server and frontend client concurrently:
```bash
npm run dev
```

The application will bind to `0.0.0.0` and output:
- **Local:** `http://localhost:5173` (Client) / `http://localhost:3000` (API)
- **Network:** `http://<LAN-IP>:5173` (Access from phone or other laptops on same Wi-Fi)

---

## 📡 REST API Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service and database health check |
| `GET` | `/api/info` | Server name, LAN IP, disk space, file count |
| `GET` | `/api/files` | List all stored file records |
| `POST` | `/api/files` | Multipart file upload (streaming) |
| `GET` | `/api/files/:id/download` | Streamed file download |
| `DELETE` | `/api/files/:id` | Atomic file and metadata deletion |
| `GET` | `/api/devices` | Discovered LAN storage nodes |

---

## 📄 License
MIT
