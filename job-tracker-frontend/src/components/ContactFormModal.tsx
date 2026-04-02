import { Modal, TextInput, Textarea, Button, Group, Stack, Select } from '@mantine/core';
import { useState, useEffect } from 'react';
import type { Contact, ContactFormData } from '../hooks/useContacts';
import type { Company } from '../hooks/useCompanies';

interface ContactFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: ContactFormData) => Promise<boolean>;
  contact?: Contact | null;
  mode: 'create' | 'edit';
  companies: Company[];
}

export const ContactFormModal = ({
  opened,
  onClose,
  onSubmit,
  contact,
  mode,
  companies,
}: ContactFormModalProps) => {
  const [formData, setFormData] = useState<ContactFormData>({
    contact_name: '',
    company_id: null,
    title: '',
    email: '',
    phone: '',
    linkedin_url: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Reset form when modal opens/closes or contact changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!opened) return;

    const initialData = mode === 'edit' && contact
      ? {
          contact_name: contact.contact_name || '',
          company_id: contact.company_id || null,
          title: contact.title || '',
          email: contact.email || '',
          phone: contact.phone || '',
          linkedin_url: contact.linkedin_url || '',
          notes: contact.notes || '',
        }
      : {
          contact_name: '',
          company_id: null,
          title: '',
          email: '',
          phone: '',
          linkedin_url: '',
          notes: '',
        };

    setFormData(initialData);
    setErrors({});
  }, [opened, contact, mode]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.contact_name.trim()) {
      newErrors.contact_name = 'Contact name is required';
    }

    // Validate email format if provided
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    const success = await onSubmit(formData);
    setSubmitting(false);

    if (success) {
      onClose();
    }
  };

  const handleChange = (field: keyof ContactFormData, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Convert companies to select options
  const companyOptions = companies.map((company) => ({
    value: company.company_id.toString(),
    label: company.company_name,
  }));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={mode === 'create' ? 'Add New Contact' : 'Edit Contact'}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Contact Name"
            placeholder="Enter contact name"
            value={formData.contact_name}
            onChange={(e) => handleChange('contact_name', e.currentTarget.value)}
            error={errors.contact_name}
            required
            withAsterisk
          />

          <TextInput
            label="Title"
            placeholder="e.g., Recruiter, Hiring Manager, Engineer"
            value={formData.title}
            onChange={(e) => handleChange('title', e.currentTarget.value)}
          />

          <TextInput
            label="Email"
            placeholder="contact@example.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.currentTarget.value)}
            error={errors.email}
            type="email"
          />

          <TextInput
            label="Phone"
            placeholder="(555) 123-4567"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.currentTarget.value)}
          />

          <TextInput
            label="LinkedIn URL"
            placeholder="https://linkedin.com/in/username"
            value={formData.linkedin_url}
            onChange={(e) => handleChange('linkedin_url', e.currentTarget.value)}
          />

          <Select
            label="Company"
            placeholder="Select a company (optional)"
            data={companyOptions}
            value={formData.company_id?.toString() || null}
            onChange={(value) => handleChange('company_id', value ? parseInt(value) : null)}
            searchable
            clearable
            nothingFoundMessage="No companies found"
          />

          <Textarea
            label="Notes"
            placeholder="Additional notes about the contact"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.currentTarget.value)}
            minRows={3}
            maxRows={6}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {mode === 'create' ? 'Create Contact' : 'Save Changes'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
