# API Spec — Document Renewals List

## Endpoint
```
POST /v1/document-renewals/list
```

## Headers
```
Authorization: Bearer {token}
menuCode: OPER104
language: TH
deviceModel: WEB_ADMIN
deviceInfo: MacOS
correlationid: {uuid-v4}
Content-Type: application/json
```

---

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `size` | number | ✅ | จำนวนรายการต่อหน้า (default: 50) |
| `lastNum` | number | ✅ | offset = `(page-1) * size` เช่น หน้า 1 = 0, หน้า 2 = 50 |
| `status` | string | ❌ | filter ตาม status ถ้าไม่ส่ง = ดึงทั้งหมด |
| `ssid` | string | ❌ | ค้นหาตาม Smart Seaman ID |
| `name` | string | ❌ | ค้นหาตามชื่อ (LIKE) |
| `requestNo` | string | ❌ | ค้นหาตามเลขที่คำขอ |

### ตัวอย่าง Request
```json
{ "size": 50, "lastNum": 0 }
```
```json
{ "size": 50, "lastNum": 0, "status": "รอตรวจเอกสาร" }
```
```json
{ "size": 50, "lastNum": 0, "ssid": "00001", "status": "รอผลกรมเจ้าท่า" }
```

---

## Response Body

```json
{
  "code": "WA00000",
  "description": "Success",
  "data": {
    "total": 128,
    "statusCounts": {
      "all": 128,
      "รอตรวจเอกสาร": 25,
      "รอผู้ยื่นแก้ไข": 10,
      "รอผลกรมเจ้าท่า": 30,
      "รอรับเอกสารจากกรม": 20,
      "กำลังจัดส่ง": 18,
      "จัดส่งสำเร็จ": 20,
      "ยกเลิก": 5
    },
    "requests": [
      {
        "no": "2505008",
        "ssid": "00008",
        "name": "พิมพ์ใจ",
        "lname": "สุขดี",
        "pos": "2nd Officer",
        "doc": "Basic Safety Training",
        "status": "รอตรวจเอกสาร",
        "resubmit": true,
        "date": "03/05/2026 09:00",
        "amt": "1,500"
      },
      {
        "no": "2505007",
        "ssid": "00001",
        "name": "สมชาย",
        "lname": "ใจสุข",
        "pos": "Master",
        "doc": "Basic Safety Training",
        "status": "รอตรวจเอกสาร",
        "resubmit": false,
        "date": "02/05/2026 10:00",
        "amt": "1,500"
      },
      {
        "no": "2505006",
        "ssid": "00002",
        "name": "สุภาพร",
        "lname": "ใจงาม",
        "pos": "Chief Officer",
        "doc": "Basic Safety Training",
        "status": "รอผู้ยื่นแก้ไข",
        "resubmit": false,
        "date": "01/05/2026 09:00",
        "amt": "1,500"
      },
      {
        "no": "2505005",
        "ssid": "00003",
        "name": "ธีรพล",
        "lname": "มั่นคง",
        "pos": "2nd Officer",
        "doc": "Advanced Fire Fighting",
        "status": "รอผลกรมเจ้าท่า",
        "resubmit": false,
        "date": "30/04/2026 14:30",
        "amt": "2,500"
      },
      {
        "no": "2505004",
        "ssid": "00004",
        "name": "วรพล",
        "lname": "เพชรดี",
        "pos": "Master",
        "doc": "Basic Safety Training",
        "status": "รอรับเอกสารจากกรม",
        "resubmit": false,
        "date": "28/04/2026 11:20",
        "amt": "1,500"
      },
      {
        "no": "2505003",
        "ssid": "00005",
        "name": "ปิยวัฒน์",
        "lname": "แก้วกาญจนี",
        "pos": "Chief Eng.",
        "doc": "Basic Safety Training",
        "status": "กำลังจัดส่ง",
        "resubmit": false,
        "date": "25/04/2026 08:15",
        "amt": "1,500"
      },
      {
        "no": "2505002",
        "ssid": "00006",
        "name": "กนกวรรณ",
        "lname": "ทองดี",
        "pos": "2nd Officer",
        "doc": "Basic Safety Training",
        "status": "จัดส่งสำเร็จ",
        "resubmit": false,
        "date": "20/04/2026 13:45",
        "amt": "1,500"
      },
      {
        "no": "2505001",
        "ssid": "00007",
        "name": "ธนวัฒน์",
        "lname": "รุ่งเรือง",
        "pos": "Master",
        "doc": "Basic Safety Training",
        "status": "ยกเลิก",
        "resubmit": false,
        "date": "15/04/2026 09:00",
        "amt": "1,500"
      }
    ]
  }
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `total` | number | จำนวนรายการทั้งหมดที่ตรงกับ filter (ใช้คำนวณ pagination) |
| `statusCounts` | object | นับตาม search (`ssid`/`name`/`requestNo`) เท่านั้น **ไม่กรองตาม `status`** |
| `requests[].no` | string | เลขที่คำขอ |
| `requests[].ssid` | string | Smart Seaman ID |
| `requests[].name` | string | ชื่อ |
| `requests[].lname` | string | นามสกุล |
| `requests[].pos` | string | ตำแหน่ง |
| `requests[].doc` | string | ชื่อเอกสารที่ขอต่อ |
| `requests[].status` | string | enum: `รอตรวจเอกสาร` / `รอผู้ยื่นแก้ไข` / `รอผลกรมเจ้าท่า` / `รอรับเอกสารจากกรม` / `กำลังจัดส่ง` / `จัดส่งสำเร็จ` / `ยกเลิก` |
| `requests[].resubmit` | boolean | `true` = ผู้ยื่นแก้ไขและ resubmit แล้ว |
| `requests[].date` | string | วันที่ยื่น format `DD/MM/YYYY HH:mm` |
| `requests[].amt` | string | ยอดชำระ format พร้อมแสดง เช่น `"1,500"` |

## statusCounts Logic
> นับตาม `ssid` / `name` / `requestNo` เสมอ — **ไม่** กรองตาม `status`
> เพื่อให้ตัวเลขบนแต่ละ tab ถูกต้องตลอดเวลา

## Error Codes

| code | description |
|------|-------------|
| `WA00000` | Success |
| `WA00007` | Session หมดอายุ → Frontend จะ logout อัตโนมัติ |
