import { Modal, Text, Button, Group, Stack } from '@mantine/core';
import { useState } from 'react';

interface DeleteConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
  title: string;
  message: string;
}

export const DeleteConfirmModal = ({
  opened,
  onClose,
  onConfirm,
  title,
  message,
}: DeleteConfirmModalProps) => {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    const success = await onConfirm();
    setDeleting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <Stack gap="md">
        <Text>{message}</Text>
        
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button 
            color="red" 
            onClick={handleConfirm} 
            loading={deleting}
          >
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
