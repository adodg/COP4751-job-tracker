import { Modal, TextInput, Textarea, Button, Group, Stack } from '@mantine/core';
import { useState, useEffect } from 'react';
import type { Company, CompanyFormData } from '../hooks/useCompanies';

interface CompanyFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: CompanyFormData) => Promise<boolean>;
  company?: Company | null;
  mode: 'create' | 'edit';
}

export const CompanyFormModal = ({
  opened,
  onClose,
  onSubmit,
  company,
  mode,
}: CompanyFormModalProps) => {
  const [formData, setFormData] = useState<CompanyFormData>({
    company_name: '',
    industry: '',
    website: '',
    city: '',
    state: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Reset form when modal opens/closes or company changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!opened) return;

    const initialData = mode === 'edit' && company
      ? {
          company_name: company.company_name || '',
          industry: company.industry || '',
          website: company.website || '',
          city: company.city || '',
          state: company.state || '',
          notes: company.notes || '',
        }
      : {
          company_name: '',
          industry: '',
          website: '',
          city: '',
          state: '',
          notes: '',
        };

    setFormData(initialData);
    setErrors({});
  }, [opened, company, mode]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required';
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

  const handleChange = (field: keyof CompanyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={mode === 'create' ? 'Add New Company' : 'Edit Company'}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Company Name"
            placeholder="Enter company name"
            value={formData.company_name}
            onChange={(e) => handleChange('company_name', e.currentTarget.value)}
            error={errors.company_name}
            required
            withAsterisk
          />

          <TextInput
            label="Industry"
            placeholder="e.g., Technology, Finance, Healthcare"
            value={formData.industry}
            onChange={(e) => handleChange('industry', e.currentTarget.value)}
          />

          <TextInput
            label="Website"
            placeholder="https://example.com"
            value={formData.website}
            onChange={(e) => handleChange('website', e.currentTarget.value)}
          />

          <Group grow>
            <TextInput
              label="City"
              placeholder="Enter city"
              value={formData.city}
              onChange={(e) => handleChange('city', e.currentTarget.value)}
            />

            <TextInput
              label="State"
              placeholder="Enter state"
              value={formData.state}
              onChange={(e) => handleChange('state', e.currentTarget.value)}
            />
          </Group>

          <Textarea
            label="Notes"
            placeholder="Additional notes about the company"
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
              {mode === 'create' ? 'Create Company' : 'Save Changes'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
