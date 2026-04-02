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
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import { useApplications } from "../hooks/useApplications";
import type { Application } from "../hooks/useApplications";
import { useJobs } from "../hooks/useJobs";
import { ApplicationFormModal } from "../components/ApplicationFormModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";

const Applications = () => {
  const {
    applications,
    loading,
    error,
    createApplication,
    updateApplication,
    deleteApplication,
  } = useApplications();

  // Fetch jobs once at the parent level
  const { jobs } = useJobs();

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

  // Selected application for edit/delete
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  const handleEdit = (application: Application) => {
    setSelectedApplication(application);
    openEditModal();
  };

  const handleDelete = (application: Application) => {
    setSelectedApplication(application);
    openDeleteModal();
  };

  const handleConfirmDelete = async () => {
    if (selectedApplication) {
      return await deleteApplication(selectedApplication.application_id);
    }
    return false;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "-";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Applied":
        return "blue";
      case "Screening":
        return "cyan";
      case "Interview":
        return "yellow";
      case "Offer":
        return "green";
      case "Rejected":
        return "red";
      case "Withdrawn":
        return "gray";
      default:
        return "gray";
    }
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1} mb="xs">
            Applications
          </Title>
          <Text c="dimmed">
            Track and manage your job applications.
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={openCreateModal}
        >
          Add Application
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
            Loading applications...
          </Text>
        </Paper>
      ) : applications.length === 0 ? (
        <Paper p="xl" withBorder style={{ textAlign: "center" }}>
          <Text size="lg" fw={500} mb="xs">
            No applications yet
          </Text>
          <Text c="dimmed" mb="md">
            Get started by adding your first job application
          </Text>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={openCreateModal}
          >
            Add Application
          </Button>
        </Paper>
      ) : (
        <Paper withBorder>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Job Title</Table.Th>
                <Table.Th>Company</Table.Th>
                <Table.Th>Application Date</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Resume Version</Table.Th>
                <Table.Th>Cover Letter</Table.Th>
                <Table.Th style={{ width: 100 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {applications.map((application) => (
                <Table.Tr key={application.application_id}>
                  <Table.Td>
                    {application.job_title ? (
                      <Text fw={500}>{application.job_title}</Text>
                    ) : (
                      <Text c="dimmed" fs="italic">
                        -
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {application.company_name ? (
                      <Text>{application.company_name}</Text>
                    ) : (
                      <Text c="dimmed" fs="italic">
                        -
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text>{formatDate(application.application_date)}</Text>
                  </Table.Td>
                  <Table.Td>
                    {application.status ? (
                      <Badge
                        variant="light"
                        color={getStatusColor(application.status)}
                      >
                        {application.status}
                      </Badge>
                    ) : (
                      <Text c="dimmed" fs="italic">
                        -
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {application.resume_version ? (
                      <Text size="sm">{application.resume_version}</Text>
                    ) : (
                      <Text c="dimmed" fs="italic">
                        -
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {application.cover_letter_sent ? (
                      <IconCheck size={18} color="green" />
                    ) : (
                      <IconX size={18} color="gray" />
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => handleEdit(application)}
                        aria-label="Edit application"
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleDelete(application)}
                        aria-label="Delete application"
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
      <ApplicationFormModal
        opened={createModalOpened}
        onClose={closeCreateModal}
        onSubmit={createApplication}
        mode="create"
        jobs={jobs}
      />

      {/* Edit Modal */}
      <ApplicationFormModal
        opened={editModalOpened}
        onClose={closeEditModal}
        onSubmit={(data) =>
          updateApplication(selectedApplication!.application_id, data)
        }
        application={selectedApplication}
        mode="edit"
        jobs={jobs}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Application"
        message={`Are you sure you want to delete the application for "${selectedApplication?.job_title}"? This action cannot be undone.`}
      />
    </Container>
  );
};

export default Applications;
