import { Container, Title, Text } from '@mantine/core';

const Dashboard = () => {
  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="md">Dashboard</Title>
      <Text>Welcome to Job Tracker! This is your dashboard overview.</Text>
    </Container>
  );
};

export default Dashboard;
