import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AddTimeline() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    date: "",
    tworker: [],
    tengineer: [],
    tarchitect: [],
    tprojectManager: [],
    texpenses: [],
    tmaterials: [],
    ttools: [],
    tnotes: ""
  });

  const addField = (key, newObj) => {
    setForm({ ...form, [key]: [...form[key], newObj] });
  };

  const updateField = (key, index, field, value) => {
    const updated = [...form[key]];
    updated[index][field] = value;
    setForm({ ...form, [key]: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // auto counts
    form.workerCount = form.tworker.length;
    form.tengineerCount = form.tengineer.length;
    form.architectCount = form.tarchitect.length;

    await axios.post("http://localhost:5050/timelines", form);
    navigate("/timelines");
  };

  return (
    <div className="container mt-4">
      <h2>Add Timeline</h2>
      <form onSubmit={handleSubmit}>
        {/* Date */}
        <div className="mb-3">
          <label>Date</label>
          <input type="date" className="form-control" onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        </div>

        {/* Workers */}
        <h5>Workers</h5>
        {form.tworker.map((w, i) => (
          <div key={i} className="row mb-2">
            <div className="col"><input placeholder="Name" className="form-control" onChange={(e) => updateField("tworker", i, "name", e.target.value)} /></div>
            <div className="col"><input placeholder="Role" className="form-control" onChange={(e) => updateField("tworker", i, "role", e.target.value)} /></div>
            <div className="col"><input placeholder="Hours" type="number" className="form-control" onChange={(e) => updateField("tworker", i, "hoursWorked", e.target.value)} /></div>
          </div>
        ))}
        <button type="button" className="btn btn-sm btn-secondary mb-3" onClick={() => addField("tworker", { name: "", role: "", hoursWorked: 0 })}>+ Worker</button>

        {/* Engineers */}
        <h5>Engineers</h5>
        {form.tengineer.map((en, i) => (
          <div key={i} className="row mb-2">
            <div className="col"><input placeholder="Name" className="form-control" onChange={(e) => updateField("tengineer", i, "name", e.target.value)} /></div>
            <div className="col"><input placeholder="Specialty" className="form-control" onChange={(e) => updateField("tengineer", i, "specialty", e.target.value)} /></div>
            <div className="col"><input placeholder="Hours" type="number" className="form-control" onChange={(e) => updateField("tengineer", i, "hoursWorked", e.target.value)} /></div>
          </div>
        ))}
        <button type="button" className="btn btn-sm btn-secondary mb-3" onClick={() => addField("tengineer", { name: "", specialty: "", hoursWorked: 0 })}>+ Engineer</button>

        {/* Architects */}
        <h5>Architects</h5>
        {form.tarchitect.map((a, i) => (
          <div key={i} className="row mb-2">
            <div className="col"><input placeholder="Name" className="form-control" onChange={(e) => updateField("tarchitect", i, "name", e.target.value)} /></div>
            <div className="col"><input placeholder="Specialty" className="form-control" onChange={(e) => updateField("tarchitect", i, "specialty", e.target.value)} /></div>
            <div className="col"><input placeholder="Hours" type="number" className="form-control" onChange={(e) => updateField("tarchitect", i, "hoursWorked", e.target.value)} /></div>
          </div>
        ))}
        <button type="button" className="btn btn-sm btn-secondary mb-3" onClick={() => addField("tarchitect", { name: "", specialty: "", hoursWorked: 0 })}>+ Architect</button>

        {/* Project Manager */}
        <h5>Project Manager</h5>
        {form.tprojectManager.map((pm, i) => (
          <div key={i} className="row mb-2">
            <div className="col"><input placeholder="Name" className="form-control" onChange={(e) => updateField("tprojectManager", i, "name", e.target.value)} /></div>
            <div className="col"><input placeholder="Contact" className="form-control" onChange={(e) => updateField("tprojectManager", i, "contact", e.target.value)} /></div>
          </div>
        ))}
        <button type="button" className="btn btn-sm btn-secondary mb-3" onClick={() => addField("tprojectManager", { name: "", contact: "" })}>+ Manager</button>

        {/* Expenses */}
        <h5>Expenses</h5>
        {form.texpenses.map((ex, i) => (
          <div key={i} className="row mb-2">
            <div className="col"><input placeholder="Description" className="form-control" onChange={(e) => updateField("texpenses", i, "description", e.target.value)} /></div>
            <div className="col"><input placeholder="Amount" type="number" className="form-control" onChange={(e) => updateField("texpenses", i, "amount", e.target.value)} /></div>
            <div className="col"><input placeholder="Date" type="date" className="form-control" onChange={(e) => updateField("texpenses", i, "date", e.target.value)} /></div>
          </div>
        ))}
        <button type="button" className="btn btn-sm btn-secondary mb-3" onClick={() => addField("texpenses", { description: "", amount: 0, date: "" })}>+ Expense</button>

        {/* Materials */}
        <h5>Materials</h5>
        {form.tmaterials.map((m, i) => (
          <div key={i} className="row mb-2">
            <div className="col"><input placeholder="Name" className="form-control" onChange={(e) => updateField("tmaterials", i, "name", e.target.value)} /></div>
            <div className="col"><input placeholder="Quantity" type="number" className="form-control" onChange={(e) => updateField("tmaterials", i, "quantity", e.target.value)} /></div>
            <div className="col"><input placeholder="Unit" className="form-control" onChange={(e) => updateField("tmaterials", i, "unit", e.target.value)} /></div>
            <div className="col"><input placeholder="Cost" type="number" className="form-control" onChange={(e) => updateField("tmaterials", i, "cost", e.target.value)} /></div>
          </div>
        ))}
        <button type="button" className="btn btn-sm btn-secondary mb-3" onClick={() => addField("tmaterials", { name: "", quantity: 0, unit: "", cost: 0 })}>+ Material</button>

        {/* Tools */}
        <h5>Tools</h5>
        {form.ttools.map((tool, i) => (
          <div key={i} className="row mb-2">
            <div className="col"><input placeholder="Name" className="form-control" onChange={(e) => updateField("ttools", i, "name", e.target.value)} /></div>
            <div className="col"><input placeholder="Quantity" type="number" className="form-control" onChange={(e) => updateField("ttools", i, "quantity", e.target.value)} /></div>
            <div className="col"><input placeholder="Status" className="form-control" onChange={(e) => updateField("ttools", i, "status", e.target.value)} /></div>
          </div>
        ))}
        <button type="button" className="btn btn-sm btn-secondary mb-3" onClick={() => addField("ttools", { name: "", quantity: 0, status: "" })}>+ Tool</button>

        {/* Notes */}
        <div className="mb-3">
          <label>Notes</label>
          <textarea className="form-control" onChange={(e) => setForm({ ...form, tnotes: e.target.value })}></textarea>
        </div>

        <button type="submit" className="btn btn-success">Save Timeline</button>
      </form>
    </div>
  );
}
