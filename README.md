# CivicPulse AI 🛡️
> **Smarter Communities. Safer Tomorrow.**  
> *Built for PromptWars 2026 — 1-Day Individual AI Hackathon*

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini_API-1.5_Flash-4285F4?logo=google&logoColor=white)](https://aistudio.google.com/)
[![GitHub Pages](https://img.shields.io/badge/Live_Demo-GitHub_Pages-22c55e?logo=github&logoColor=white)](https://valivadasari.github.io/Civic-Pulse/)
[![Vercel Compatible](https://img.shields.io/badge/Deployment-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com/)

🔗 **Live Production URL:** [https://valivadasari.github.io/Civic-Pulse/](https://valivadasari.github.io/Civic-Pulse/)

---

## 🌟 Executive Summary

**CivicPulse AI** is a municipal civic infrastructure intelligence and community hazard tracking platform. It empowers citizens and city departments to identify, prioritize, and track **potholes, overflowing garbage, blocked stormwater drains, and pressurized water leakage** in real-time.

Powered by **Google Gemini Multimodal Vision AI**, CivicPulse transforms raw photos into structured physical hazard assessments—evaluating road cavitation depth, water loss rates, and public safety impact to recommend priority dispatch.

---

## ⚡ Core Modules & Key Features

### 1. 📊 Command Dashboard
- **Dynamic Key Metrics:** Real-time counters for Total Reports, Active Open Issues, High-Priority Hazards, and Remediated Issues with dynamic resolution percentage.
- **Embedded Geospatial Preview:** Mini Leaflet map displaying active incident clusters and urgent beacons.
- **Category & Priority Mix:** Instant visual charts highlighting categorical distribution and priority levels.
- **Live Citizen Stream:** Interactive cards with photos, hazard scores, and 1-click full-details inspection.

### 2. 📸 Multimodal Report Intake with Gemini Vision AI
- **Photo Upload & Camera Capture:** Drag-and-drop or file upload with live image preview.
- **Speed Presets for Judges:** 4 one-click test presets (*Dangerous Pothole*, *Sidewalk Dumpster Spill*, *Blocked Storm Grate*, *Pressurized Water Rupture*) with verified real-world imagery and GPS coordinates.
- **Genuine Multimodal AI Analysis:** Evaluates physical damage, pedestrian/vehicular risk, and structural factors:
  - Structured output: `likelyCategory`, `summary`, `recommendedPriority`, `reasoning`, `nextAction`, `hazardScore (1-10)`, `confidence`.
  - **1-Click Recommendation Adoption:** Auto-populates category and priority into the report with a single tap.
  - **Ethical AI Guarantee:** When an API key is provided, genuine Gemini Vision analyzes image pixels. When absent or offline, it transparently displays **"Simulated Demo Analysis"** with full disclaimer—**never faking real AI results**.

### 3. 🛡️ Intelligent Spatial & Text Duplicate Detection
- **Haversine Distance Formula:** Flags active reports within 300 meters.
- **Text & Category Similarity:** Analyzes token overlap across titles and descriptions.
- **Duplicate Prevention Workflow:** Informs the citizen with a visual comparison card and provides two options:
  - *Upvote Existing Issue* (adds community weight without creating duplicate noise)
  - *Confirm & Submit Anyway* (human-in-the-loop override)

### 4. 🗺️ Geospatial Hazard Explorer (Leaflet + OpenStreetMap)
- **Custom Color-Coded Markers:** Distinct pins for Potholes (amber), Garbage (purple), Drains (teal), and Water Leaks (blue).
- **Pulsing Critical Rings (`pulse-critical`):** Animated CSS beacons around High Priority hazards requiring urgent response.
- **Interactive Map Filters:** Filter by category, priority (High/Med/Low), and status (Open/In Progress/Resolved).
- **Cartography Toggle:** Clean CartoDB Positron mode or standard OpenStreetMap.
- **Pin Placement Mode:** Click anywhere on the map to pick coordinates with reverse geocoding.

### 5. 📋 Issue Management & Triage
- **Dual Display Modes:** Responsive Table View and Card Grid View.
- **Search & Multi-Filter:** Filter by keywords, category, priority, status, or genuine vs. demo records.
- **Live Dispatch Transitions:** Seamlessly transition `Open` → `In Progress` → `Resolved` with immediate reactive updates across the entire app.
- **Administrative Override Audit:** Priority adjustments require a logged justification for transparent accountability.

### 6. 📈 Civic Analytics & Hotspot Telemetry
- **Recharts Integration:** Polished bar charts and donut charts.
- **Actual Resolution Times:** Averages calculated strictly from genuine creation and resolution timestamps.
- **Hotspot Sector Ranking:** Identifies top problem neighborhoods to inform preventative municipal maintenance routes.
- **One-Click JSON Export:** Download the entire dataset for municipal GIS systems.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Core** | React 18.3, TypeScript, Vite 5 |
| **Styling & System** | Tailwind CSS 3.4, PostCSS, Custom Scrollbars, Glassmorphism |
| **AI & Multimodal** | Google Gemini 1.5 Flash API (Structured JSON & Vision) |
| **Maps & Geospatial** | Leaflet 1.9, OpenStreetMap, CartoDB Positron tiles |
| **Data Visualization**| Recharts 2.15 |
| **Icons & Delights** | Lucide React, Canvas Confetti |
| **Persistence** | LocalStorage with reactive cross-tab events & demo restore |
| **Deployment** | Vercel-compatible SPA configuration (`vercel.json`) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18.0.0` or higher
- npm `v9.0.0` or higher

### Local Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/civicpulse-ai.git
   cd civicpulse-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **(Optional) Configure Gemini API Key:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey):
   ```env
   VITE_GEMINI_API_KEY=AIzaSy...
   ```
   *(Note: You can also enter or test your Gemini API Key directly inside the web interface via the **"AI Engine"** button in the top navigation).*

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🌐 Deployment to Vercel

CivicPulse AI is structured for zero-configuration deployment to Vercel:

1. Push code to GitHub.
2. Import project into [Vercel](https://vercel.com).
3. Under **Environment Variables**, set:
   - `VITE_GEMINI_API_KEY`: *(Optional)* Your Google Gemini API Key.
4. Click **Deploy**. Vercel will automatically run `npm run build` using the configured `vercel.json` rewrite rules.

---

## 🧪 Hackathon Demo Walkthrough (For Judges)

1. **Dashboard Overview:** View dynamic KPI metrics, interactive map preview, and recent incident cards.
2. **Instant Test Preset:** Click **"Report Issue"** → Select **"Dangerous Pothole on High-Speed Road"** under Hackathon Quick Presets.
3. **AI Vision Inspection:** Click **"Analyze with Gemini AI"**. Watch the AI evaluate road cavitation depth and calculate hazard scores.
4. **Accept Recommendation:** Click **"Accept AI Category & Priority"** to apply the AI triage recommendation.
5. **Duplicate Alert:** Notice how the system flags existing nearby reports with distance and similarity metrics.
6. **Submit & Celebrate:** Click **"Submit Community Report"** and watch the confetti burst.
7. **Explore Map:** Navigate to **"Explore Map"** to interact with custom color-coded category markers and pulsing critical hazard rings.
8. **Manage & Resolve:** Go to **"Manage Issues"**, search for your report, and transition it from `Open` → `In Progress` → `Resolved`.
9. **Analytics:** View live category distribution, priority donut chart, cycle times, and hotspot rankings.
10. **Reset Demo:** Click **"Reset Demo"** at any time to restore the default dataset.

---

## ⚖️ License & Ethical AI Disclosure
CivicPulse AI was built for PromptWars 2026. All AI outputs are treated as decision-support recommendations subject to administrative human review.
