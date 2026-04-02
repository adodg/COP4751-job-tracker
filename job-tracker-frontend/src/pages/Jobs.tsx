import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Table,
  ActionIcon,
  Paper,
  Loader,
  Alert,
  Badge,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useState } from "react";
import { useJobs } from "../hooks/useJobs";
import type { Job } from "../hooks/useJobs";
import { useCompanies } from "../hooks/useCompanies";
import { JobFormModal } from "../components/JobFormModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";

const Jobs = () => {
  const {
    jobs,
    loading,
    error,
    createJob,
    updateJob,
    deleteJob,
  } = useJobs();

  // Fetch companies once at the parent level
  const { companies } = useCompanies();

  // Modal states
  const [
    createModalOpened,
    { open: openCreateModal, close: closeCreateModal },
  ] = useDisclosure(false);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);

  // Selected job for edit/delete
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const handleEdit = (job: Job) => {
    setSelectedJob(job);
    openEditModal();
  };

  const handleDelete = (job: Job) => {
    setSelectedJob(job);
    openDeleteModal();
  };

  const handleConfirmDelete = async () => {
    if (selectedJob) {
      return await deleteJob(selectedJob.job_id);
    }
    return false;
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return '-';
    if (min && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    }
    if (min) return `$${min.toLocaleString()}+`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return '-';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return '-';
    }
  };

  const getJobTypeColor = (jobType?: string) => {
    switch (jobType) {
      case 'Full-time':
        return 'blue';
      case 'Part-time':
        return 'cyan';
      case 'Contract':
        return 'grape';
      case 'Internship':
        return 'orange';
      default:
        return 'gray';
    }
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1} mb="xs">
            Jobs
          </Title>
          <Text c="dimmed">
            Browse and manage job opportunities you're tracking.
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
          Add Job
        </Button>
      </Group>

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          mb="md"
          title="Error"
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Paper p="xl" withBorder style={{ textAlign: "center" }}>
          <Loader size="lg" />
          <Text mt="md" c="dimmed">
            Loading jobs...
          </Text>
        </Paper>
      ) : jobs.length === 0 ? (
        <Paper p="xl" withBorder style={{ textAlign: "center" }}>
          <Text size="lg" fw={500} mb="xs">
            No jobs yet
          </Text>
          <Text c="dimmed" mb="md">
            Get started by adding your first job opportunity
          </Text>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={openCreateModal}
          >
            Add Job
          </Button>
        </Paper>
      ) : (
        <Paper withBorder>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Job Title</Table.Th>
                <Table.Th>Company</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Salary Range</Table.Th>
                <Table.Th>Date Posted</Table.Th>
                <Table.Th style={{ width: 100 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {jobs.map((job) => (
                <Table.Tr key={job.job_id}>
                  <Table.Td>
                    <Text fw={500}>{job.job_title}</Text>
                  </Table.Td>
                  <Table.Td>
                    {job.company_name ? (
                      <Text>{job.company_name}</Text>
                    ) : (
                      <Text c="dimmed" fs="italic">
                        -
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {job.job_type ? (
                      <Badge variant="light" color={getJobTypeColor(job.job_type)}>
                        {job.job_type}
                      </Badge>
                    ) : (
                      <Text c="dimmed" fs="italic">
                        -
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text>{formatSalary(job.salary_min, job.salary_max)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text>{formatDate(job.date_posted)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => handleEdit(job)}
                        aria-label="Edit job"
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleDelete(job)}
                        aria-label="Delete job"
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}

      {/* Create Modal */}
      <JobFormModal
        opened={createModalOpened}
        onClose={closeCreateModal}
        onSubmit={createJob}
        mode="create"
        companies={companies}
      />

      {/* Edit Modal */}
      <JobFormModal
        opened={editModalOpened}
        onClose={closeEditModal}
        onSubmit={(data) => updateJob(selectedJob!.job_id, data)}
        job={selectedJob}
        mode="edit"
        companies={companies}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Job"
        message={`Are you sure you want to delete "${selectedJob?.job_title}"? This action cannot be undone.`}
      />
    </Container>
  );
};

export default Jobs;
