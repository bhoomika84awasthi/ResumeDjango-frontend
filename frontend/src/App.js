import React, { useState } from 'react';
import './App.css';
import Login from './Login';
import ResumeUpload from './ResumeUpload';
import JobForm from './JobForm';
import AnalysisResult from './AnalysisResult';
import { AuthProvider } from './AuthContext';
import { API_ENDPOINTS, getAuthHeaders } from './api';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const selectedResumeData = resumes.find(resume => resume.id === selectedResume) || null;
  const selectedJobData = jobs.find(job => job.id === selectedJob) || null;

  const renderResumeMeta = (resume) => {
    const contactInfo = resume.contact_info || {};
    const skills = resume.skills || [];
    const education = resume.education || [];
    const experience = resume.experience || [];

    return (
      <div className="resume-details">
        <p><strong>Name:</strong> {resume.name || 'Not available'}</p>
        <p><strong>File:</strong> {resume.file_name}</p>
        <p><strong>Email:</strong> {contactInfo.email || 'N/A'}</p>
        <p><strong>Phone:</strong> {contactInfo.phone || 'N/A'}</p>
        <p><strong>LinkedIn:</strong> {contactInfo.linkedin ? `linkedin.com/in/${contactInfo.linkedin}` : 'N/A'}</p>
        <p><strong>GitHub:</strong> {contactInfo.github ? `github.com/${contactInfo.github}` : 'N/A'}</p>
        <p><strong>Skills:</strong> {skills.length ? skills.join(', ') : 'No skills extracted'}</p>
        <p><strong>Education:</strong> {education.length ? education.join(' | ') : 'No education found'}</p>
        <p><strong>Experience:</strong> {experience.length ? experience.join(' | ') : 'No experience found'}</p>
      </div>
    );
  };

  const renderJobMeta = (job) => {
    const descriptionText = job.description || 'No description provided';
    return (
      <div className="job-details">
        <p><strong>Title:</strong> {job.title}</p>
        <p><strong>Required Skills:</strong> {job.required_skills?.length ? job.required_skills.join(', ') : 'No skills detected'}</p>
        <p><strong>Description:</strong></p>
        <div className="job-description-preview">{descriptionText}</div>
      </div>
    );
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    loadData();
  };

  const loadData = async () => {
    try {
      const currentToken = localStorage.getItem('token');
      const [resumesData, jobsData] = await Promise.all([
        fetch(API_ENDPOINTS.RESUMES, {
          headers: getAuthHeaders(currentToken),
        }).then(r => r.json()),
        fetch(API_ENDPOINTS.JOBS, {
          headers: getAuthHeaders(currentToken),
        }).then(r => r.json()),
      ]);

      setResumes(resumesData.results || resumesData);
      setJobs(jobsData.results || jobsData);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setResumes([]);
    setJobs([]);
  };

  const handleResumeUpload = (resume) => {
    setResumes([resume, ...resumes]);
    setSelectedResume(resume.id);
  };

  const handleJobAdded = (job) => {
    setJobs([job, ...jobs]);
    setSelectedJob(job.id);
  };

  const handleAnalysisComplete = () => {
    setShowAnalysis(true);
  };

  const handleRunNewAnalysis = () => {
    setShowAnalysis(false);
    setSelectedResume(selectedResume);
    setSelectedJob(selectedJob);
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>ATS Resume Analyzer</h1>
        <div className="header-actions">
          <span className="username">{localStorage.getItem('username')}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="app-main">
        <div className="main-container">
          <div className="left-panel">
            <ResumeUpload onUploadSuccess={handleResumeUpload} />
            
            <div className="resumes-list">
              <h3>Your Resumes</h3>
              {resumes.length > 0 ? (
                resumes.map(resume => (
                  <div
                    key={resume.id}
                    className={`resume-item ${selectedResume === resume.id ? 'selected' : ''}`}
                    onClick={() => setSelectedResume(resume.id)}
                  >
                    <p className="resume-name">{resume.name || resume.file_name}</p>
                    <p className="resume-skills">Skills: {resume.skills?.length || 0}</p>
                    {selectedResume === resume.id && renderResumeMeta(resume)}
                  </div>
                ))
              ) : (
                <p className="no-items">No resumes uploaded yet</p>
              )}
            </div>

            {selectedResumeData && (
              <div className="selected-resume-panel">
                <h3>Selected Resume Details</h3>
                {renderResumeMeta(selectedResumeData)}
              </div>
            )}
          </div>

          <div className="right-panel">
            <JobForm onJobAdded={handleJobAdded} />

            <div className="jobs-list">
              <h3>Job Descriptions</h3>
              {jobs.length > 0 ? (
                jobs.map(job => (
                  <div
                    key={job.id}
                    className={`job-item ${selectedJob === job.id ? 'selected' : ''}`}
                    onClick={() => setSelectedJob(job.id)}
                  >
                    <p className="job-title">{job.title}</p>
                    <p className="job-skills">Skills: {job.required_skills?.length || 0}</p>
                    {selectedJob === job.id && renderJobMeta(job)}
                  </div>
                ))
              ) : (
                <p className="no-items">No job descriptions added yet</p>
              )}
            </div>

            {selectedJobData && (
              <div className="selected-job-panel">
                <h3>Selected Job Details</h3>
                {renderJobMeta(selectedJobData)}
              </div>
            )}

            {selectedResume && selectedJob && (
              <AnalysisResult
                resumeId={selectedResume}
                jobId={selectedJob}
                resume={selectedResumeData}
                job={selectedJobData}
                onAnalysisComplete={handleAnalysisComplete}
              />
            )}

            {showAnalysis && selectedResume && selectedJob && (
              <button
                className="new-analysis-btn"
                onClick={handleRunNewAnalysis}
              >
                Run New Analysis
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
