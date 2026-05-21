import { useState, useEffect } from 'react';

export default function Home() {
  const [assignments, setAssignments] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/assignments/')
      .then(res => res.json())
      .then(data => setAssignments(data));
  }, []);

  const submitAssignment = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:8000/assignments/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_name: studentName, score: parseFloat(score), max_score: parseFloat(maxScore) })
    });
    const newAssignment = await res.json();
    setAssignments([...assignments, newAssignment]);
    setStudentName('');
    setScore('');
    setMaxScore('');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>EduTrack Dashboard</h1>
      <form onSubmit={submitAssignment}>
        <input placeholder="Student name" value={studentName} onChange={e => setStudentName(e.target.value)} required />
        <input placeholder="Score" type="number" value={score} onChange={e => setScore(e.target.value)} required />
        <input placeholder="Max score" type="number" value={maxScore} onChange={e => setMaxScore(e.target.value)} required />
        <button type="submit">Add Assignment</button>
      </form>
      <ul>
        {assignments.map(a => <li key={a.id}>{a.student_name}: {a.score}/{a.max_score}</li>)}
      </ul>
    </div>
  );
}