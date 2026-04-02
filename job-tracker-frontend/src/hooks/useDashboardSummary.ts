import { useState, useEffect } from 'react';

export interface DashboardSummary {
  companiesCount: number;
  jobsCount: number;
  applicationsCount: number;
  contactsCount: number;
}

const API_BASE_URL = 'http://localhost:5000/api';

export const useDashboardSummary = () => {
  const [summary, setSummary] = useState<DashboardSummary>({
    companiesCount: 0,
    jobsCount: 0,
    applicationsCount: 0,
    contactsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);

      try {
        // Make 4 parallel API calls
        const [companiesRes, jobsRes, applicationsRes, contactsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/companies?limit=1`),
          fetch(`${API_BASE_URL}/jobs?limit=1`),
          fetch(`${API_BASE_URL}/applications?limit=1`),
          fetch(`${API_BASE_URL}/contacts?limit=1`),
        ]);

        // Parse all responses
        const [companiesData, jobsData, applicationsData, contactsData] = await Promise.all([
          companiesRes.json(),
          jobsRes.json(),
          applicationsRes.json(),
          contactsRes.json(),
        ]);

        // Extract counts from responses
        setSummary({
          companiesCount: companiesData.success ? companiesData.count : 0,
          jobsCount: jobsData.success ? jobsData.count : 0,
          applicationsCount: applicationsData.success ? applicationsData.count : 0,
          contactsCount: contactsData.success ? contactsData.count : 0,
        });
      } catch (err) {
        setError('Failed to fetch dashboard summary');
        console.error('Error fetching dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return {
    summary,
    loading,
    error,
  };
};
