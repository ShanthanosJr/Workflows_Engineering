import React, { useState } from "react";
import axios from "axios";
import Nav from "../Nav/Nav";

export default function AddProjects() {
  const [formData, setFormData] = useState({
    pname: "",
    pcode: "",
    pownerid: "",
    pownername: "",
    pdescription: "",
    pbudget: "",
    pstatus: "",
    penddate: "",
  });

  const [message, setMessage] = useState("");

  // handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/projects", formData);
      setMessage("✅ Project added successfully!");
      console.log("Project created:", res.data);
      setFormData({
        pname: "",
        pcode: "",
        pownerid: "",
        pownername: "",
        pdescription: "",
        pbudget: "",
        pstatus: "",
        penddate: "",
      });
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to add project.");
    }
  };

  return (
    <div>
      <Nav />
      <div className="container mt-4">
        <h2>Add New Project</h2>

        {message && <div className="alert alert-info">{message}</div>}

        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Project Name</label>
            <input
              type="text"
              name="pname"
              className="form-control"
              value={formData.pname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Project Code</label>
            <input
              type="text"
              name="pcode"
              className="form-control"
              value={formData.pcode}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Owner ID</label>
            <input
              type="text"
              name="pownerid"
              className="form-control"
              value={formData.pownerid}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Owner Name</label>
            <input
              type="text"
              name="pownername"
              className="form-control"
              value={formData.pownername}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label">Description</label>
            <textarea
              name="pdescription"
              className="form-control"
              rows="3"
              value={formData.pdescription}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Budget</label>
            <input
              type="number"
              name="pbudget"
              className="form-control"
              value={formData.pbudget}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Status</label>
            <select
              name="pstatus"
              className="form-select"
              value={formData.pstatus}
              onChange={handleChange}
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
              type="date"
              name="penddate"
              className="form-control"
              value={formData.penddate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12">
            <button type="submit" className="btn btn-primary">
              Add Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}