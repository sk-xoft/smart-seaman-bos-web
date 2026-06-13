# Document Requests Management (จัดการคำขอต่อเอกสาร)

คอมโพเนนต์สำหรับจัดการคำขอต่อเอกสารในระบบ Smart Seaman

## 📁 File Structure

```
src/
├── components/DocumentRequests/
│   ├── ProfileCard.vue          # แสดงข้อมูลผู้ยื่นคำขอ
│   ├── StepperCard.vue          # ขั้นตอนการดำเนินการ
│   ├── DocumentsTab.vue         # แท็บเอกสารประกอบ
│   ├── DocumentTable.vue        # ตารางเอกสาร (แก้ไขได้/View)
│   ├── DeptTab.vue              # แท็บผลจากกรมเจ้าท่า
│   ├── DeliveryTab.vue          # แท็บการจัดส่ง
│   ├── ActionButtons.vue        # ปุ่มการกระทำ
│   └── ModalDialog.vue          # Dialog ยืนยัน
├── views/form/
│   └── DocumentRequests.vue     # Main component
├── constants/
│   └── documentRequests.js      # Constants และ sample data
└── assets/scss/
    └── document-requests.scss   # Styling
```

## 🚀 Usage

### 1. Import ในไฟล์ Router

```javascript
// src/router/form.routes.js
import DocumentRequests from '@/views/form/DocumentRequests.vue'

export default [
  {
    path: '/document-requests',
    component: DocumentRequests,
    meta: { 
      title: 'จัดการคำขอต่อเอกสาร',
      icon: 'ti-file-description'
    }
  }
]
```

### 2. ใช้ใน Sidebar Navigation

```vue
<div class="nav-item" @click="navigate('/document-requests')">
  <i class="ti ti-file-description"></i> จัดการคำขอต่อเอกสาร
</div>
```

### 3. Integration กับ Backend

อัปเดต `src/constants/documentRequests.js` เพื่อใช้ API จริง:

```javascript
// แทนที่ static data ด้วย API calls
import axios from 'axios'

export const fetchRequests = async (filter = 'all') => {
  try {
    const response = await axios.get('/api/document-requests', {
      params: { status: filter }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching requests:', error)
    return []
  }
}
```

## 📋 Main Component Props & Features

### DocumentRequests.vue
- **Data Management**: เก็บ state ของรายการคำขอ, filter, pagination
- **Status Handling**: จัดการสถานะต่างๆ (รอตรวจ, ส่งกลับ, ยื่นกรม ฯลฯ)
- **Modal Dialogs**: ยืนยันการกระทำต่างๆ
- **Pagination**: แบ่งหน้าได้ 20 รายการต่อหน้า

### ProfileCard.vue
- แสดงข้อมูลผู้สมัคร (ชื่อ, เบอร์, อีเมล, ที่อยู่)
- ฟังก์ชัน Copy Address

### StepperCard.vue
- ขั้นตอนของการประมวลผล:
  1. ตรวจเอกสาร
  2. รอผลกรมเจ้าท่า
  3. รอรับเอกสารจากกรมเจ้าท่า
  4. กำลังจัดส่ง
  5. จัดส่งสำเร็จ

### DocumentsTab.vue
- โหมด Edit: ตรวจสอบเอกสารและเพิ่มหมายเหตุ
- โหมด View: ดูเอกสารที่ผ่านการตรวจแล้ว
- สนับสนุน Resubmit cases

### DeptTab.vue
- Phase 1: บันทึกผลจากกรม
- Phase 2: บันทึกรับเอกสาร
- Phase 3: บันทึกข้อมูลการจัดส่ง

### DeliveryTab.vue
- แสดง Tracking No.
- Timeline การจัดส่ง (ใช้ API ไปรษณีย์ไทย)
- Current status และ history

## 🎨 Styling

ใช้ SCSS variables:
- Colors: `$color-accent (#f97316)`, `$color-danger`, `$color-success`
- Fonts: `$font-family: 'Sarabun'`
- Breakpoints: `$breakpoint-md`, `$breakpoint-lg`

## 📊 Status Flow

```
Initial Request
    ↓
รอตรวจเอกสาร (Admin checks docs)
    ├→ ต้องแก้ไข → รอผู้ยื่นแก้ไข → [ผู้ยื่นแก้ไข]
    ├→ ยกเลิก → ยกเลิก ❌
    └→ ผ่าน → รอผลกรมเจ้าท่า
                    ↓
                รอรับเอกสารจากกรม
                    ↓
                กำลังจัดส่ง
                    ↓
                จัดส่งสำเร็จ ✓
```

## 🔧 API Endpoints (Required)

ระบบต้องการ endpoints เหล่านี้:

```
GET    /api/document-requests              # Get all requests
GET    /api/document-requests/:id          # Get request details
POST   /api/document-requests/:id/action   # Update status
PATCH  /api/document-requests/:id/docs     # Update document results
POST   /api/documents/upload               # Upload document
GET    /api/documents/:id/download         # Download document
POST   /api/shipment/tracking              # Get tracking info
```

## 🌐 Internationalization (i18n)

สามารถแปล labels ทั้งหมด:

```javascript
// สำหรับ Thai/English switching
const i18n = {
  th: {
    documentRequests: 'จัดการคำขอต่อเอกสาร',
    waitingReview: 'รอตรวจเอกสาร'
  },
  en: {
    documentRequests: 'Document Requests',
    waitingReview: 'Waiting Review'
  }
}
```

## 🚨 Error Handling

เพิ่ม error boundaries และ try-catch:

```javascript
try {
  const response = await axios.post('/api/document-requests/save', data)
  this.showToast('บันทึกสำเร็จ')
} catch (error) {
  this.showToast(error.response?.data?.message || 'เกิดข้อผิดพลาด', 'error')
}
```

## 📱 Responsive Design

- Desktop (1280px+): Full layout
- Tablet (768px-1023px): Adjusted grid
- Mobile (< 768px): Single column, simplified navigation

## 🎯 Future Enhancements

- [ ] Real-time notifications
- [ ] Document preview
- [ ] Bulk operations
- [ ] Export to PDF/Excel
- [ ] Advanced filtering
- [ ] Search optimization
- [ ] Role-based actions
- [ ] Document versioning

## 💾 Local Storage

สำหรับ cache draft data:

```javascript
// Save draft
localStorage.setItem('docRequest_draft', JSON.stringify(formData))

// Load draft
const draft = JSON.parse(localStorage.getItem('docRequest_draft'))
```

---

**Last Updated**: 2026-06-04
**Version**: 1.0.0
