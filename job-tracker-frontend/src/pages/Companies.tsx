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
import { useCompanies } from "../hooks/useCompanies";
import type { Company } from "../hooks/useCompanies";
import { CompanyFormModal } from "../components/CompanyFormModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";

const Companies = () => {
  const {
    companies,
    loading,
    error,
    createCompany,
    updateCompany,
    deleteCompany,
  } = useCompanies();

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

  // Selected company for edit/delete
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    openEditModal();
  };

  const handleDelete = (company: Company) => {
    setSelectedCompany(company);
    openDeleteModal();
  };

  const handleConfirmDelete = async () => {
    if (selectedCompany) {
      return await deleteCompany(selectedCompany.company_id);
    }
    return false;
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1} mb="xs">
            Companies
          </Title>
          <Text c="dimmed">
            Manage and track companies you're interested in or working with.
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
          Add Company
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
            Loading companies...
          </Text>
        </Paper>
      ) : companies.length === 0 ? (
        <Paper p="xl" withBorder style={{ textAlign: "center" }}>
          <Text size="lg" fw={500} mb="xs">
            No companies yet
          </Text>
          <Text c="dimmed" mb="md">
            Get started by adding your first company
          </Text>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={openCreateModal}
          >
            Add Company
          </Button>
        </Paper>
      ) : (
        <Paper withBorder>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Company Name</Table.Th>
                <Table.Th>Industry</Table.Th>
                <Table.Th>Location</Table.Th>
                <Table.Th>Website</Table.Th>
                <Table.Th style={{ width: 100 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {companies.map((company) => (
                <Table.Tr key={company.company_id}>
                  <Table.Td>
                    <Text fw={500}>{company.company_name}</Text>
                  </Table.Td>
                  <Table.Td>
                    {company.industry ? (
                      <Badge variant="light">{company.industry}</Badge>
                    ) : (
                      <Text c="dimmed" fs="italic">
                        -
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {company.city || company.state ? (
                      <Text>
                        {[company.city, company.state]
                          .filter(Boolean)
                          .join(", ")}
                      </Text>
                    ) : (
                      <Text c="dimmed" fs="italic">
                        -
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {company.website ? (
                      <Text>
                        {company.website}
                      </Text>
                    ) : (
                      <Text c="dimmed" fs="italic">
                        -
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => handleEdit(company)}
                        aria-label="Edit company"
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleDelete(company)}
                        aria-label="Delete company"
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
      <CompanyFormModal
        opened={createModalOpened}
        onClose={closeCreateModal}
        onSubmit={createCompany}
        mode="create"
      />

      {/* Edit Modal */}
      <CompanyFormModal
        opened={editModalOpened}
        onClose={closeEditModal}
        onSubmit={(data) => updateCompany(selectedCompany!.company_id, data)}
        company={selectedCompany}
        mode="edit"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Company"
        message={`Are you sure you want to delete "${selectedCompany?.company_name}"? This action cannot be undone.`}
      />
    </Container>
  );
};

export default Companies;
