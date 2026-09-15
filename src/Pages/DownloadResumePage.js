import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import html2pdf from "html2pdf.js";
import { supabase } from "../lib/supabaseClient";

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

function DownloadResumePage() {
  const [jobs, setJobs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const resumeRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadResumeData = async () => {
      if (!supabase) {
        if (isMounted) {
          setErrorMessage(
            "Missing Supabase env vars. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY."
          );
          setIsLoading(false);
        }
        return;
      }

      const [jobsResult, projectsResult] = await Promise.all([
        supabase
          .from("jobs")
          .select('"jobId", company, roles, time_worked')
          .order("jobId", { ascending: true }),
        supabase
          .from("projects")
          .select("id, name, description, link_url, link_label")
          .order("id", { ascending: true }),
      ]);

      if (!isMounted) {
        return;
      }

      const loadErrors = [];

      if (jobsResult.error) {
        loadErrors.push(`jobs: ${jobsResult.error.message}`);
      } else {
        setJobs(jobsResult.data ?? []);
      }

      if (projectsResult.error) {
        loadErrors.push(`projects: ${projectsResult.error.message}`);
      } else {
        setProjects(projectsResult.data ?? []);
      }

      if (loadErrors.length > 0) {
        setErrorMessage(`Could not load resume data: ${loadErrors.join("; ")}`);
      }

      setIsLoading(false);
    };

    loadResumeData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Process jobs pulled from Supabase.
  const sortedJobs = jobs.slice().sort((a, b) => b.jobId - a.jobId);
  const allJobsHtml = sortedJobs
    .map((job) => {
      const companyName = escapeHtml(job.company);
      const timeWorked = escapeHtml(job.time_worked);
      const jobDescription = escapeHtml(job.roles);

      return `
        <div class="job">
          <div class="job-top">
            <div class="job-left">
              <div class="job-company">${companyName}</div>
            </div>
            <div class="job-date">${timeWorked}</div>
          </div>
          <div class="job-desc">${jobDescription}</div>
        </div>
      `;
    })
    .join("");

  // Process projects pulled from Supabase.
  const sortedProjects = projects.slice().sort((a, b) => b.id - a.id);
  const allProjectsHtml = sortedProjects
    .map((project) => {
      const projectName = escapeHtml(project.name);
      const projectDescription = escapeHtml(project.description);

      return `
        <div class="project">
          <div class="project-name">${projectName}</div>
          <div class="project-desc">${projectDescription}</div>
        </div>
      `;
    })
    .join("");

  const hasGeneratedHtml = Boolean(allJobsHtml || allProjectsHtml);

  const handleDownloadResume = async () => {
    const fileName = "Edward-Zilbert-Resume.pdf";

    if (!resumeRef.current) {
      setErrorMessage("The resume preview is not ready yet.");
      return;
    }

    setIsGeneratingPdf(true);
    setErrorMessage("");

    try {
      const pdf = html2pdf()
        .set({
          margin: 0,
          filename: fileName,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
          },
          jsPDF: {
            unit: "mm",
            format: "letter",
            orientation: "portrait",
          },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(resumeRef.current);

      if (Capacitor.isNativePlatform()) {
        const dataUri = await pdf.outputPdf("datauristring");
        const base64Data = dataUri.split(",")[1];

        if (!base64Data) {
          throw new Error("The generated PDF could not be converted for Android.");
        }

        await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Documents,
          recursive: true,
        });

        const { uri } = await Filesystem.getUri({
          path: fileName,
          directory: Directory.Documents,
        });

        await Share.share({
          title: "Edward Zilbert Resume",
          text: "Edward Zilbert Resume",
          url: uri,
          dialogTitle: "Save or share resume",
        });
      } else {
        await pdf.save();
      }
    } catch (error) {
      setErrorMessage(`Could not generate PDF: ${error.message}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <main className="page resume-page">
      <h1>Download Resume</h1>
      <p>
        {isLoading
          ? "Loading resume data..."
          : `${jobs.length} job${jobs.length === 1 ? "" : "s"} and ${projects.length} project${projects.length === 1 ? "" : "s"} loaded.${hasGeneratedHtml ? " Resume HTML is ready." : ""}`}
      </p>

      {!isLoading && (
        <div className="resume-data-sections">
          <section className="resume-data-section" aria-labelledby="jobs-heading">
            <h2 id="jobs-heading" className="resume-section-heading">
              Work Experience
            </h2>

            {jobs.length === 0 ? (
              <p>No jobs were found.</p>
            ) : (
              <div className="project-list">
                {jobs.map((job) => (
                  <article className="project-card" key={job.jobId}>
                    <div className="record-heading">
                      <h3>{job.company}</h3>
                      {job.time_worked && <span>{job.time_worked}</span>}
                    </div>
                    {job.roles && (
                      <details className="project-description">
                        <summary>Roles</summary>
                        <p>{job.roles}</p>
                      </details>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="resume-data-section" aria-labelledby="projects-heading">
            <h2 id="projects-heading" className="resume-section-heading">
              Projects
            </h2>

            {projects.length === 0 ? (
              <p>No projects were found.</p>
            ) : (
              <div className="project-list">
                {projects.map((project) => (
                  <article className="project-card" key={project.id}>
                    <h3>{project.name}</h3>
                    {project.description && (
                      <details className="project-description">
                        <summary>Description</summary>
                        <p>{project.description}</p>
                      </details>
                    )}
                    {project.link_url && (
                      <a
                        href={project.link_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {project.link_label || "View Project"}
                      </a>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {!isLoading && (
        <section className="resume-preview-section" aria-labelledby="preview-heading">
          <h2 id="preview-heading" className="resume-section-heading">
            PDF Preview
          </h2>

          <div className="resume-preview-scroller">
            <div className="resume-document" ref={resumeRef}>
              <header>
                <h1 className="name">Edward Zilbert</h1>
                <div className="contact-line">
                  (847) 533-7331 &middot; zilbertedward@gmail.com
                </div>
                <div className="contact-line">
                  300 South Parkway, Prospect Heights, IL 60070
                </div>
                <div className="contact-line">/edwardzilbert.vercel.app</div>
              </header>

              <div className="summary-box">
                <div className="summary-title">
                  COMPUTER SCIENCE STUDENT AT NIU
                </div>
                <div className="summary-text">
                  Focusing on software development and AI technology. Eager to
                  apply my skills in a real world setting.
                </div>
              </div>

              <h2 className="section-heading">Experience</h2>
              <div dangerouslySetInnerHTML={{ __html: allJobsHtml }} />

              <div className="page-break" />

              <h2 className="section-heading centered">Software Projects</h2>
              <div className="section-subheading">
                See more on /edwardzilbert.vercel.app
              </div>
              <div dangerouslySetInnerHTML={{ __html: allProjectsHtml }} />

              <div className="columns">
                <div className="column">
                  <div className="col-heading">EDUCATION</div>

                  <div className="col-item">
                    <div className="col-item-title">
                      Northern Illinois University
                    </div>
                    <div className="col-item-sub">Computer Science</div>
                  </div>
                  <div className="col-item">
                    <div className="col-item-title">Harper College</div>
                    <div className="col-item-sub">Computer Science</div>
                  </div>
                  <div className="col-item">
                    <div className="col-item-title">
                      John Hersey High School
                    </div>
                  </div>
                </div>

                <div className="column">
                  <div className="col-heading">Extracurriculars</div>

                  <div className="col-item">
                    <div className="col-item-title">
                      Black Belt in TaeKwonDo
                    </div>
                    <div className="col-item-sub" />
                  </div>

                  <div className="col-item">
                    <div className="col-item-title">
                      Band and Marching Band
                    </div>
                    <div className="col-item-sub">
                      John Hersey High School
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="button-row">
        <button
          className="nav-button"
          type="button"
          onClick={handleDownloadResume}
          disabled={isLoading || isGeneratingPdf}
        >
          {isGeneratingPdf ? "Creating PDF..." : "Download New Resume"}
        </button>
      </div>

      <div className="button-row">
        <Link className="back-link" to="/">
          Back to Home
        </Link>
      </div>

      {errorMessage && <p>{errorMessage}</p>}
    </main>
  );
}

export default DownloadResumePage;
