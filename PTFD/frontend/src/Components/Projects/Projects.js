import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";


export default function Projects({ project, onDelete }) {



  if (!project) {
    return (
      <div className="card-body">
        <h5 className="card-title">No project data</h5>
        <p className="card-text text-muted">
          This card requires a “project” prop.
        </p>
      </div>
    );
  }

  const {
    _id,
    pname,
    pcode,
    pownerid,
    pownername,
    pdescription,
    pcreatedat,
    pupdatedat,
    pbudget,
    pstatus,
    penddate,
  } = project;



  const handleDelete = async () => {
        // ✅ ask before deleting
        const confirmDelete = window.confirm(
          `Are you sure you want to delete project "${pname}"?`
        );
        if (!confirmDelete) return; // user canceled

    try {
      await axios.delete(`http://localhost:5000/projects/${_id}`);
      if (onDelete) onDelete(_id); // ✅ remove from parent state
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  }

  return (
    <div>
      <h1>Projects</h1>
      <div className="card-body">
        <h5 className="card-title">{pname}</h5>
        <p className="card-text">Project Code: {pcode}</p>
        <p className="card-text">Owner ID: {pownerid}</p>
        <p className="card-text">Owner Name: {pownername}</p>
        <p className="card-text">Description: {pdescription}</p>
        <p className="card-text">Created At: {new Date(pcreatedat).toLocaleDateString()}</p>
        <p className="card-text">Updated At: {new Date(pupdatedat).toLocaleDateString()}</p>
        <p className="card-text">Budget: ${pbudget}</p>
        <p className="card-text">Status: {pstatus}</p>
        <p className="card-text">End Date: {new Date(penddate).toLocaleDateString()}</p>
        {/* 👇 Action Buttons */}
        <div className="mt-3">
          <Link to={`/projects/${_id}`} className="btn btn-warning me-2">
            Edit
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
