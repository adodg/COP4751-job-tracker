import {
  Modal,
  TextInput,
  Select,
  Button,
  Group,
  Stack,
  ActionIcon,
  Text,
  Box,
  Checkbox,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useState, useEffect } from 'react';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import type { Application, ApplicationFormData } from '../hooks/useApplications';
import type { Job } from '../hooks/useJobs';

interface ApplicationFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: ApplicationFormData) => Promise<boolean>;
  application?: Application | null;
  mode: 'create' | 'edit';
}

interface InterviewDataPair {
  key: string;
  value: string;
}

const APPLICATION_STATUSES = [
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Rejected',
  'Withdrawn',
];

export const ApplicationFormModal = ({
  opened,
  onClose,
  onSubmit,
  application,
  mode,
}: ApplicationFormModalProps) => {
  const [formData, setFormData] = useState<Omit<ApplicationFormData, 'interview_data'>>({
    job_id: 0,
    application_date: new Date().toISOString().split('T')[0],
    status: undefined,
    resume_version: '',
    cover_letter_sent: false,
  });
  const [interviewData, setInterviewData] = useState<InterviewDataPair[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch jobs for dropdown
  useEffect(() => {
    const fetchJobs = async () => {
      setLoadingJobs(true);
      try {
        const response = await fetch('http://localhost:5000/api/jobs');
        const data = await response.json();
        if (data.success) {
          setJobs(data.data);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoadingJobs(false);
      }
    };

    if (opened) {
      fetchJobs();
    }
  }, [opened]);

  // Reset form when modal opens/closes or application changes
  useEffect(() => {
    if (!opened) return;

    if (mode === 'edit' && application) {
      // Convert GMT date string to YYYY-MM-DD
      let applicationDate = new Date().toISOString().split('T')[0];
      if (application.application_date) {
        const date = new Date(application.application_date);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        applicationDate = `${year}-${month}-${day}`;
      }

      setFormData({
        job_id: application.job_id,
        application_date: applicationDate,
        status: application.status,
        resume_version: application.resume_version || '',
        cover_letter_sent: application.cover_letter_sent || false,
      });

      // Convert interview_data object to array of pairs
      if (application.interview_data && typeof application.interview_data === 'object') {
        const pairs = Object.entries(application.interview_data).map(([key, value]) => ({
          key,
          value,
        }));
        setInterviewData(pairs);
      } else {
        setInterviewData([]);
      }
    } else {
      setFormData({
        job_id: 0,
        application_date: new Date().toISOString().split('T')[0],
        status: undefined,
        resume_version: '',
        cover_letter_sent: false,
      });
      setInterviewData([]);
    }
    setErrors({});
  }, [opened, application, mode]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.job_id || formData.job_id === 0) {
      newErrors.job_id = 'Job is required';
    }

    if (!formData.application_date) {
      newErrors.application_date = 'Application date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Convert interview_data array to object
    const interviewDataObj: { [key: string]: string } = {};
    interviewData.forEach((pair) => {
      if (pair.key.trim() && pair.value.trim()) {
        interviewDataObj[pair.key.trim()] = pair.value.trim();
      }
    });

    const submitData: ApplicationFormData = {
      ...formData,
      resume_version: formData.resume_version?.trim() || undefined,
      interview_data: Object.keys(interviewDataObj).length > 0 ? interviewDataObj : undefined,
    };

    setSubmitting(true);
    const success = await onSubmit(submitData);
    setSubmitting(false);

    if (success) {
      onClose();
    }
  };

  const handleChange = (
    field: keyof typeof formData,
    value: string | number | boolean | undefined | ApplicationFormData['status']
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleDateChange = (value: string | null) => {
    setFormData((prev) => ({
      ...prev,
      application_date: value || '',
    }));
    if (errors.application_date) {
      setErrors((prev) => ({ ...prev, application_date: '' }));
    }
  };

  const addInterviewData = () => {
    setInterviewData([...interviewData, { key: '', value: '' }]);
  };

  const removeInterviewData = (index: number) => {
    setInterviewData(interviewData.filter((_, i) => i !== index));
  };

  const updateInterviewData = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...interviewData];
    updated[index][field] = value;
    setInterviewData(updated);
  };

  // Format job dropdown options to show job title and company
  const jobOptions = jobs.map((job) => ({
    value: job.job_id.toString(),
    label: job.company_name
      ? `${job.job_title} - ${job.company_name}`
      : job.job_title,
  }));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={mode === 'create' ? 'Add New Application' : 'Edit Application'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Select
            label="Job"
            placeholder="Select a job"
            value={formData.job_id ? formData.job_id.toString() : null}
            onChange={(value) => handleChange('job_id', value ? parseInt(value) : 0)}
            data={jobOptions}
            error={errors.job_id}
            disabled={loadingJobs}
            searchable
            required
            withAsterisk
          />

          <DateInput
            label="Application Date"
            placeholder="Select date"
            value={formData.application_date || ''}
            onChange={handleDateChange}
            valueFormat="YYYY-MM-DD"
            error={errors.application_date}
            required
            withAsterisk
            clearable
          />

          <Select
            label="Status"
            placeholder="Select status"
            value={formData.status || null}
            onChange={(value) =>
              handleChange('status', value as ApplicationFormData['status'])
            }
            data={APPLICATION_STATUSES}
            clearable
          />

          <TextInput
            label="Resume Version"
            placeholder="e.g., Software_Engineer_v2"
            value={formData.resume_version}
            onChange={(e) => handleChange('resume_version', e.currentTarget.value)}
          />

          <Checkbox
            label="Cover Letter Sent"
            checked={formData.cover_letter_sent}
            onChange={(e) => handleChange('cover_letter_sent', e.currentTarget.checked)}
          />

          <Box>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>
                Interview Data
              </Text>
              <Button
                size="xs"
                variant="light"
                leftSection={<IconPlus size={14} />}
                onClick={addInterviewData}
              >
                Add Interview Info
              </Button>
            </Group>

            <Stack gap="xs">
              {interviewData.map((data, index) => (
                <Group key={index} gap="xs" align="flex-start">
                  <TextInput
                    placeholder="Key (e.g., Round 1)"
                    value={data.key}
                    onChange={(e) => updateInterviewData(index, 'key', e.currentTarget.value)}
                    style={{ flex: 1 }}
                  />
                  <TextInput
                    placeholder="Value (e.g., Phone Screen - Passed)"
                    value={data.value}
                    onChange={(e) => updateInterviewData(index, 'value', e.currentTarget.value)}
                    style={{ flex: 2 }}
                  />
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => removeInterviewData(index)}
                    aria-label="Remove interview data"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ))}

              {interviewData.length === 0 && (
                <Text size="sm" c="dimmed" fs="italic">
                  No interview data added yet
                </Text>
              )}
            </Stack>
          </Box>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {mode === 'create' ? 'Create Application' : 'Save Changes'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
