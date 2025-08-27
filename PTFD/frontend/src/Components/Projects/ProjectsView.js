import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProjectsView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5050/projects/${id}`)
      .then((res) => setProject(res.data.project || res.data))
      .catch(() => setProject(null));
  }, [id]);

  if (project === null) {
    return (
      <div className="container mt-5 text-center">
        <h3>Project not found or failed to load.</h3>
        <button className="btn btn-secondary mt-3" onClick={() => navigate("/projects")}>
          ← Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="card shadow">
            <div className="card-header bg-primary text-light">
              <h2 className="mb-0">🏗️ Project Details</h2>
            </div>
            <div className="card-body">
              {/* Project Image */}
              <div className="mb-4 text-center">
                <img
                  src={project.pimg || "https://via.placeholder.com/800x300?text=Project+Image"}
                  alt="Project"
                  className="img-fluid rounded"
                  style={{ maxHeight: "300px", objectFit: "cover" }}
                />
              </div>
              {/* Project Name & Code */}
              <h3 className="mb-2 text-primary">{project.pname}</h3>
              <div className="mb-3">
                <span className="badge bg-info me-2">{project.pcode}</span>
                <span className="badge bg-secondary">{project.ptype}</span>
              </div>
              {/* Owner Info */}
              <div className="mb-3">
                <strong>Owner:</strong> {project.pownername} ({project.pownerid})<br />
                <strong>Contact:</strong> {project.potelnumber}
              </div>
              {/* Location */}
              <div className="mb-3">
                <strong>Location:</strong> {project.plocation}
              </div>
              {/* Status, Priority, Budget */}
              <div className="mb-3">
                <strong>Status:</strong>{" "}
                <span className={`badge ${project.pstatus === "Completed" ? "bg-success" : "bg-warning text-dark"}`}>
                  {project.pstatus}
                </span>
                {"  "}
                <strong className="ms-3">Priority:</strong>{" "}
                <span className={`badge ${project.ppriority === "High" ? "bg-danger" : project.ppriority === "Medium" ? "bg-warning text-dark" : "bg-secondary"}`}>
                  {project.ppriority}
                </span>
                {"  "}
                <strong className="ms-3">Budget:</strong> ${project.pbudget}
              </div>
              {/* Dates */}
              <div className="mb-3">
                <strong>Created:</strong> {project.pcreatedat ? new Date(project.pcreatedat).toLocaleDateString() : "-"}
                {"  "}
                <strong className="ms-3">End Date:</strong> {project.penddate ? new Date(project.penddate).toLocaleDateString() : "-"}
                {"  "}
                <strong className="ms-3">Updated:</strong> {project.pupdatedat ? new Date(project.pupdatedat).toLocaleDateString() : "-"}
              </div>
              {/* Description */}
              <div className="mb-4">
                <strong>Description:</strong>
                <div className="border rounded p-2 bg-light">{project.pdescription || <span className="text-muted">No description.</span>}</div>
              </div>
              {/* Issues */}
              <div className="mb-4">
                <strong>Issues:</strong>
                <div className="border rounded p-2 bg-light">{project.pissues || <span className="text-muted">No issues reported.</span>}</div>
              </div>
              {/* Observations */}
              <div className="mb-4">
                <strong>Observations:</strong>
                <div className="border rounded p-2 bg-light">{project.pobservations || <span className="text-muted">No observations.</span>}</div>
              </div>
              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate("/projects")}
                >
                  ← Back to Projects
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}