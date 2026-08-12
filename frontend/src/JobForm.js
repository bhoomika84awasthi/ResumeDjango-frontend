import React, { useState, useContext } from 'react';
import './JobForm.css';
import { API_ENDPOINTS, getAuthHeaders } from './api';
import { AuthContext } from './AuthContext';

function JobForm({ onJobAdded }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const title = formData.title.trim();
    const description = formData.description.trim();

    if (!title || !description) {
      setError('Please enter both job title and job description.');
      setSuccess('');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.JOBS, {
        method: 'POST',
        headers: getAuthHeaders(token, {
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ title, description }),
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.ok) {
        onJobAdded(responseData);
        setFormData({ title: '', description: '' });
        setSuccess('Job description added successfully.');
      } else {
        setError(responseData?.detail || responseData?.error || 'Error adding job description');
      }
    } catch (err) {
      setError('Error adding job description');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-form-container">
      <h2>Add Job Description</h2>
      <form onSubmit={handleSubmit} className="job-form">
        <div className="form-group">
          <label>Job Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g., Senior React Developer"
          />
        </div>
        <div className="form-group">
          <label>Job Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="8"
            placeholder="Paste the complete job description here..."
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <button type="submit" disabled={loading || !formData.title.trim() || !formData.description.trim()}>
          {loading ? 'Adding...' : 'Add Job Description'}
        </button>
      </form>
    </div>
  );
}

export default JobForm;
