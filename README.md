Here's a clean, copy‑paste‑ready markdown README for the `edutrack-dashboard` repository – just copy everything below and paste it into the GitHub edit box.

---

# EduTrack Dashboard

[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Next.js](https://img.shields.io/badge/Next.js-13.5-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A full‑stack academic dashboard that tracks assignments, grades, attendance, and student progress in real time.  
Includes an auto‑grading engine, interactive charts, and dark mode.

---

## 📖 Overview

EduTrack Dashboard solves the problem of fragmented academic data by providing a unified interface for students and educators. The platform offers:

- Assignment tracking (CRUD)
- Real‑time score statistics and distribution histograms
- An auto‑grading system that validates AI‑generated answers against reference functions
- A responsive Next.js frontend with toast notifications and dark mode

---

## ✨ Features

- **Assignment Management** – Create, list, and delete assignments with student name, subject, score, and max score.
- **Auto‑Grading Engine** – Submit a student’s numeric answer for a reference function (`sin`, `cos`, `square`, `exp`). The system compares it to the true value, computes an error‑based score (tolerance: `1e-3`), and stores the auto‑graded assignment.
- **Statistical Insights** – APIs to retrieve average score (as a percentage) and score distribution across configurable bins.
- **Modern Dashboard** – Built with Next.js and Chart.js, featuring a dark mode toggle and toast notifications for user feedback.
- **Docker Support** – Full containerisation with `docker-compose.yml` for easy deployment.

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | FastAPI (Python), SQLAlchemy ORM, PostgreSQL |
| **Frontend** | Next.js 13.5, React 18, Chart.js, CSS |
| **Containerisation** | Docker, Docker Compose |
| **Testing** | (not yet, but pytest ready) |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Docker & Docker Compose (optional but recommended)

### Running with Docker (Recommended)

```bash
git clone https://github.com/Archsec-Emman/edutrack-dashboard.git
cd edutrack-dashboard
docker-compose up -d
```

- Backend API: `http://localhost:8000`
- Frontend Dashboard: `http://localhost:3000`

### Running Locally (Development)

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📡 API Endpoints

All endpoints are served under `http://localhost:8000`.

### Assignments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/assignments/` | Create a new assignment |
| GET | `/assignments/` | List all assignments (most recent first) |
| DELETE | `/assignments/{assignment_id}` | Delete an assignment |

### Statistics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats/avg_score` | Average score (%) across all assignments |
| GET | `/stats/distribution` | Score distribution in bins `[0,20,40,60,80,100]` |

### Auto‑Grading
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auto-grade/` | Submit an answer for a reference function and get an auto‑graded score |

**Auto‑grade request body:**
```json
{
  "student_name": "Alice",
  "subject": "Math",
  "function_name": "sin",
  "user_answer": 0.8415,
  "x_value": 1.0
}
```

The system evaluates against the true mathematical function and returns a score out of 100 (tolerance `1e-3`).

---

## 📊 Frontend Dashboard

The Next.js dashboard (`frontend/`) offers:

- **Assignment form** – Create new assignments (student name, subject, score, max score)
- **Assignment list** – View, delete, and refresh assignments
- **Statistics panel** – Shows average score and a bar chart of score distribution
- **Auto‑grading panel** – Students can test their answers against reference functions
- **Dark mode** – Toggleable via a button in the UI
- **Toast notifications** – Feedback for successful / failed actions

The dashboard consumes the backend APIs and uses `chart.js` to visualise the score distribution.

---

## 📁 Project Structure

```
edutrack-dashboard/
├── backend/
│   ├── main.py               # FastAPI application (endpoints, auto‑grading)
│   ├── models.py             # SQLAlchemy models and database setup
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile
├── frontend/
│   ├── components/
│   │   └── Toast.js          # Toast notification component
│   ├── pages/
│   │   └── index.js          # Main dashboard page
│   ├── styles/               # CSS styles (including dark mode)
│   ├── package.json
│   ├── next.config.js
│   └── Dockerfile
├── docker-compose.yml
└── README.md                 # This file
```

---

## 🔧 Development

### Database Setup

The backend uses PostgreSQL. Update `DATABASE_URL` in `backend/models.py` or set it as an environment variable.

```python
DATABASE_URL = os.getenv("DATABASE_URL",
    "postgresql://edutrack:edutrack123@localhost:5432/edutrack")
```

### Adding New Reference Functions

Edit `funcs` dictionary in `backend/main.py` (auto‑grade endpoint) to add more functions.

### Extending the Dashboard

- Add new API calls in `frontend/pages/index.js`
- Use `react-chartjs-2` for additional charts
- Modify CSS in `frontend/styles/` to adjust theming

### Running Tests

(Not yet implemented – contributions welcome!)

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Idea areas:
- User authentication / roles
- More advanced analytics (attendance, subject‑wise breakdown)
- Integration with real LMS APIs
- Unit tests for backend and frontend

---

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details (to be added).

---

## 📬 Contact & Support

- **GitHub Issues**: [https://github.com/Archsec-Emman/edutrack-dashboard/issues](https://github.com/Archsec-Emman/edutrack-dashboard/issues)
- **Author**: [Archsec-Emman](https://github.com/Archsec-Emman)

---

*If you find EduTrack Dashboard useful in your educational institution or research, please consider starring the repository.* ⭐

---
