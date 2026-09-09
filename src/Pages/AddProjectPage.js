import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function AddProjectPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    linkLabel: "",
    linkUrl: "",
  });
  const [statusMessage, setStatusMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!supabase) {
      setStatusMessage(
        "Missing Supabase env vars. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY."
      );
      return;
    }

    const hasProjectData =
      formData.name.trim() ||
      formData.description.trim() ||
      formData.linkLabel.trim() ||
      formData.linkUrl.trim();

    if (!hasProjectData) {
      setStatusMessage("Nothing submitted.");
      return;
    }

    const { error } = await supabase.from("projects").insert([
      {
        name: formData.name,
        description: formData.description,
        link_label: formData.linkLabel,
        link_url: formData.linkUrl,
      },
    ]);

    if (error) {
      setStatusMessage(`Submit finished with errors: projects: ${error.message}`);
      return;
    }

    setStatusMessage("Submitted successfully. Remember to add images/videos manually for the portfolio.");
    setFormData({
      name: "",
      description: "",
      linkLabel: "",
      linkUrl: "",
    });
  };

  return (
    <main className="page">
      <h1>Add Project</h1>
      <p>Add a project to your portfolio database.</p>
      <form onSubmit={handleSubmit}>
        <div className="skill-type">
          <h2>Project Details</h2>
          <input
            type="text"
            name="name"
            placeholder="Project Name"
            value={formData.name}
            onChange={handleChange}
          />
          <textarea
            name="description"
            placeholder="Project Description"
            value={formData.description}
            onChange={handleChange}
          />
          <input
            type="text"
            name="linkLabel"
            placeholder="Link Label"
            value={formData.linkLabel}
            onChange={handleChange}
          />
          <input
            type="text"
            name="linkUrl"
            placeholder="Link URL"
            value={formData.linkUrl}
            onChange={handleChange}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            marginTop: "1rem",
          }}
        >
          <button className="back-link" type="submit">
            Submit
          </button>
          <Link className="back-link" to="/">
            Back to Home
          </Link>
        </div>
      </form>
      {statusMessage && <p>{statusMessage}</p>}
    </main>
  );
}

export default AddProjectPage;
