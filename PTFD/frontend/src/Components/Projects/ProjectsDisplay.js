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
        <h1 className="mb-3">Projects Display</h1>

        {loading && <div className="alert alert-info">Loading projects…</div>}
        {!loading && errMsg && (
          <div className="alert alert-warning">{errMsg}</div>
        )}

        {!loading && !errMsg && projects.map((project, i) => (
          <div key={project._id ?? i} className="card mb-3">
            <Projects project={project} onDelete={handleDeleteFromList}/>
          </div>
        ))}
      </div>
    </div>
  );
}
