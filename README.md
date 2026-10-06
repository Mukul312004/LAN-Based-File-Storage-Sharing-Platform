# LAN File Storage & Sharing

A self-hosted, LAN-first file storage and sharing platform that lets
devices on the same network discover each other and transfer files
without relying on cloud storage.

## Features

-  Automatic LAN device discovery using UDP broadcast
-  Upload, download, and delete files
-  Streaming file transfers for large files
-  MySQL metadata storage with Prisma ORM
-  Path traversal protection and filename sanitization
-  Disk usage and storage metrics
-  Responsive React interface
-  Docker support

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS  
**Backend:** Node.js, Express.js  
**Database:** MySQL, Prisma  
**Storage:** Node.js filesystem streams  
**Networking:** UDP / Node.js `dgram`  
**Testing:** Vitest, Supertest  
**DevOps:** Docker

> **A LAN-first, self-hosted file storage and sharing application.**  
> Turn any computer or device into your own lightweight, secure Google Drive running on your local network.

---

## 1. Project Overview

**LAN File Storage** is a lightweight, zero-cloud personal file storage platform. Any machine running this application acts as an independent storage server on your local Wi-Fi / Ethernet network.

Devices on the same network can automatically discover each other without typing IP addresses, browse files, stream uploads/downloads, and manage disk space securely.

```
Laptop A (Server Node)
    │
    ▼ Advertises presence via LAN UDP Broadcast
    │
Phone / Laptop B (Client / Peer Node)
    │
    ▼ Automatically discovers Laptop A
    │
    ▼ Connect & Browse
    │
    ▼ Streaming Upload / Download / Delete
```

---

## 2. Key Features

- **Zero-Cloud & LAN-First**: All data stays strictly on your local network. No external servers or internet required.
- **Automatic Device Discovery**: Pure JavaScript UDP broadcast protocol discovers other nodes on the Wi-Fi in real-time with zero native dependencies.
- **Dual-Mode Operation**: Seamlessly switch between **My Storage** (local filesystem) and **Remote Storage** (any discovered LAN peer).
- **True Streaming File Transfers**: Memory-safe streaming file uploads and downloads. Does not buffer entire large files in RAM.
- **Path Traversal Protection & Sanitization**: Filenames are sanitized and stored using unique UUID prefixes within an isolated `./storage/` boundary.
- **Disk & System Metrics**: Real-time disk capacity progress, used/free space reporting, and file counter.
- **Mobile & Desktop Responsive**: Clean, modern React dashboard optimized for smartphones, tablets, and laptops.

---

## 3. Architecture

```
                       ┌─────────────────────────────────────────┐
                       │        React Client (Vite)              │
                       │   - Responsive UI (Desktop & Mobile)    │
                       │   - "My Storage" & "Remote Storage" UI  │
                       │   - Discovered Devices Bar / Switcher   │
                       └───────────────────┬─────────────────────┘
                                           │
                           REST API Calls  │ (Local or Remote LAN)
                                           ▼
                       ┌─────────────────────────────────────────┐
                       │          Express Server (Node.js)       │
                       │          Bound to 0.0.0.0:<PORT>        │
                       │   - Health & Node Info (/api/info)      │
                       │   - Streaming File Upload (Multer/Disk) │
                       │   - Streaming File Download (Stream)    │
                       │   - Discovered Nodes API (/api/devices) │
                       └───────────┬─────────────────┬───────────┘
                                   │                 │
                      Metadata     │                 │ Physical Files
                      CRUD (Prisma)│                 │ (UUID-isolated)
                                   ▼                 ▼
                       ┌────────────────┐   ┌────────────────────┐
                       │ MySQL Database │   │ Local Filesystem   │
                       │ (Prisma ORM)   │   │ (./storage/)       │
                       └────────────────┘   └────────────────────┘
                                   ▲
                                   │
               ┌───────────────────┴───────────────────┐
               │    LAN Device Discovery Service       │
               │   - UDP Broadcast Beacon (Port 41234) │
               │   - Heartbeat & Auto-expiry (TTL)     │
               │   - Pure JS / Zero native dependency  │
               └───────────────────────────────────────┘
```

---

## 4. Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons | Responsive mobile & desktop client |
| **Backend** | Node.js (v18+), Express | REST API server bound to `0.0.0.0` |
| **Database** | MySQL 8.0, Prisma ORM | File metadata, indexes, and path tracking |
| **Storage** | Local Filesystem Streams (`fs`) | Physical file storage in `./storage/` |
| **Discovery** | Node.js UDP `dgram` Sockets (Port 41234) | Zero-dependency LAN presence beacon |
| **Testing** | Vitest, Supertest | Automated unit & integration test suite |

