import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function AddSkillPage() {
  const [formData, setFormData] = useState({
    languageName: "",
    languageDescription: "",
    languageImageName: "",
    compsciName: "",
    compsciDescription: "",
    compsciImageName: "",
    jobCompany: "",
    jobRoles: "",
    jobTimeWorked: "",
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

    const hasLanguageData =
      formData.languageName.trim() ||
      formData.languageDescription.trim() ||
      formData.languageImageName.trim();
    const hasSkillData =
      formData.compsciName.trim() ||
      formData.compsciDescription.trim() ||
      formData.compsciImageName.trim();
    const hasJobData =
      formData.jobCompany.trim() ||
      formData.jobRoles.trim() ||
      formData.jobTimeWorked.trim();

    if (!hasLanguageData && !hasSkillData && !hasJobData) {
      setStatusMessage("Nothing submitted.");
      return;
    }

    const errors = [];
    const submitted = [];

    if (hasLanguageData) {
      const { error } = await supabase.from("languages").insert([
        {
          name: formData.languageName,
          description: formData.languageDescription,
          "image-name": formData.languageImageName,
        },
      ]);

      if (error) {
        errors.push(`languages: ${error.message}`);
      } else {
        submitted.push("languages");
      }
    }

    if (hasSkillData) {
      const { error } = await supabase.from("skills").insert([
        {
          name: formData.compsciName,
          description: formData.compsciDescription,
          "image-name": formData.compsciImageName,
        },
      ]);

      if (error) {
        errors.push(`skills: ${error.message}`);
      } else {
        submitted.push("skills");
      }
    }

    if (hasJobData) {
      const { error } = await supabase.from("jobs").insert([
        {
          company: formData.jobCompany,
          roles: formData.jobRoles,
          time_worked: formData.jobTimeWorked,
        },
      ]);

      if (error) {
        errors.push(`jobs: ${error.message}`);
      } else {
        submitted.push("jobs");
      }
    }

    if (errors.length > 0) {
      setStatusMessage(`Submit finished with errors: ${errors.join(" | ")}`);
      return;
    }

    setStatusMessage(`Submitted successfully: ${submitted.join(", ")}.    Remember to add images manually for the portfolio.`);
    setFormData({
      languageName: "",
      languageDescription: "",
      languageImageName: "",
      compsciName: "",
      compsciDescription: "",
      compsciImageName: "",
      jobCompany: "",
      jobRoles: "",
      jobTimeWorked: "",
    });
  };

  return (
    <main className="page">
      <h1>Add Skill</h1>
      <p>Select a category and add your skills.</p>
      <form onSubmit={handleSubmit}>
        <div className="skill-type">
          <h2>Add Language</h2>
          <input
            type="text"
            name="languageName"
            placeholder="Name"
            value={formData.languageName}
            onChange={handleChange}
          />
          <textarea
            name="languageDescription"
            placeholder="Description"
            value={formData.languageDescription}
            onChange={handleChange}
          />
          <input
            type="text"
            name="languageImageName"
            placeholder="Image Name"
            value={formData.languageImageName}
            onChange={handleChange}
          />
        </div>
        <div className="skill-type">
          <h2>Add CompSci Skill</h2>
          <input
            type="text"
            name="compsciName"
            placeholder="Name"
            value={formData.compsciName}
            onChange={handleChange}
          />
          <textarea
            name="compsciDescription"
            placeholder="Description"
            value={formData.compsciDescription}
            onChange={handleChange}
          />
          <input
            type="text"
            name="compsciImageName"
            placeholder="Image Name"
            value={formData.compsciImageName}
            onChange={handleChange}
          />
        </div>
        <div className="skill-type">
          <h2>Add Job</h2>
          <input
            type="text"
            name="jobCompany"
            placeholder="Company"
            value={formData.jobCompany}
            onChange={handleChange}
          />
          <textarea
            name="jobRoles"
            placeholder="Roles"
            value={formData.jobRoles}
            onChange={handleChange}
          />
          <input
            type="text"
            name="jobTimeWorked"
            placeholder="Time Worked"
            value={formData.jobTimeWorked}
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

export default AddSkillPage;
