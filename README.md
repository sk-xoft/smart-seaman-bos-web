# Smart Seaman BOS Web

Vue 3 back-office admin web app for the Smart Seaman platform.

## Development

```bash
npm install       # install dependencies
npm run dev       # dev server at http://localhost:8080
npm run lint      # ESLint with auto-fix
```

## Docker

### Build & Run (docker-compose) — แนะนำ

ระบุ env file เพื่อเลือก API target ตอน build:

```bash
# ชี้ไป api-dev.smartseaman.com
docker-compose --env-file .env.development up -d --build

# ชี้ไป api.smartseaman.com
docker-compose --env-file .env.production up -d --build

# หยุด
docker-compose down
```

> หมายเหตุ: server ใช้ docker-compose V1 (`docker-compose version 1.25.0`) — ต้องกำหนด `VITE_API_URL` ใน env file ให้ครบ เนื่องจาก V1 ไม่รองรับ nested variable interpolation (`${VAR:-${OTHER}}`)

เปิดที่ `http://localhost:10000`

### Build & Run (manual)

```bash
docker build -t smart-seaman-bos-web .
docker run -p 10000:80 smart-seaman-bos-web
```

### Environment

| ไฟล์ | ใช้เมื่อ |
|---|---|
| `.env.development` | `npm run dev` (Vite dev server) |
| `.env.production` | `docker-compose up` / `npm run build` |

API target ถูก bake เข้าไปตอน build — ถ้าต้องการเปลี่ยน endpoint แก้ที่ `.env.production` แล้ว build ใหม่

---