---

## 5. Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **MySQL Server**: Local MySQL 8.0 instance **OR** Docker with Docker Compose

---

## 6. MySQL Setup

You can use either your existing local MySQL installation or the provided Docker Compose file.

### Option A: Using Local MySQL Service (Default)
1. Open MySQL terminal or workbench:
   ```sql
   CREATE DATABASE IF NOT EXISTS local_storage;
   CREATE USER IF NOT EXISTS 'storage_user'@'localhost' IDENTIFIED BY 'storage_password';
   GRANT ALL PRIVILEGES ON local_storage.* TO 'storage_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
2. Update `.env` with your credentials if different:
   ```env
   DATABASE_URL="mysql://storage_user:storage_password@localhost:3306/local_storage"
   ```

### Option B: Using Docker Compose
Run the MySQL container in the background:
```bash
docker compose up -d
```

---

## 7. Environment Variables

Create `.env` in the root directory (or copy from `.env.example`):

```env
# Server Configuration
PORT=3000
NODE_ENV=development
SERVER_NAME="My Storage Node"

# Database Configuration (MySQL)
DATABASE_URL="mysql://storage_user:storage_password@localhost:3306/local_storage"

# Storage Configuration (Directory where files are physically stored)
STORAGE_DIR="./storage"

# LAN Discovery Configuration
DISCOVERY_ENABLED=true
DISCOVERY_PORT=41234
DISCOVERY_BROADCAST_INTERVAL=3000
PEER_TIMEOUT=10000
```

---

## 8. Installation

Install all dependencies for root, server, and client:

```bash
npm install
```

Generate Prisma client and push the schema to MySQL:

```bash
npm run prisma:generate
npm run prisma:migrate
# Or sync directly with push:
npm run prisma:push --workspace=server
```

---

## 9. Running the Application

### Start both Backend and Frontend concurrently:
```bash
npm run dev
```

### Or run components individually:
```bash
# Start Backend Server
npm run dev:server

# Start Frontend Client
npm run dev:client
```

Upon boot, the server displays:
```
====================================================
Storage Node Started: "My Storage Node"
Local Storage Dir:   C:\Users\...\storage
----------------------------------------------------
Local Access:    http://localhost:3000
LAN Network:     http://192.168.29.17:3000
====================================================
LAN Discovery service active on UDP port 41234
```

---

## 10. Finding the LAN Server

- The server automatically detects your active network adapter and binds to `0.0.0.0` (all network interfaces).
- The dashboard prints the exact LAN IP (e.g. `http://192.168.29.17:3000`) and provides a one-click copy button.
- Clients on the same network can access the Web UI directly at `http://<LAN_IP>:5173` or through the server port.

---

## 11. Device Discovery

- **Protocol**: Pure Node.js UDP Broadcast (`dgram` socket).
- **Broadcast Port**: UDP `41234`.
- **Broadcast Interval**: Every 3,000ms.
- **Heartbeat & TTL**: Devices that do not broadcast within 10,000ms are automatically removed from the active device list.
- **Payload**: Advertises node ID, device name, host IP, port, and storage stats.
- **Manual IP Fallback**: If a Wi-Fi router has **AP Isolation** enabled (blocking broadcasts), users can click **"Manual IP"** to connect directly.

---

## 12. Connecting Another Device (Real-World Workflow)

### Example: Laptop A (Server) + Phone (Client)

1. **Start Server on Laptop A**:
   ```bash
   npm run dev
   ```
   *Laptop A advertises itself as "Laptop A" (`192.168.1.10:3000`).*

2. **Open Phone Browser**:
   - Ensure the phone is connected to the same Wi-Fi.
   - Navigate to `http://192.168.1.10:5173` (or the network IP shown in console).

3. **Auto-Discovery & File Operations**:
   - The phone UI automatically detects "Laptop A" in the **Available Devices** panel.
   - Click **Connect** on Laptop A.
   - Upload photos or documents from the phone.
   - Files are streamed directly to Laptop A's `./storage/` folder and registered in MySQL.
   - Download or delete files directly from the phone.

---

## 13. Uploading, Downloading & Deleting Files

