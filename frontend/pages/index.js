import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Toast from '../components/Toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Home() {
  const [assignments, setAssignments] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [subject, setSubject] = useState('Math');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState({ average: 0, distribution: { bins: [], counts: [] } });
  const [autoGrade, setAutoGrade] = useState({ student: '', function: 'sin', x: 1, answer: '' });

  // Load dark mode preference
  useEffect(() => {
    const saved = localStorage.getItem('darkMode') === 'true';
    setDarkMode(saved);
    if (saved) document.body.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    if (newMode) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  };

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type });
  };

  const fetchData = async () => {
    try {
      const [assignRes, avgRes, distRes] = await Promise.all([
        fetch('http://localhost:8000/assignments/'),
        fetch('http://localhost:8000/stats/avg_score'),
        fetch('http://localhost:8000/stats/distribution')
      ]);
      const assignmentsData = await assignRes.json();
      const avgData = await avgRes.json();
      const distData = await distRes.json();
      setAssignments(assignmentsData);
      setStats({ average: avgData.average, distribution: distData });
    } catch (err) {
      console.error(err);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const submitAssignment = async (e) => {
    e.preventDefault();
    if (!studentName || !score || !maxScore) return;
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:8000/assignments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_name: studentName, subject, score: parseFloat(score), max_score: parseFloat(maxScore) })
      });
      const newAssignment = await res.json();
      setAssignments([newAssignment, ...assignments]);
      setStudentName('');
      setScore('');
      setMaxScore('');
      showToast(`Added assignment for ${newAssignment.student_name}`);
    } catch (err) {
      showToast('Error adding assignment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteAssignment = async (id) => {
    try {
      await fetch(`http://localhost:8000/assignments/${id}`, { method: 'DELETE' });
      setAssignments(assignments.filter(a => a.id !== id));
      showToast('Assignment deleted');
      // Refresh stats
      const avgRes = await fetch('http://localhost:8000/stats/avg_score');
      const distRes = await fetch('http://localhost:8000/stats/distribution');
      const avgData = await avgRes.json();
      const distData = await distRes.json();
      setStats({ average: avgData.average, distribution: distData });
    } catch (err) {
      showToast('Delete failed', 'error');
    }
  };

  const handleAutoGrade = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/auto-grade/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: autoGrade.student,
          subject: 'Auto',
          function_name: autoGrade.function,
          user_answer: parseFloat(autoGrade.answer),
          x_value: parseFloat(autoGrade.x)
        })
      });
      const data = await res.json();
      showToast(`Auto-graded: ${data.user_score}% | Correct: ${data.correct_answer.toFixed(4)}`);
      fetchData(); // refresh list
      setAutoGrade({ student: '', function: 'sin', x: 1, answer: '' });
    } catch (err) {
      showToast('Auto-grade error', 'error');
    }
  };

  const chartData = {
    labels: stats.distribution.bins.slice(0, -1).map((b, i) => `${b}-${stats.distribution.bins[i+1]}`),
    datasets: [{
      label: 'Number of Assignments',
      data: stats.distribution.counts,
      backgroundColor: 'rgba(102, 126, 234, 0.6)',
      borderRadius: 8
    }]
  };

  if (loading) return <div className="skeleton">Loading modern dashboard...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>📊 EduTrack Dashboard</h1>
        <button onClick={toggleDarkMode} style={{ background: 'none', fontSize: '1.5rem' }}>
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div className="stat-card">📈 Average Score: {stats.average.toFixed(1)}%</div>
        <div className="stat-card">📚 Total Assignments: {assignments.length}</div>
      </div>

      {/* Chart */}
      <div style={{ marginBottom: '2rem', background: 'var(--card-bg)', padding: '1rem', borderRadius: '1.5rem' }}>
        <h3>Score Distribution</h3>
        <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: true }} />
      </div>

      {/* Add assignment form */}
      <form onSubmit={submitAssignment} className="form-group">
        <input type="text" placeholder="Student name" value={studentName} onChange={e => setStudentName(e.target.value)} required />
        <select value={subject} onChange={e => setSubject(e.target.value)}>
          <option>Math</option><option>Science</option><option>History</option>
        </select>
        <input type="number" placeholder="Score" value={score} onChange={e => setScore(e.target.value)} required />
        <input type="number" placeholder="Max score" value={maxScore} onChange={e => setMaxScore(e.target.value)} required />
        <button type="submit" disabled={submitting}>{submitting ? 'Adding...' : '+ Assignment'}</button>
      </form>

      {/* Auto-grade form */}
      <div className="auto-grade-section">
        <h3>🤖 Auto-Grade with AI (Valid8tor style)</h3>
        <form onSubmit={handleAutoGrade} className="auto-grade-form">
          <input type="text" placeholder="Student name" value={autoGrade.student} onChange={e => setAutoGrade({...autoGrade, student: e.target.value})} required />
          <select value={autoGrade.function} onChange={e => setAutoGrade({...autoGrade, function: e.target.value})}>
            <option value="sin">sin(x)</option><option value="cos">cos(x)</option><option value="square">x²</option><option value="exp">e^(x/10)</option>
          </select>
          <input type="number" placeholder="x value" value={autoGrade.x} onChange={e => setAutoGrade({...autoGrade, x: e.target.value})} step="any" />
          <input type="number" placeholder="Student's answer" value={autoGrade.answer} onChange={e => setAutoGrade({...autoGrade, answer: e.target.value})} step="any" />
          <button type="submit">Grade Automatically</button>
        </form>
      </div>

      {/* Assignment list */}
      <div className="assignments-grid">
        {assignments.map((a, idx) => (
          <div className="card" key={a.id} style={{ '--index': idx }}>
            <button className="delete-btn" onClick={() => deleteAssignment(a.id)}>🗑️</button>
            <h3>{a.student_name}</h3>
            <p className="subject">{a.subject} {a.auto_graded && '🤖'}</p>
            <div className="score">{a.score} / {a.max_score}</div>
            <div className="percentage">{((a.score / a.max_score) * 100).toFixed(1)}%</div>
            <small>{new Date(a.created_at).toLocaleDateString()}</small>
          </div>
        ))}
        {assignments.length === 0 && <div className="empty-state">No assignments yet. Add one above.</div>}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}