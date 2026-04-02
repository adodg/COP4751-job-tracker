import { useState, useEffect, useCallback } from 'react';

export interface Application {
  application_id: number;
  job_id: number;
  job_title?: string; // From join with jobs table
  company_name?: string; // From join with companies table
  application_date: string;
  status?: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Rejected' | 'Withdrawn';
  resume_version?: string;
  cover_letter_sent?: boolean;
  interview_data?: { [key: string]: string };
}

export interface ApplicationFormData {
  job_id: number;
  application_date: string;
  status?: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Rejected' | 'Withdrawn';
  resume_version?: string;
  cover_letter_sent?: boolean;
  interview_data?: { [key: string]: string };
}

const API_BASE_URL = 'http://localhost:5000/api';

export const useApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/applications`);
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.data);
      } else {
        setError(data.error || 'Failed to fetch applications');
      }
    } catch (err) {
      setError('Failed to fetch applications');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const createApplication = async (applicationData: ApplicationFormData): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchApplications(); // Refresh the list
        return true;
      } else {
        setError(data.error || 'Failed to create application');
        return false;
      }
    } catch (err) {
      setError('Failed to create application');
      console.error('Error creating application:', err);
      return false;
    }
  };

  const updateApplication = async (
    applicationId: number,
    applicationData: ApplicationFormData
  ): Promise<boolean> => {
    try {
      // Ensure interview_data field is explicitly included even if undefined
      const dataToSend = {
        ...applicationData,
        interview_data: applicationData.interview_data === undefined ? null : applicationData.interview_data
      };
      
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchApplications(); // Refresh the list
        return true;
      } else {
        setError(data.error || 'Failed to update application');
        return false;
      }
    } catch (err) {
      setError('Failed to update application');
      console.error('Error updating application:', err);
      return false;
    }
  };

  const deleteApplication = async (applicationId: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchApplications(); // Refresh the list
        return true;
      } else {
        setError(data.error || 'Failed to delete application');
        return false;
      }
    } catch (err) {
      setError('Failed to delete application');
      console.error('Error deleting application:', err);
      return false;
    }
  };

  return {
    applications,
    loading,
    error,
    createApplication,
    updateApplication,
    deleteApplication,
    refreshApplications: fetchApplications,
  };
};
