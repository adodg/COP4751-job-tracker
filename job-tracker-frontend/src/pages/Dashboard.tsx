import { Container, Title, Text, SimpleGrid, Card, Group, Stack, Skeleton, Alert } from '@mantine/core';
import { IconBuilding, IconBriefcase, IconFileText, IconUsers } from '@tabler/icons-react';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { useNavigate } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  link: string;
}

const StatCard = ({ title, value, icon, color, link }: StatCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      onClick={() => navigate(link)}
    >
      <Group justify="space-between" mb="xs">
        <div style={{ 
          padding: '8px', 
          borderRadius: '8px', 
          backgroundColor: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ color }}>{icon}</div>
        </div>
      </Group>

      <Text size="xl" fw={700} mb={4}>
        {value.toLocaleString()}
      </Text>
      
      <Text size="sm" c="dimmed">
        {title}
      </Text>
    </Card>
  );
};

const Dashboard = () => {
  const { summary, loading, error } = useDashboardSummary();

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="xs">Dashboard</Title>
          <Text c="dimmed">Welcome to Job Tracker! Here's an overview of your job search.</Text>
        </div>

        {error && (
          <Alert color="red" title="Error">
            {error}
          </Alert>
        )}

        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          {loading ? (
            <>
              <Skeleton height={120} radius="md" />
              <Skeleton height={120} radius="md" />
              <Skeleton height={120} radius="md" />
              <Skeleton height={120} radius="md" />
            </>
          ) : (
            <>
              <StatCard
                title="Companies"
                value={summary.companiesCount}
                icon={<IconBuilding size={28} />}
                color="#228be6"
                link="/companies"
              />
              <StatCard
                title="Jobs"
                value={summary.jobsCount}
                icon={<IconBriefcase size={28} />}
                color="#40c057"
                link="/jobs"
              />
              <StatCard
                title="Applications"
                value={summary.applicationsCount}
                icon={<IconFileText size={28} />}
                color="#fd7e14"
                link="/applications"
              />
              <StatCard
                title="Contacts"
                value={summary.contactsCount}
                icon={<IconUsers size={28} />}
                color="#be4bdb"
                link="/contacts"
              />
            </>
          )}
        </SimpleGrid>
      </Stack>
    </Container>
  );
};

export default Dashboard;