### Uploads
- Files are streamed directly to disk via Multer disk storage.
- File metadata (original name, safe stored name, MIME type, size) is recorded in MySQL.
- If database insertion fails, physical files are automatically cleaned up.

### Downloads
- Uses Node streaming (`fs.createReadStream().pipe(res)`).
- RFC 5987 compliant UTF-8 `Content-Disposition` header preserves original filenames with special characters and spaces.

### Deletions
- Atomically deletes the physical file from `./storage/` and deletes the MySQL record.
- Missing physical files are handled gracefully without crashing the server.

---

## 14. API Endpoints Reference

### System & Discovery
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check & uptime status |
| `GET` | `/api/info` | Server name, LAN IP, disk capacity, capabilities |
| `GET` | `/api/devices` | Discovered active LAN peer nodes |
| `POST` | `/api/devices/manual` | Manually register a peer by IP & port |

### File Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/files` | List all stored file metadata |
| `POST` | `/api/files` | Upload file (multipart form data with `file` field) |
| `GET` | `/api/files/:id` | Get metadata for a specific file |
| `GET` | `/api/files/:id/download` | Stream download physical file |
| `DELETE` | `/api/files/:id` | Delete file from disk and database |

---

## 15. Storage Configuration & Security

- **Safe Filename Generation**: Files are saved as `<uuid>_<sanitized_name>.<ext>` to prevent collisions and illegal characters.
- **Path Traversal Guard**: All file resolution is validated with `path.relative` to ensure paths never escape the configured `./storage/` root.
- **Size Limits**: Configurable file size limits via `MAX_FILE_SIZE` in `.env`.
- **CORS Configured**: Allows cross-origin API access across LAN devices.

---

## 16. Automated Testing

Run the automated Vitest test suite:

```bash
npm test
```

### Test Coverage Includes:
- System Health & Node Info endpoints
- Streaming Multipart File Uploads
- Streaming File Downloads with Content-Disposition
- Atomic File Deletion (Disk + MySQL verification)
- 404 / 400 Error Handlers
- Path Traversal & Filename Sanitization rejection
- LAN Discovery Broadcast, Self-filtering, and TTL Stale Peer Eviction

---

## 17. Known Limitations & Firewall Considerations

1. **Windows Firewall Prompt**:
   - When first running on Windows, Windows Defender Firewall may prompt to allow Node.js on Private networks. Click **"Allow Access"** to permit incoming LAN connections and UDP broadcasts.
2. **Wi-Fi Router AP Isolation (Guest Networks)**:
   - Some public or corporate Wi-Fi routers enable "Client/AP Isolation", preventing devices from seeing each other.
   - **Solution**: Use home Wi-Fi or mobile hotspot, or use the built-in **"Manual IP"** fallback button in the dashboard.

---

## 18. Deploying to Render

You can deploy this application directly to [Render](https://render.com) using the included `render.yaml` or as a standard Web Service.

### Step 1: Database Setup
Render does not offer a free managed MySQL service directly, but you can use any free MySQL cloud provider:
* **[Aiven for MySQL](https://aiven.io/)** (Free tier)
* **[TiDB Cloud](https://tidbcloud.com/)** (Free serverless MySQL tier)
* **[Clever Cloud](https://www.clever-cloud.com/)** (Free MySQL addon)
* **[Railway](https://railway.app/)** (MySQL template)

Copy the MySQL connection URL (e.g. `mysql://user:password@host:port/database`).

### Step 2: Deploy Web Service on Render
1. Push your repository to **GitHub / GitLab**.
2. Log into [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
3. Select your repository.
4. Set the following configuration:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = `your_mysql_connection_url`
   - `SERVER_NAME` = `My Cloud Storage`
   - `STORAGE_DIR` = `./storage`
   - `DISCOVERY_ENABLED` = `false`
6. *(Optional)* Under **Disks**, add a Persistent Disk with Mount Path `/app/storage` (1GB+) so files persist across redeploys.
7. Click **Create Web Service**.

Render will automatically build the React assets, push the Prisma schema to MySQL, and deploy your live URL (e.g. `https://lan-file-storage.onrender.com`)!

---

## 19. Future Roadmap

- [ ] **V2**: User Authentication, Device Pairing PINs & QR Code pairing.
- [ ] **V3**: Distributed Storage Pools, Multi-Node File Chunking & Replication.
- [ ] **V4**: Cross-Network Encrypted Sync, WebRTC peer-to-peer streaming, and Cloud Backups.

---

## License
MIT License. Free for personal and commercial use.
