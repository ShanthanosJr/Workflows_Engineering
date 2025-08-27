import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Timelines() {
  const [timelines, setTimelines] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5050/timelines")
      .then((res) => setTimelines(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this timeline?")) {
      await axios.delete(`http://localhost:5050/timelines/${id}`);
      setTimelines(timelines.filter(t => t._id !== id));
    }
  };

  return (
    <div className="container mt-4">
      <h2>Timeline Records</h2>
      <a href="/add-timeline" className="btn btn-primary mb-3">Add Timeline</a>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Date</th>
            <th>Workers</th>
            <th>Engineers</th>
            <th>Architects</th>
            <th>Expenses</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {timelines.map(t => (
            <tr key={t._id}>
              <td>{new Date(t.date).toLocaleDateString()}</td>
              <td>{t.workerCount}</td>
              <td>{t.tengineerCount}</td>
              <td>{t.architectCount}</td>
              <td>{t.texpenses?.length || 0}</td>
              <td>{t.tnotes}</td>
              <td>
                <a href={`/update-timeline/${t._id}`} className="btn btn-warning btn-sm me-2">Edit</a>
                <button onClick={() => handleDelete(t._id)} className="btn btn-danger btn-sm">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
