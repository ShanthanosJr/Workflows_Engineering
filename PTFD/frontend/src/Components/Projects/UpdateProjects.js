import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function UpdateProjects() {
  const [project, setProject] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await axios.get(`http://localhost:5050/projects/${id}`);
        // ✅ handle both cases (wrapped or plain project)
        setProject(res.data.project || res.data);
      } catch (err) {
        console.error("Error fetching project:", err);
      }
    }
    fetchProject();
  }, [id]);
  

  const sendRequest = async () => {
    try {
      await axios.put(`http://localhost:5050/projects/${id}`, {
        pname: project.pname,
        pcode: project.pcode,
        pownerid: project.pownerid,
        pownername: project.pownername,
        pdescription: project.pdescription,
        pbudget: Number(project.pbudget),
        pstatus: project.pstatus,
        penddate: project.penddate,
        // let backend set pupdatedat, don’t send createdAt
      });
    } catch (err) {
      console.error("Error updating project:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Updating project:", project);
    await sendRequest();
    navigate("/projects");
  };

  return (
    <div className="container mt-4">
      <h2>Update Project</h2>

      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Project Name</label>
          <input
            className="form-control"
            type="text"
            name="pname"
            value={project.pname || ""}
            onChange={(e) => setProject({ ...project, pname: e.target.value })}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Project Code</label>
          <input
            className="form-control"
            type="text"
            name="pcode"
            value={project.pcode || ""}
            onChange={(e) => setProject({ ...project, pcode: e.target.value })}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Owner ID</label>
          <input
            className="form-control"
            type="text"
            name="pownerid"
            value={project.pownerid || ""}
            onChange={(e) =>
              setProject({ ...project, pownerid: e.target.value })
            }
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Owner Name</label>
          <input
            className="form-control"
            type="text"
            name="pownername"
            value={project.pownername || ""}
            onChange={(e) =>
              setProject({ ...project, pownername: e.target.value })
            }
            required
          />
        </div>

        <div className="col-12">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            name="pdescription"
            value={project.pdescription || ""}
            onChange={(e) =>
              setProject({ ...project, pdescription: e.target.value })
            }
            required
          ></textarea>
        </div>

        <div className="col-md-4">
          <label className="form-label">Budget</label>
          <input
            className="form-control"
            type="number"
            name="pbudget"
            value={project.pbudget || ""}
            onChange={(e) =>
              setProject({ ...project, pbudget: e.target.value })
            }
            required
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            name="pstatus"
            value={project.pstatus || ""}
            onChange={(e) =>
              setProject({ ...project, pstatus: e.target.value })
            }
            required
          >
            <option value="">Choose...</option>
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label">End Date</label>
          <input
            className="form-control"
            type="date"
            name="penddate"
            value={
              project.penddate
                ? new Date(project.penddate).toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              setProject({ ...project, penddate: e.target.value })
            }
            required
          />
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-primary">
            Update Project
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdateProjects;
