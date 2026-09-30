# Towchein Web

Modern towing, roadside assistance, and dealer fleet management portal built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS.

---

## 🚀 Features

### 1. 🌐 Public Customer Portal
- **Service Offerings**: Flatbed towing, accident recovery, heavy equipment towing, jumpstarts, fuel delivery, and lockout assistance.
- **Location Coverage**: Dynamic city pages across Delhi NCR, Mumbai, Bengaluru, Pune, Hyderabad, and Chennai.
- **Live Vehicle RC & Camera Verification**: Vehicle registration certificate OCR preview and device camera capture support.
- **Emergency Hotline & Direct Booking**: Quick-dial dispatch system with 24/7 availability.

### 2. 🏢 Dealer Operations Portal (`/dealer`)
- **Interactive Dashboard**: Fleet health, active jobs, transaction logs, and package utilization stats.
- **Package Management**: Browse and purchase roadside and towing credit bundles.
- **Vehicle Directory**: Searchable inventory of dealer vehicles, insurance expiry, and registration documents.
- **Wallet & Transactions**: Real-time balance, recharge history, and commission reports.
- **Live Camera / File Capture**: In-browser document capture for instant KYC / RC uploads.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (Turbopack, App Router)](https://nextjs.org/)
- **UI & State**: React 19, Lucide Icons, Vanilla CSS & Tailwind CSS tokens
- **Data Fetching**: `@tanstack/react-query`
- **Validation**: `zod`
- **Language**: TypeScript

---

## 🏁 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Shahvinit3113/Towchen_Web.git
cd Towchen_Web
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm start
```

---

## 📁 Key Routes

| Route | Description |
|---|---|
| `/` | Landing page with Hero, Service breakdown, and Quick Quote widget |
| `/towing` | Detailed towing dispatch and booking page |
| `/roadside-assistance` | Jumpstart, battery, tire, and lockout services |
| `/services` | Comprehensive catalog of all towing & assistance services |
| `/locations` | Pan-India coverage map and city directory |
| `/dealer/dashboard` | Dealer fleet operations and package dashboard |
