import { useState, useEffect, useCallback } from 'react';

// Structured requirements with specific fields plus additional custom fields
export interface JobRequirements {
  skills?: string[]; // Array of required skills
  years_experience?: number; // Years of experience required
  education?: string; // Education level required
  [key: string]: string | number | boolean | string[] | undefined; // Additional custom key-value pairs
}

export interface Job {
  job_id: number;
  company_id: number;
  company_name?: string; // From join with companies table
  job_title: string;
  job_type?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  salary_min?: number;
  salary_max?: number;
  job_url?: string;
  date_posted?: string;
  requirements?: JobRequirements;
}

export interface JobFormData {
  company_id: number;
  job_title: string;
  job_type?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  salary_min?: number;
  salary_max?: number;
  job_url?: string;
  date_posted?: string;
  requirements?: JobRequirements;
}

const API_BASE_URL = 'http://localhost:5000/api';

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/jobs`);
      const data = await response.json();
      
      if (data.success) {
        setJobs(data.data);
      } else {
        setError(data.error || 'Failed to fetch jobs');
      }
    } catch (err) {
      setError('Failed to fetch jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const createJob = async (jobData: JobFormData): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchJobs(); // Refresh the list
        return true;
      } else {
        setError(data.error || 'Failed to create job');
        return false;
      }
    } catch (err) {
      setError('Failed to create job');
      console.error('Error creating job:', err);
      return false;
    }
  };

  const updateJob = async (
    jobId: number,
    jobData: JobFormData
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchJobs(); // Refresh the list
        return true;
      } else {
        setError(data.error || 'Failed to update job');
        return false;
      }
    } catch (err) {
      setError('Failed to update job');
      console.error('Error updating job:', err);
      return false;
    }
  };

  const deleteJob = async (jobId: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchJobs(); // Refresh the list
        return true;
      } else {
        setError(data.error || 'Failed to delete job');
        return false;
      }
    } catch (err) {
      setError('Failed to delete job');
      console.error('Error deleting job:', err);
      return false;
    }
  };

  return {
    jobs,
    loading,
    error,
    createJob,
    updateJob,
    deleteJob,
    refreshJobs: fetchJobs,
  };
};
