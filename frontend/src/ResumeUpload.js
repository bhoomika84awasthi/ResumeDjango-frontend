import React, { useState, useContext } from 'react';
import './ResumeUpload.css';
import { API_ENDPOINTS, getAuthHeaders } from './api';
import { AuthContext } from './AuthContext';

function ResumeUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);

  const isValidResumeFile = (selectedFile) => {
    if (!selectedFile) return false;

    const fileName = (selectedFile.name || '').toLowerCase();
    const mimeType = (selectedFile.type || '').toLowerCase();

    return mimeType.includes('pdf') ||
      mimeType.includes('word') ||
      fileName.endsWith('.pdf') ||
      fileName.endsWith('.doc') ||
      fileName.endsWith('.docx');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && isValidResumeFile(selectedFile)) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a PDF or DOCX file');
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(API_ENDPOINTS.RESUMES, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: formData,
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.ok) {
        onUploadSuccess(responseData);
        setFile(null);
        setError('');
      } else {
        setError(responseData?.error || 'Error uploading resume');
      }
    } catch (err) {
      setError('Error uploading resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Your Resume</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="file-input-wrapper">
          <input
            id="resume-file-input"
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            className="file-input"
          />
          <label htmlFor="resume-file-input" className="file-label">
            {file ? file.name : 'Choose PDF or DOCX file'}
          </label>
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={loading || !file}>
          {loading ? 'Uploading...' : 'Upload Resume'}
        </button>
      </form>
    </div>
  );
}

export default ResumeUpload;
