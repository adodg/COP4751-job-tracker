import { useState, useEffect, useCallback } from 'react';

export interface Company {
  company_id: number;
  company_name: string;
  industry?: string;
  website?: string;
  city?: string;
  state?: string;
  notes?: string;
}

export interface CompanyFormData {
  company_name: string;
  industry?: string;
  website?: string;
  city?: string;
  state?: string;
  notes?: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/companies`);
      const data = await response.json();
      
      if (data.success) {
        setCompanies(data.data);
      } else {
        setError(data.error || 'Failed to fetch companies');
      }
    } catch (err) {
      setError('Failed to fetch companies');
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const createCompany = async (companyData: CompanyFormData): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchCompanies(); // Refresh the list
        return true;
      } else {
        setError(data.error || 'Failed to create company');
        return false;
      }
    } catch (err) {
      setError('Failed to create company');
      console.error('Error creating company:', err);
      return false;
    }
  };

  const updateCompany = async (
    companyId: number,
    companyData: CompanyFormData
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchCompanies(); // Refresh the list
        return true;
      } else {
        setError(data.error || 'Failed to update company');
        return false;
      }
    } catch (err) {
      setError('Failed to update company');
      console.error('Error updating company:', err);
      return false;
    }
  };

  const deleteCompany = async (companyId: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchCompanies(); // Refresh the list
        return true;
      } else {
        setError(data.error || 'Failed to delete company');
        return false;
      }
    } catch (err) {
      setError('Failed to delete company');
      console.error('Error deleting company:', err);
      return false;
    }
  };

  return {
    companies,
    loading,
    error,
    createCompany,
    updateCompany,
    deleteCompany,
    refreshCompanies: fetchCompanies,
  };
};
