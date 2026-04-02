# Nota — Local-first Note App

แอปจดโน้ตที่อ่านและเขียนไฟล์จริงบนเครื่อง รองรับ `.md` และ `.txt`

## Features
- เปิดหลาย folder พร้อมกัน (workspaces) เหมือน VSCode
- แสดงเฉพาะไฟล์ `.md` และ `.txt` เท่านั้น
- บันทึกลงไฟล์จริงอัตโนมัติ ทุก 0.8 วินาที
- สร้าง / เปลี่ยนชื่อ / ลบไฟล์ได้จากในแอพ
- รองรับ subfolder 1 ระดับ
- ใช้ `Ctrl+S` บันทึกได้ทันที

## วิธี Build ด้วย GitHub Actions (ไม่ต้องติดตั้งอะไร)

1. สร้าง repository ใหม่บน GitHub (Public หรือ Private ก็ได้)
2. Upload ไฟล์ทั้งหมดจาก zip นี้ขึ้น repo
3. ไปที่ tab **Actions** → จะเห็น workflow "Build Nota for Windows" รันอัตโนมัติ
4. รอประมาณ 3–5 นาที
5. คลิก run ที่เสร็จแล้ว → เลื่อนลงไปส่วน **Artifacts** → Download **Nota-Windows-Setup**
6. แตก zip → ดับเบิ้ลคลิก `Nota Setup x.x.x.exe`

> หากไม่ trigger อัตโนมัติ ให้ไปที่ Actions → "Build Nota for Windows" → กด **Run workflow**

## วิธีรันแบบ dev (ถ้ามี Node.js)

```bash
npm install
npm start
```

## โครงสร้างไฟล์

```
nota-app/
├── src/
│   ├── main.js       # Electron main process (อ่าน/เขียนไฟล์)
│   ├── preload.js    # Secure bridge ระหว่าง main ↔ renderer
│   └── index.html    # UI ทั้งหมด
├── .github/
│   └── workflows/
│       └── build.yml # GitHub Actions build script
└── package.json
```

## ข้อมูลเพิ่มเติม

- ไฟล์ที่บันทึกจะอยู่ใน folder ที่คุณเลือก ไม่มีการส่งข้อมูลออกไปไหน
- สามารถเปิดไฟล์ด้วย editor อื่นได้ปกติ (Obsidian, VS Code, Notepad ฯลฯ)
- format ไฟล์ `.md`: บรรทัดแรกจะถูกใช้เป็น `# หัวข้อ` อัตโนมัติ
