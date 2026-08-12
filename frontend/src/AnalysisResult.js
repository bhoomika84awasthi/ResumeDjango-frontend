import React, { useState, useMemo, useContext } from 'react';
import './AnalysisResult.css';
import { API_ENDPOINTS, getAuthHeaders } from './api';
import { AuthContext } from './AuthContext';
import {
  getScoreBand,
  calculateSkillBreakdown,
  buildResumeStrengths,
  buildKeywordFrequency,
  analyzeExperienceMatch,
  analyzeEducationMatch,
  buildResumeQualityChecklist,
  buildAnalysisSummary,
  buildFallbackSuggestions,
} from './analysisUtils';

function AnalysisResult({ resumeId, jobId, resume, job, onAnalysisComplete }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);

  const handleAnalyze = async () => {
    if (!resumeId || !jobId) {
      setError('Please select both a resume and a job description before running the ATS analysis.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.ANALYZE, {
        method: 'POST',
        headers: getAuthHeaders(token, {
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          resume_id: resumeId,
          job_id: jobId,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setAnalysis(data);
        if (onAnalysisComplete) onAnalysisComplete(data);
      } else {
        setError(data?.error || 'Unable to analyze the resume right now. Please try again.');
      }
    } catch (err) {
      setError('Unable to analyze the resume right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!analysis) return;

    const score = Math.round(Number(analysis.match_score || 0));
    const matchedSkills = analysis.matched_skills || [];
    const missingSkills = analysis.missing_skills || [];
    const summary = buildAnalysisSummary(score, matchedSkills, missingSkills);
    const suggestions = Array.isArray(analysis.suggestions) ? analysis.suggestions : buildFallbackSuggestions(missingSkills, matchedSkills);

    const content = [
      'ATS Resume Analysis Report',
      '========================',
      `Candidate: ${resume?.name || resume?.file_name || 'Not available'}`,
      `Overall Match Score: ${score}%`,
      `Summary: ${summary}`,
      '',
      'Matched Skills:',
      ...(matchedSkills.length ? matchedSkills.map((skill) => `- ${skill}`) : ['- None detected']),
      '',
      'Missing Skills:',
      ...(missingSkills.length ? missingSkills.map((skill) => `- ${skill}`) : ['- None detected']),
      '',
      'Skill Breakdown:',
      ...(skillBreakdown.length ? skillBreakdown.map((item) => `- ${item.name}: ${item.percent}% (${item.matched}/${item.total})`) : ['- Not available']),
      '',
      'ATS Keywords:',
      ...(matchedKeywords.length ? matchedKeywords.map((keyword) => `- ${keyword}`) : ['- None detected']),
      '',
      'Experience Match:',
      `Required: ${experienceMatch.required}`,
      `Candidate: ${experienceMatch.candidate}`,
      `Status: ${experienceMatch.status}`,
      '',
      'Education Match:',
      `Required: ${educationMatch.required}`,
      `Candidate: ${educationMatch.candidate}`,
      `Status: ${educationMatch.status}`,
      '',
      'Resume Strengths:',
      ...(strengths.length ? strengths.map((strength) => `- ${strength}`) : ['- No clear strengths detected']),
      '',
      'Suggestions:',
      ...(suggestions.length ? suggestions.map((item) => `- ${item.title}: ${item.reason || 'No reason provided.'}`) : ['- No suggestions available']),
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ats-analysis-report.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resumeSkills = (resume?.skills || []).map((skill) => String(skill));
  const jobSkills = (job?.required_skills || []).map((skill) => String(skill));
  const skillBreakdown = useMemo(() => calculateSkillBreakdown(jobSkills, resumeSkills), [jobSkills, resumeSkills]);
  const matchedSkills = analysis?.matched_skills || [];
  const missingSkills = analysis?.missing_skills || [];
  const scorePercentage = Math.round(Number(analysis?.match_score || 0));
  const scoreInfo = getScoreBand(scorePercentage);
  const jobFitLabel = scoreInfo.label;
  const strengths = buildResumeStrengths(resumeSkills, jobSkills);
  const matchedKeywords = matchedSkills;
  const missingKeywords = missingSkills;
  const resumeText = resume?.extracted_text || resume?.experience?.join(' ') || '';
  const jobDescriptionText = job?.description || '';
  const keywordFrequency = buildKeywordFrequency(resumeText, jobSkills);
  const experienceMatch = analyzeExperienceMatch(jobDescriptionText, resumeText);
  const educationMatch = analyzeEducationMatch(jobDescriptionText, resume?.education || []);
  const resumeChecklist = buildResumeQualityChecklist(resume || {});
  const summary = buildAnalysisSummary(scorePercentage, matchedSkills, missingSkills);
  const suggestions = Array.isArray(analysis?.suggestions)
    ? analysis.suggestions.map((item) => (typeof item === 'string' ? { title: item, reason: 'Generated from the job requirements.' } : item))
    : buildFallbackSuggestions(missingSkills, matchedSkills);

  if (loading) {
    return (
      <div className="analysis-shell">
        <div className="analysis-loading">
          <div className="loading-header" />
          <div className="loading-grid">
            <div className="loading-panel skeleton" />
            <div className="loading-panel skeleton" />
          </div>
          <div className="loading-panel skeleton tall" />
          <div className="loading-panel skeleton tall" />
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="analysis-shell">
        <div className="analysis-empty">
          <div className="empty-icon">◎</div>
          <h3>ATS Resume Analysis</h3>
          <p>Select a resume and job description, then run the ATS evaluation to get a recruiter-ready match report.</p>
          <button className="primary-btn" onClick={handleAnalyze} disabled={!resumeId || !jobId || loading}>
            {loading ? 'Analyzing...' : 'Run ATS Analysis'}
          </button>
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-shell">
      <div className="analysis-header-row">
        <div>
          <p className="section-kicker">Recruiter ATS Evaluation</p>
          <h2>Analysis Results</h2>
        </div>
        <button className="secondary-btn" onClick={handleDownloadReport}>Download Analysis Report</button>
      </div>

      <div className="dashboard-grid top-grid">
        <div className="panel score-panel">
          <div className="score-pill">{jobFitLabel}</div>
          <div className={`score-ring ${scorePercentage >= 90 ? 'excellent' : scorePercentage >= 75 ? 'strong' : scorePercentage >= 60 ? 'moderate' : scorePercentage >= 40 ? 'low' : 'poor'}`}>
            <div className="score-value">{scorePercentage}%</div>
          </div>
          <div className="score-meta">
            <h3>Overall Match Score</h3>
            <p>{scoreInfo.description}</p>
          </div>
        </div>

        <div className="panel summary-panel">
          <p className="panel-label">Analysis Summary</p>
          <p className="summary-text">{summary}</p>
        </div>
      </div>

      <div className="dashboard-grid two-column">
        <div className="panel">
          <p className="panel-label">Matched Skills</p>
          <div className="chip-list">
            {matchedSkills.length ? matchedSkills.map((skill, index) => (
              <span key={`${skill}-${index}`} className="chip matched">✓ {skill}</span>
            )) : <span className="empty-state-inline">No matched skills detected</span>}
          </div>
        </div>

        <div className="panel">
          <p className="panel-label">Missing Skills</p>
          <div className="chip-list">
            {missingSkills.length ? missingSkills.map((skill, index) => (
              <span key={`${skill}-${index}`} className="chip missing">✕ {skill}</span>
            )) : <span className="empty-state-inline">No critical skill gaps detected</span>}
          </div>
        </div>
      </div>

      <div className="panel">
        <p className="panel-label">Skill Match Breakdown</p>
        <div className="breakdown-list">
          {skillBreakdown.map((item) => (
            <div key={item.name} className="breakdown-row">
              <div className="breakdown-header">
                <span>{item.name}</span>
                <strong>{item.percent}%</strong>
              </div>
              <div className="progress-bar">
                <span style={{ width: `${item.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-grid two-column">
        <div className="panel">
          <p className="panel-label">Resume Strengths</p>
          <ul className="bullet-list">
            {strengths.length ? strengths.map((strength, index) => (
              <li key={`${strength}-${index}`}>{strength}</li>
            )) : <li>No strong job-specific skills were detected in the resume.</li>}
          </ul>
        </div>

        <div className="panel">
          <p className="panel-label">ATS Keyword Analysis</p>
          <div className="keyword-section">
            <div className="keyword-box">
              <h4>Matched Keywords</h4>
              <div className="chip-list compact">
                {matchedKeywords.length ? matchedKeywords.map((keyword, index) => (
                  <span key={`${keyword}-${index}`} className="chip matched">{keyword}</span>
                )) : <span className="empty-state-inline">No keywords matched</span>}
              </div>
            </div>
            <div className="keyword-box missing-box">
              <h4>Missing Keywords</h4>
              <div className="chip-list compact">
                {missingKeywords.length ? missingKeywords.map((keyword, index) => (
                  <span key={`${keyword}-${index}`} className="chip missing">{keyword}</span>
                )) : <span className="empty-state-inline">No missing keywords</span>}
              </div>
            </div>
            <p className="helper-text">These keywords were found in the job description but were not detected in the resume.</p>
          </div>
        </div>
      </div>

      <div className="panel">
        <p className="panel-label">Keyword Frequency</p>
        <div className="frequency-list">
          {keywordFrequency.length ? keywordFrequency.map(({ skill, count }) => (
            <div key={skill} className="frequency-row">
              <div className="frequency-label">
                <span>{skill}</span>
                <strong>{count}</strong>
              </div>
              <div className="progress-bar small">
                <span style={{ width: `${Math.min(count * 25, 100)}%` }} />
              </div>
            </div>
          )) : <p className="empty-state-inline">No job keywords were detected in the resume text.</p>}
        </div>
      </div>

      <div className="dashboard-grid two-column">
        <div className="panel">
          <p className="panel-label">Resume vs Job Description Comparison</p>
          <div className="comparison-table-wrap">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Resume Skill</th>
                  <th>Job Requirement</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {jobSkills.length ? jobSkills.map((skill) => (
                  <tr key={skill}>
                    <td>{resumeSkills.includes(skill) ? skill : '—'}</td>
                    <td>{skill}</td>
                    <td>{resumeSkills.includes(skill) ? '✓ Match' : '✕ Missing'}</td>
                  </tr>
                )) : <tr><td colSpan="3">No job skills detected</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <p className="panel-label">Experience Match</p>
          <div className="info-box">
            <p><strong>Required:</strong> {experienceMatch.required}</p>
            <p><strong>Candidate:</strong> {experienceMatch.candidate}</p>
            <p className="status-line"><strong>Status:</strong> {experienceMatch.status}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid two-column">
        <div className="panel">
          <p className="panel-label">Education Match</p>
          <div className="info-box">
            <p><strong>Required:</strong> {educationMatch.required}</p>
            <p><strong>Resume:</strong> {educationMatch.candidate}</p>
            <p className="status-line"><strong>Status:</strong> {educationMatch.status}</p>
          </div>
        </div>

        <div className="panel">
          <p className="panel-label">Resume Quality Checklist</p>
          <ul className="checklist-list">
            {resumeChecklist.map((item) => (
              <li key={item.label} className={item.present ? 'complete' : 'warning'}>
                {item.present ? '✓' : '⚠'} {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="panel">
        <p className="panel-label">Intelligent Suggestions</p>
        <div className="suggestion-list">
          {suggestions.map((item, index) => (
            <div key={`${item.title}-${index}`} className="suggestion-card">
              <h4>Suggestion {index + 1}</h4>
              <p className="suggestion-title">{item.title}</p>
              <p className="suggestion-reason">Reason: {item.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default AnalysisResult;
