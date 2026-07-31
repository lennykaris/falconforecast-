# Falcon Forecast (Frontend Demo)

**Falcon Forecast** is a modern, high-converting sports prediction subscription platform demo built with **Vite + React + TypeScript + Tailwind CSS**.

This project is a pure frontend scaffolding built to validate user experience, layout, and subscription flow prior to backend integration (Stripe/PayPal + CMS API).

## 🚀 Live Demo & Features

- **Home (`/`)**: Hero section with live stats ticker, "Today's Free Tips" carousel, locked VIP pick teasers, ROI highlights, and FAQ accordion.
- **Free Tips (`/tips`)**: Complete list of daily free predictions with league filter tabs, search query filtering, and confidence score indicators.
- **VIP Paywall (`/vip`)**: Billing tiers (Weekly / Pro Predictor / Champion VIP), feature comparison matrix, and interactive ROI Profit Simulator.
- **Dashboard (`/dashboard`)**: Logged-in subscriber view displaying active plan status, unlocked VIP recommendations with xG tactical breakdowns, and payment placeholder modals.
- **Admin Panel (`/admin`)**: Interactive CMS for predictions (add, edit inline, delete, free/VIP tier toggle) powered by local state.
- **Auth Flow (`/login`, `/signup`)**: Authentication forms with 1-click Demo Account login presets (Free User, VIP Subscriber, Admin).
- **Interactive Checkout Modal**: Simulated 1-click payment flow that instantly upgrades user state to VIP.

## 🛠️ Tech Stack

- **Framework**: Vite + React 19 + TypeScript
- **Styling**: Tailwind CSS (v4) with custom `brand` light-blue palette (`#5EB8E8`)
- **Icons**: Lucide React
- **Routing**: React Router v7
- **State Management**: React Context (`AuthContext` & `PredictionsContext`) + LocalStorage fallback

## 📦 Project Setup & Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Local Dev Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## 🌐 Deploying to Vercel

This repository is ready for zero-configuration static deployment to Vercel:

1. Push this project to GitHub/GitLab.
2. Import the repository into [Vercel](https://vercel.com).
3. Framework Preset: **Vite**
4. Click **Deploy**.

---
*Note: This is a frontend demo with static/mock data for UX validation.*
