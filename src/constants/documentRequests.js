// Status colors mapping
export const STATUS_COLORS = {
  'รอตรวจเอกสาร': '#ff0000',
  'รอผู้ยื่นแก้ไข': '#ff914d',
  'รอผลกรมเจ้าท่า': '#af87ff',
  'รอรับเอกสารจากกรม': '#ffde59',
  'กำลังจัดส่ง': '#21e5f8',
  'จัดส่งสำเร็จ': '#00bf63',
  'ยกเลิก': '#ff5eb3'
}

// Sample request data
export const REQUESTS = [
  { no: '2505008', ssid: '00008', name: 'พิมพ์ใจ', lname: 'สุขดี', pos: '2nd Officer', doc: 'Basic Safety Training', status: 'รอตรวจเอกสาร', date: '03/05/2026 09:00', amt: '1,500', resubmit: true },
  { no: '2505007', ssid: '00001', name: 'สมชาย', lname: 'ใจสุข', pos: 'Master', doc: 'Basic Safety Training', status: 'รอตรวจเอกสาร', date: '02/05/2026 10:00', amt: '1,500' },
  { no: '2505006', ssid: '00002', name: 'สุภาพร', lname: 'ใจงาม', pos: 'Chief Officer', doc: 'Basic Safety Training', status: 'รอผู้ยื่นแก้ไข', date: '01/05/2026 09:00', amt: '1,500' },
  { no: '2505005', ssid: '00003', name: 'ธีรพล', lname: 'มั่นคง', pos: '2nd Officer', doc: 'Advanced Fire Fighting', status: 'รอผลกรมเจ้าท่า', date: '30/04/2026 14:30', amt: '2,500' },
  { no: '2505004', ssid: '00004', name: 'วรพล', lname: 'เพชรดี', pos: 'Master', doc: 'Basic Safety Training', status: 'รอรับเอกสารจากกรม', date: '28/04/2026 11:20', amt: '1,500' },
  { no: '2505003', ssid: '00005', name: 'ปิยวัฒน์', lname: 'แก้วกาญจนี', pos: 'Chief Eng.', doc: 'Basic Safety Training', status: 'กำลังจัดส่ง', date: '25/04/2026 08:15', amt: '1,500' },
  { no: '2505002', ssid: '00006', name: 'กนกวรรณ', lname: 'ทองดี', pos: '2nd Officer', doc: 'Basic Safety Training', status: 'จัดส่งสำเร็จ', date: '20/04/2026 13:45', amt: '1,500' },
  { no: '2505001', ssid: '00007', name: 'ธนวัฒน์', lname: 'รุ่งเรือง', pos: 'Master', doc: 'Basic Safety Training', status: 'ยกเลิก', date: '15/04/2026 09:00', amt: '1,500' }
]

// Default documents
export const DOCS_DEFAULT = [
  { id: 1, n: 'สำเนาบัตรประชาชน', f: true },
  { id: 2, n: 'รูปถ่ายผู้สมัคร', f: true },
  { id: 3, n: 'หนังสือรับรองบริษัท', f: true },
  { id: 4, n: 'ใบรับรองแพทย์', f: false }
]

// Resubmission documents
export const DOCS_RESUB = [
  { id: 1, n: 'สำเนาบัตรประชาชน', f: true, upd: false },
  { id: 2, n: 'รูปถ่ายผู้สมัคร', f: true, upd: false },
  { id: 3, n: 'หนังสือรับรองบริษัท', f: true, upd: true },
  { id: 4, n: 'ใบรับรองแพทย์', f: false, upd: false }
]

// Stepper steps
export const STEPPER_STEPS = [
  { n: 1, l: 'ตรวจเอกสาร' },
  { n: 2, l: 'รอผลกรมเจ้าท่า' },
  { n: 3, l: 'รอรับเอกสารจากกรม' },
  { n: 4, l: 'กำลังจัดส่ง' },
  { n: 5, l: 'จัดส่งสำเร็จ' }
]

// Delivery tracking sample data
export const DELIVERY_TRACKS_SENDING = [
  { time: '12/05/2026 14:30', status: 'อยู่ระหว่างขนส่ง', loc: 'ศูนย์ไปรษณีย์ กรุงเทพฯ ลาดกระบัง', cur: true },
  { time: '12/05/2026 10:30', status: 'ถึงศูนย์กระจาย', loc: 'ศูนย์ไปรษณีย์ บางรัก', cur: false },
  { time: '12/05/2026 08:00', status: 'รับฝากเรียบร้อย', loc: 'ที่ทำการไปรษณีย์ บางรัก', cur: false }
]

export const DELIVERY_TRACKS_DELIVERED = [
  { time: '13/05/2026 11:20', status: 'จัดส่งสำเร็จ', loc: 'ผู้รับ: สมชาย ใจสุข — ฉะเชิงเทรา', cur: false },
  { time: '13/05/2026 08:15', status: 'อยู่ระหว่างนำจ่าย', loc: 'ที่ทำการไปรษณีย์ ท่าตะเกียบ', cur: false },
  { time: '12/05/2026 08:00', status: 'รับฝากเรียบร้อย', loc: 'ที่ทำการไปรษณีย์ บางรัก', cur: false }
]
