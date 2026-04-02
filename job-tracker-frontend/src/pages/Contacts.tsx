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
  Anchor,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconAlertCircle,
  IconMail,
  IconPhone,
  IconBrandLinkedin,
} from "@tabler/icons-react";
import { useState } from "react";
import { useContacts } from "../hooks/useContacts";
import type { Contact } from "../hooks/useContacts";
import { ContactFormModal } from "../components/ContactFormModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";

const Contacts = () => {
  const {
    contacts,
    loading,
    error,
    createContact,
    updateContact,
    deleteContact,
  } = useContacts();

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

  // Selected contact for edit/delete
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    openEditModal();
  };

  const handleDelete = (contact: Contact) => {
    setSelectedContact(contact);
    openDeleteModal();
  };

  const handleConfirmDelete = async () => {
    if (selectedContact) {
      return await deleteContact(selectedContact.contact_id);
    }
    return false;
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1} mb="xs">
            Contacts
          </Title>
          <Text c="dimmed">
            Manage your professional contacts and connections.
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
          Add Contact
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
            Loading contacts...
          </Text>
        </Paper>
      ) : contacts.length === 0 ? (
        <Paper p="xl" withBorder style={{ textAlign: "center" }}>
          <Text size="lg" fw={500} mb="xs">
            No contacts yet
          </Text>
          <Text c="dimmed" mb="md">
            Get started by adding your first contact
          </Text>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={openCreateModal}
          >
            Add Contact
          </Button>
        </Paper>
      ) : (
        <Paper withBorder>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Title</Table.Th>
                <Table.Th>Company</Table.Th>
                <Table.Th>Contact Info</Table.Th>
                <Table.Th style={{ width: 100 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {contacts.map((contact) => (
                <Table.Tr key={contact.contact_id}>
                  <Table.Td>
                    <Text fw={500}>{contact.contact_name}</Text>
                  </Table.Td>
                  <Table.Td>
                    {contact.title ? (
                      <Badge variant="light" color="blue">
                        {contact.title}
                      </Badge>
                    ) : (
                      <Text c="dimmed" fs="italic">
                        -
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {contact.company_name ? (
                      <Text>{contact.company_name}</Text>
                    ) : (
                      <Text c="dimmed" fs="italic">
                        -
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {contact.email && (
                        <Anchor
                          href={`mailto:${contact.email}`}
                          size="sm"
                          title={contact.email}
                        >
                          <IconMail size={16} />
                        </Anchor>
                      )}
                      {contact.phone && (
                        <Anchor
                          href={`tel:${contact.phone}`}
                          size="sm"
                          title={contact.phone}
                        >
                          <IconPhone size={16} />
                        </Anchor>
                      )}
                      {contact.linkedin_url && (
                        <Anchor
                          href={contact.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="sm"
                          title="LinkedIn Profile"
                        >
                          <IconBrandLinkedin size={16} />
                        </Anchor>
                      )}
                      {!contact.email &&
                        !contact.phone &&
                        !contact.linkedin_url && (
                          <Text c="dimmed" fs="italic">
                            -
                          </Text>
                        )}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => handleEdit(contact)}
                        aria-label="Edit contact"
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleDelete(contact)}
                        aria-label="Delete contact"
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
      <ContactFormModal
        opened={createModalOpened}
        onClose={closeCreateModal}
        onSubmit={createContact}
        mode="create"
      />

      {/* Edit Modal */}
      <ContactFormModal
        opened={editModalOpened}
        onClose={closeEditModal}
        onSubmit={(data) => updateContact(selectedContact!.contact_id, data)}
        contact={selectedContact}
        mode="edit"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Contact"
        message={`Are you sure you want to delete "${selectedContact?.contact_name}"? This action cannot be undone.`}
      />
    </Container>
  );
};

export default Contacts;
