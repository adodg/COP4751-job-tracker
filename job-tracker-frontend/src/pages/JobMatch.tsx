import {
  Container,
  Title,
  Text,
  Paper,
  Group,
  Badge,
  Stack,
  Loader,
  Alert,
  Button,
  Pill,
  Progress,
  Divider,
} from "@mantine/core";
import { IconAlertCircle, IconCheck, IconX } from "@tabler/icons-react";
import { useState, useEffect, useMemo } from "react";
import { useJobs } from "../hooks/useJobs";
import type { Job } from "../hooks/useJobs";

interface JobWithMatch extends Job {
  matchPercentage: number;
  matchedSkills: string[];
  unmatchedSkills: string[];
}

const JobMatch = () => {
  const { jobs, loading, error, fetchAllSkills } = useJobs();
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [skillsLoading, setSkillsLoading] = useState(true);

  // Load all skills on component mount
  useEffect(() => {
    const loadSkills = async () => {
      setSkillsLoading(true);
      const skills = await fetchAllSkills();
      setAllSkills(skills);
      setSkillsLoading(false);
    };
    loadSkills();
  }, [fetchAllSkills]);

  // Calculate match percentages when skills or jobs change
  const jobsWithMatch = useMemo(() => {
    if (selectedSkills.size === 0) {
      return [];
    }

    const jobsWithMatchData: JobWithMatch[] = jobs.map((job) => {
      const jobSkills = job.requirements?.skills || [];
      const matchedSkills: string[] = [];
      const unmatchedSkills: string[] = [];

      jobSkills.forEach((skill) => {
        if (selectedSkills.has(skill)) {
          matchedSkills.push(skill);
        } else {
          unmatchedSkills.push(skill);
        }
      });

      const matchPercentage =
        jobSkills.length > 0
          ? Math.round((matchedSkills.length / jobSkills.length) * 100)
          : 0;

      return {
        ...job,
        matchPercentage,
        matchedSkills,
        unmatchedSkills,
      };
    });

    // Sort by match percentage (highest first)
    jobsWithMatchData.sort((a, b) => b.matchPercentage - a.matchPercentage);
    return jobsWithMatchData;
  }, [selectedSkills, jobs]);

  const toggleSkill = (skill: string) => {
    const newSelected = new Set(selectedSkills);
    if (newSelected.has(skill)) {
      newSelected.delete(skill);
    } else {
      newSelected.add(skill);
    }
    setSelectedSkills(newSelected);
  };

  const clearAllSkills = () => {
    setSelectedSkills(new Set());
  };

  const selectAllSkills = () => {
    setSelectedSkills(new Set(allSkills));
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "green";
    if (percentage >= 60) return "teal";
    if (percentage >= 40) return "yellow";
    if (percentage >= 20) return "orange";
    return "red";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "green";
    if (percentage >= 60) return "teal";
    if (percentage >= 40) return "yellow";
    if (percentage >= 20) return "orange";
    return "red";
  };

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="xs">
        Job Match
      </Title>
      <Text c="dimmed" mb="xl">
        Select your skills to find the best matching jobs.
      </Text>

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

      {/* Skills Selection Section */}
      <Paper withBorder p="md" mb="xl">
        <Group justify="space-between" mb="md">
          <div>
            <Title order={3} mb={4}>
              Your Skills
            </Title>
            <Text size="sm" c="dimmed">
              Click on skills to select them
            </Text>
          </div>
          <Group>
            <Button
              variant="subtle"
              size="xs"
              onClick={selectAllSkills}
              disabled={skillsLoading || allSkills.length === 0}
            >
              Select All
            </Button>
            <Button
              variant="subtle"
              size="xs"
              onClick={clearAllSkills}
              disabled={selectedSkills.size === 0}
            >
              Clear All
            </Button>
          </Group>
        </Group>

        {skillsLoading ? (
          <Group justify="center" py="xl">
            <Loader size="sm" />
            <Text c="dimmed">Loading skills...</Text>
          </Group>
        ) : allSkills.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No skills found. Add jobs with skills to get started.
          </Text>
        ) : (
          <Group gap="xs">
            {allSkills.map((skill) => (
              <Pill
                key={skill}
                size="lg"
                withRemoveButton={selectedSkills.has(skill)}
                onRemove={() => toggleSkill(skill)}
                onClick={() => toggleSkill(skill)}
                style={{ cursor: "pointer" }}
                bg={selectedSkills.has(skill) ? "blue" : "gray.1"}
                c={selectedSkills.has(skill) ? "white" : "dark"}
              >
                {skill}
              </Pill>
            ))}
          </Group>
        )}

        {selectedSkills.size > 0 && (
          <>
            <Divider my="md" />
            <Text size="sm" c="dimmed">
              {selectedSkills.size} skill{selectedSkills.size !== 1 ? "s" : ""}{" "}
              selected
            </Text>
          </>
        )}
      </Paper>

      {/* Job Match Results */}
      {loading ? (
        <Paper p="xl" withBorder style={{ textAlign: "center" }}>
          <Loader size="lg" />
          <Text mt="md" c="dimmed">
            Loading jobs...
          </Text>
        </Paper>
      ) : selectedSkills.size === 0 ? (
        <Paper p="xl" withBorder style={{ textAlign: "center" }}>
          <Text size="lg" fw={500} mb="xs">
            Select skills to see job matches
          </Text>
          <Text c="dimmed">
            Choose the skills you have to find jobs that match your profile
          </Text>
        </Paper>
      ) : jobsWithMatch.length === 0 ? (
        <Paper p="xl" withBorder style={{ textAlign: "center" }}>
          <Text size="lg" fw={500} mb="xs">
            No jobs found
          </Text>
          <Text c="dimmed">Add some jobs to see matches</Text>
        </Paper>
      ) : (
        <Stack gap="md">
          <Title order={3}>
            Job Matches ({jobsWithMatch.length})
          </Title>
          {jobsWithMatch.map((job) => (
            <Paper key={job.job_id} withBorder p="md">
              <Group justify="space-between" mb="md">
                <div style={{ flex: 1 }}>
                  <Group gap="xs" mb={4}>
                    <Text fw={600} size="lg">
                      {job.job_title}
                    </Text>
                    <Badge
                      size="lg"
                      variant="filled"
                      color={getMatchColor(job.matchPercentage)}
                    >
                      {job.matchPercentage}% Match
                    </Badge>
                  </Group>
                  {job.company_name && (
                    <Text c="dimmed" size="sm">
                      {job.company_name}
                    </Text>
                  )}
                </div>
              </Group>

              <Progress
                value={job.matchPercentage}
                color={getProgressColor(job.matchPercentage)}
                size="md"
                mb="md"
              />

              <Stack gap="xs">
                {job.matchedSkills.length > 0 && (
                  <div>
                    <Group gap={4} mb={4}>
                      <IconCheck size={16} color="green" />
                      <Text size="sm" fw={500}>
                        Matched Skills ({job.matchedSkills.length})
                      </Text>
                    </Group>
                    <Group gap="xs">
                      {job.matchedSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="light"
                          color="green"
                          leftSection={<IconCheck size={12} />}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </Group>
                  </div>
                )}

                {job.unmatchedSkills.length > 0 && (
                  <div>
                    <Group gap={4} mb={4}>
                      <IconX size={16} color="red" />
                      <Text size="sm" fw={500}>
                        Missing Skills ({job.unmatchedSkills.length})
                      </Text>
                    </Group>
                    <Group gap="xs">
                      {job.unmatchedSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="light"
                          color="red"
                          leftSection={<IconX size={12} />}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </Group>
                  </div>
                )}
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default JobMatch;
