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

```bash
docker-compose up --build        # build และ run
docker-compose up -d --build     # run แบบ background
docker-compose down              # หยุด
```

เปิดที่ `http://localhost:10000`

### Run with Environment

ระบุ env file เพื่อเลือก API target ตอน build:

```bash
# ชี้ไป api-dev.smartseaman.com
docker-compose --env-file .env.development up --build

# ชี้ไป api.smartseaman.com
docker-compose --env-file .env.production up --build
```

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