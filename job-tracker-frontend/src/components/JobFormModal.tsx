import {
  Modal,
  TextInput,
  Select,
  NumberInput,
  Button,
  Group,
  Stack,
  ActionIcon,
  Text,
  Box,
  Chip,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useState, useEffect } from 'react';
import { IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import type { Job, JobFormData, JobRequirements } from '../hooks/useJobs';
import type { Company } from '../hooks/useCompanies';

interface JobFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: JobFormData) => Promise<boolean>;
  job?: Job | null;
  mode: 'create' | 'edit';
  companies: Company[];
}

interface RequirementPair {
  key: string;
  value: string;
}

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];

export const JobFormModal = ({
  opened,
  onClose,
  onSubmit,
  job,
  mode,
  companies,
}: JobFormModalProps) => {
  const [formData, setFormData] = useState<Omit<JobFormData, 'requirements'>>({
    company_id: 0,
    job_title: '',
    job_type: undefined,
    salary_min: undefined,
    salary_max: undefined,
    job_url: '',
    date_posted: new Date().toISOString().split('T')[0],
  });
  
  // Structured requirements
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [yearsExperience, setYearsExperience] = useState<number | undefined>(undefined);
  const [education, setEducation] = useState('');
  
  // Additional custom requirements
  const [additionalRequirements, setAdditionalRequirements] = useState<RequirementPair[]>([]);
  
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Reset form when modal opens/closes or job changes
  useEffect(() => {
    if (!opened) return;

    if (mode === 'edit' && job) {
      // Convert GMT date string to YYYY-MM-DD
      let datePosted = new Date().toISOString().split('T')[0];
      if (job.date_posted) {
        const date = new Date(job.date_posted);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        datePosted = `${year}-${month}-${day}`;
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        company_id: job.company_id,
        job_title: job.job_title || '',
        job_type: job.job_type,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        job_url: job.job_url || '',
        date_posted: datePosted,
      });

      // Parse structured requirements
      if (job.requirements) {
        setSkills(job.requirements.skills || []);
        setYearsExperience(job.requirements.years_experience);
        setEducation(job.requirements.education || '');
        
        // Extract additional custom requirements (excluding structured fields)
        const additionalPairs: RequirementPair[] = [];
        Object.entries(job.requirements).forEach(([key, value]) => {
          if (key !== 'skills' && key !== 'years_experience' && key !== 'education') {
            additionalPairs.push({ key, value: String(value) });
          }
        });
        setAdditionalRequirements(additionalPairs);
      } else {
        setSkills([]);
        setYearsExperience(undefined);
        setEducation('');
        setAdditionalRequirements([]);
      }
    } else {
      setFormData({
        company_id: 0,
        job_title: '',
        job_type: undefined,
        salary_min: undefined,
        salary_max: undefined,
        job_url: '',
        date_posted: new Date().toISOString().split('T')[0],
      });
      setSkills([]);
      setYearsExperience(undefined);
      setEducation('');
      setAdditionalRequirements([]);
    }
    setSkillInput('');
    setErrors({});
  }, [opened, job, mode]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.job_title.trim()) {
      newErrors.job_title = 'Job title is required';
    }

    if (!formData.company_id || formData.company_id === 0) {
      newErrors.company_id = 'Company is required';
    }

    if (
      formData.salary_min !== undefined &&
      formData.salary_max !== undefined &&
      formData.salary_min > formData.salary_max
    ) {
      newErrors.salary_max = 'Maximum salary must be greater than minimum';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Build requirements object
    const requirements: JobRequirements = {};
    
    // Add structured fields if they have values
    if (skills.length > 0) {
      requirements.skills = skills;
    }
    if (yearsExperience !== undefined && yearsExperience !== null) {
      requirements.years_experience = yearsExperience;
    }
    if (education.trim()) {
      requirements.education = education.trim();
    }
    
    // Add additional custom requirements
    additionalRequirements.forEach((pair) => {
      if (pair.key.trim() && pair.value.trim()) {
        requirements[pair.key.trim()] = pair.value.trim();
      }
    });

    const submitData: JobFormData = {
      ...formData,
      requirements: Object.keys(requirements).length > 0 ? requirements : undefined,
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
    value: string | number | undefined | JobFormData['job_type']
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
      date_posted: value || undefined,
    }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSkillInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const addAdditionalRequirement = () => {
    setAdditionalRequirements([...additionalRequirements, { key: '', value: '' }]);
  };

  const removeAdditionalRequirement = (index: number) => {
    setAdditionalRequirements(additionalRequirements.filter((_, i) => i !== index));
  };

  const updateAdditionalRequirement = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...additionalRequirements];
    updated[index][field] = value;
    setAdditionalRequirements(updated);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={mode === 'create' ? 'Add New Job' : 'Edit Job'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Job Title"
            placeholder="e.g., Software Engineer"
            value={formData.job_title}
            onChange={(e) => handleChange('job_title', e.currentTarget.value)}
            error={errors.job_title}
            required
            withAsterisk
          />

          <Select
            label="Company"
            placeholder="Select a company"
            value={formData.company_id ? formData.company_id.toString() : null}
            onChange={(value) => handleChange('company_id', value ? parseInt(value) : 0)}
            data={companies.map((company) => ({
              value: company.company_id.toString(),
              label: company.company_name,
            }))}
            error={errors.company_id}
            searchable
            required
            withAsterisk
          />

          <Select
            label="Job Type"
            placeholder="Select job type"
            value={formData.job_type || null}
            onChange={(value) =>
              handleChange('job_type', value as JobFormData['job_type'])
            }
            data={JOB_TYPES}
            clearable
          />

          <Group grow align="flex-start">
            <NumberInput
              label="Minimum Salary"
              placeholder="50000"
              value={formData.salary_min}
              onChange={(value) => handleChange('salary_min', value || undefined)}
              min={0}
              prefix="$"
              thousandSeparator=","
              hideControls
            />

            <NumberInput
              label="Maximum Salary"
              placeholder="80000"
              value={formData.salary_max}
              onChange={(value) => handleChange('salary_max', value || undefined)}
              min={0}
              prefix="$"
              thousandSeparator=","
              hideControls
              error={errors.salary_max}
            />
          </Group>

          <TextInput
            label="Job URL"
            placeholder="https://company.com/careers/job-id"
            value={formData.job_url}
            onChange={(e) => handleChange('job_url', e.currentTarget.value)}
          />

          <DateInput
            label="Date Posted"
            placeholder="Select date"
            value={formData.date_posted || ''}
            onChange={handleDateChange}
            valueFormat="YYYY-MM-DD"
            clearable
          />

          {/* STRUCTURED REQUIREMENTS SECTION */}
          <Box mt="md">
            <Text size="lg" fw={600} mb="md">
              Job Requirements
            </Text>

            {/* Skills */}
            <Box mb="md">
              <Text size="sm" fw={500} mb="xs">
                Required Skills
              </Text>
              <Group mb="xs">
                <TextInput
                  placeholder="Add a skill (e.g., Python, React)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.currentTarget.value)}
                  onKeyPress={handleSkillInputKeyPress}
                  style={{ flex: 1 }}
                />
                <Button size="sm" onClick={addSkill}>
                  Add
                </Button>
              </Group>
              {skills.length > 0 && (
                <Group gap="xs" mt="xs">
                  {skills.map((skill, index) => (
                    <Chip
                      key={index}
                      checked={false}
                      variant="filled"
                      color="blue"
                    >
                      {skill}
                      <ActionIcon
                        size="xs"
                        variant="transparent"
                        color="white"
                        onClick={() => removeSkill(skill)}
                        style={{ marginLeft: 4 }}
                      >
                        <IconX size={12} />
                      </ActionIcon>
                    </Chip>
                  ))}
                </Group>
              )}
            </Box>

            {/* Years of Experience */}
            <NumberInput
              label="Years of Experience Required"
              placeholder="e.g., 3"
              value={yearsExperience}
              onChange={(value) => setYearsExperience(typeof value === 'number' ? value : undefined)}
              min={0}
              max={50}
              mb="md"
            />

            {/* Education */}
            <TextInput
              label="Education Required"
              placeholder="e.g., Bachelor's degree in Computer Science"
              value={education}
              onChange={(e) => setEducation(e.currentTarget.value)}
              mb="md"
            />

            {/* Additional Custom Requirements */}
            <Box>
              <Group justify="space-between" mb="xs">
                <Text size="sm" fw={500}>
                  Additional Requirements
                </Text>
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<IconPlus size={14} />}
                  onClick={addAdditionalRequirement}
                >
                  Add Field
                </Button>
              </Group>

              <Stack gap="xs">
                {additionalRequirements.map((req, index) => (
                  <Group key={index} gap="xs" align="flex-start">
                    <TextInput
                      placeholder="Key (e.g., Certification)"
                      value={req.key}
                      onChange={(e) => updateAdditionalRequirement(index, 'key', e.currentTarget.value)}
                      style={{ flex: 1 }}
                    />
                    <TextInput
                      placeholder="Value (e.g., AWS Certified)"
                      value={req.value}
                      onChange={(e) => updateAdditionalRequirement(index, 'value', e.currentTarget.value)}
                      style={{ flex: 2 }}
                    />
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => removeAdditionalRequirement(index)}
                      aria-label="Remove requirement"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                ))}

                {additionalRequirements.length === 0 && (
                  <Text size="sm" c="dimmed" fs="italic">
                    No additional requirements added
                  </Text>
                )}
              </Stack>
            </Box>
          </Box>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {mode === 'create' ? 'Create Job' : 'Save Changes'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
