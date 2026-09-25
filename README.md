# OrthoTrack

A full-stack web app for patients recovering from orthopedic surgery to track their range of motion, manage their injury records, and monitor recovery progress over time.

## Features

- **AI-powered ROM analysis** — upload an exercise video and MediaPipe Pose estimates joint angles frame-by-frame, reporting max/min angle, range of motion, and rep count
- **Injury management** — log injuries with surgery dates, notes, and a timeline of recovery events (appointments, milestones, setbacks)
- **Session history** — view past ROM sessions, compare two sessions side-by-side, and track progress over time with charts
- **ROM goals** — set a target angle per injury and visualize progress toward it
- **Settings** — display name, default tracking side, dark mode, CSV data export
- **Onboarding checklist** — guides new users through setting up their first injury and recording a session

## Tech Stack

**Frontend:** React 19, React Router, Recharts, Tailwind CSS, Vite  
**Backend:** Python, Flask, MediaPipe Pose, OpenCV, SciPy  
**Database & Auth:** Supabase (PostgreSQL + Row Level Security)  
**Testing:** pytest

## Deployment

- **Frontend:** Deployed on [Vercel](https://vercel.com)
- **Backend:** Run locally or on a server with ≥1GB RAM (see note below)
- **Database & Auth:** [Supabase](https://supabase.com)

### ⚠️ Backend Hosting Constraint

MediaPipe Pose + OpenCV require **~700–900MB RAM** at runtime. Render's free tier (512MB) and most shared-hosting free tiers are insufficient — the worker process gets OOM-killed mid-analysis.

**Options for running the backend:**

| Option | Cost | Notes |
|---|---|---|
| Run locally + expose via [ngrok](https://ngrok.com) | Free | Best for demos and development |
| Render Starter ($7/mo) | Paid | 512MB → 1GB, enough for MediaPipe |
| Railway / Fly.io hobby tier | Free/Paid | ~1GB RAM available on free plans |
| Any VPS (DigitalOcean, Hetzner) | ~$5/mo | Full control, easy Docker deploy |

For a live demo, run the Flask backend locally and use ngrok to get a public URL:

```bash
python app.py
# in a second terminal:
ngrok http 5001
```

Then set `VITE_BACKEND_URL` in Vercel to your ngrok URL (update it each time ngrok restarts).

### Environment Variables

| Service | Variable | Value |
|---|---|---|
| Vercel | `VITE_SUPABASE_URL` | Your Supabase project URL |
| Vercel | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| Vercel | `VITE_BACKEND_URL` | Your backend URL (ngrok, Render, etc.) |
| Backend | `FRONTEND_URL` | Your Vercel deployment URL (for CORS) |

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.9+
- A Supabase project

### Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
pip install -r requirements.txt
python app.py
```

The Flask server runs on `http://localhost:5001` and the Vite dev server on `http://localhost:5173`.

### Tests

```bash
pytest test_app.py
```

## ROM Analysis

The backend uses **MediaPipe Pose Landmarker** to extract joint coordinates from each video frame and computes the angle at the relevant joint (e.g. elbow for bicep curls, knee for leg raises) using the law of cosines. Rep count is estimated by detecting peaks in the angle time series using SciPy's `find_peaks`.

ROM measurements are validated against AAOS normative joint motion values. See [VALIDATION.md](VALIDATION.md) for methodology and results.

## Project Structure

```
orthotrack-app/
├── src/
│   ├── pages/          # Dashboard, ROM, ROMHistory, InjuryDetail, Settings, Login, Signup
│   ├── components/     # Charts, forms, navbar, onboarding, motion analysis UI
│   ├── lib/            # Supabase client
│   └── constants/      # Exercise definitions
├── app.py              # Flask backend (ROM analysis endpoint)
├── supabase_config.py  # Supabase client setup
├── test_app.py         # pytest unit tests
└── pose_landmarker_lite.task  # MediaPipe model file
```
