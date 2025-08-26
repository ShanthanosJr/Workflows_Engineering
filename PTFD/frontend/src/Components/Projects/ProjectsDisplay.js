import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Nav from '../Nav/Nav';
import Projects from './Projects';

const URL = 'http://localhost:5050/projects';

async function fetchHandlers() {
  try {
    const res = await axios.get(URL);
    // Support either {projects:[...]} or just [...]
    return Array.isArray(res.data) ? res.data : (res.data?.projects ?? []);
  } catch (err) {
    console.error('Error fetching projects:', err);
    return [];
  }
}

export default function ProjectsDisplay() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await fetchHandlers();
      if (!mounted) return;
      if (!data || data.length === 0) {
        setErrMsg('No projects found');
      } else {
        setErrMsg('');
      }
      setProjects(data || []);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

    // ✅ remove deleted project immediately from state
    const handleDeleteFromList = (id) => {
      setProjects((prev) => prev.filter((p) => p._id !== id));
    };

  return (
    <div>
      <Nav />
      <div className="container py-3">
        <h1
          className="mb-4 text-center fw-bold"
          style={{
            letterSpacing: "2px",
            fontSize: "2.5rem",
            color: "#2c3e50",
            textShadow: "1px 2px 8px #e0e0e0",
            fontFamily: "'Montserrat', 'Segoe UI', Arial, sans-serif"
          }}
        >
          Projects Display
        </h1>

        {loading && <div className="alert alert-info">Loading projects…</div>}
        {!loading && errMsg && (
          <div className="alert alert-warning">{errMsg}</div>
        )}

        {!loading && !errMsg && (
          <div className="row justify-content-center">
            {projects.map((project, i) => (
              <Projects key={project._id ?? i} project={project} onDelete={handleDeleteFromList}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
