import { useState, useEffect, useCallback } from 'react';

export interface Contact {
  contact_id: number;
  company_id?: number;
  contact_name: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  notes?: string;
  company_name?: string; // From JOIN with companies table
}

export interface ContactFormData {
  contact_name: string;
  company_id?: number | null;
  title?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  notes?: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/contacts`);
      const data = await response.json();
      
      if (data.success) {
        setContacts(data.data);
      } else {
        setError(data.error || 'Failed to fetch contacts');
      }
    } catch (err) {
      setError('Failed to fetch contacts');
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const createContact = async (contactData: ContactFormData): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchContacts(); // Refresh the list
        return true;
      } else {
        setError(data.error || 'Failed to create contact');
        return false;
      }
    } catch (err) {
      setError('Failed to create contact');
      console.error('Error creating contact:', err);
      return false;
    }
  };

  const updateContact = async (
    contactId: number,
    contactData: ContactFormData
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchContacts(); // Refresh the list
        return true;
      } else {
        setError(data.error || 'Failed to update contact');
        return false;
      }
    } catch (err) {
      setError('Failed to update contact');
      console.error('Error updating contact:', err);
      return false;
    }
  };

  const deleteContact = async (contactId: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts/${contactId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchContacts(); // Refresh the list
        return true;
      } else {
        setError(data.error || 'Failed to delete contact');
        return false;
      }
    } catch (err) {
      setError('Failed to delete contact');
      console.error('Error deleting contact:', err);
      return false;
    }
  };

  return {
    contacts,
    loading,
    error,
    createContact,
    updateContact,
    deleteContact,
    refreshContacts: fetchContacts,
  };
};
