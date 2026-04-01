# SkinScript — AI Skincare Analysis System

SkinScript is a **privacy-first, AI-powered skincare scanner** that analyzes product ingredients and provides personalized insights based on your skin type, sensitivities, and history.

Built with a **local-first architecture**, the app minimizes backend dependency while delivering fast, intelligent results using OCR + LLM.

---

# Features

## Smart Product Scanning

* Capture or upload product images
* Extract ingredients using OCR (VLM-based)
* Automatically parse ingredient lists

## AI-Powered Analysis

* Ingredient breakdown with benefits
* Conflict detection (ingredient interactions)
* Personalized warnings based on user profile
* Final safety verdict + score

## User Personalization

* Skin type detection (onboarding)
* Sensitivity tracking (e.g. fragrance, acne triggers)
* Persistent user profile (stored locally)

## Local-First Storage

* IndexedDB for scans & results
* localStorage for preferences & theme
* Works with minimal backend dependency

## PWA Ready (optional)

* Installable app experience
* Offline-friendly UI

---

# Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS

### AI Layer

* RunAnywhere SDK (OCR + VLM + LLM)
* Local model compatibility support

### Storage

* IndexedDB (via `db.js`)
* localStorage

---

# Project Structure

```bash
src/
│
├── ai/                 # AI integration (OCR + LLM logic)
│   ├── compatibilityLLM.js
│   ├── modelLoader.js
│   ├── runanywhere.js
│   └── vlmOCR.js
│
├── components/        # Reusable UI components
├── pages/             # Main app screens (Dashboard, Results, etc.)
├── hooks/             # Custom React hooks
├── services/          # Business logic & API abstractions
├── utils/             # Core utilities
│   ├── db.js          # IndexedDB logic
│   ├── storage.js     # localStorage helpers
│   ├── ingredientParser.js
│   └── promptTemplates.js
│
├── assets/            # Static assets
│
├── App.jsx            # Root component
├── main.jsx           # Entry point
└── index.css          # Global styles
```

---

# Getting Started

## 1. Clone the repo

```bash
git clone <your-repo-url>
cd skinscript
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Add environment variables

Create a `.env` file:

```env
VITE_RUNANYWHERE_KEY=your_api_key_here
```

---

## 4. Run the app locally

```bash
npm run dev
```

---

## 5. Build for production

```bash
npm run build
```

---

# How It Works

### 1. Scan / Upload

User captures or uploads an image of a product.

### 2. OCR Extraction

* `vlmOCR.js` extracts ingredient text using a vision-language model

### 3. Ingredient Parsing

* `ingredientParser.js` cleans and structures ingredients

### 4. AI Analysis

* `compatibilityLLM.js` evaluates:

  * ingredient safety
  * conflicts
  * personalization

### 5. Result Generation

User sees:

* Ingredient breakdown
* Conflicts
* Warnings
* Final verdict

---

# Data Storage Strategy

| Data Type        | Storage      |
| ---------------- | ------------ |
| User profile     | localStorage |
| Scan history     | IndexedDB    |
| AI results       | IndexedDB    |

---

# Privacy

* No mandatory backend
* No user data stored on servers
* All scans & preferences remain on-device (unless API is used)

---

# Deployed Link

Link:
---

# Notes

* AI features require internet if using API-based models
* Fully offline mode requires locally hosted models

---

# Future Improvements

* Offline AI inference (WebGPU / local models)
* Multi-device sync (optional backend)
* Advanced ingredient scoring system
* Dermatology-grade recommendations

---

# Contributing

Pull requests are welcome. For major changes, open an issue first.

---

# License

MIT License

---

# Vision

SkinScript aims to make skincare **transparent, personalized, and trustworthy** by decoding complex ingredient lists into actionable insights — instantly.
