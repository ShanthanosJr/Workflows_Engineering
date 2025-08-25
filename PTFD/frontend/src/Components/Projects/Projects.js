import React from "react";

export default function Projects({ project }) {
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
      </div>
    </div>
  );
}
