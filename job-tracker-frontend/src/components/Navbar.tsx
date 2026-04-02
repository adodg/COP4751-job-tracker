import { AppShell, Group, Burger, Button, Text } from '@mantine/core';
import { NavLink } from 'react-router-dom';
import {
  IconLayoutDashboard,
  IconBuilding,
  IconBriefcase,
  IconFileText,
  IconUsers,
  IconTarget,
} from '@tabler/icons-react';
import './Navbar.css';

interface NavbarProps {
  opened: boolean;
  toggle: () => void;
}

const navigationItems = [
  { path: '/', label: 'Dashboard', icon: IconLayoutDashboard },
  { path: '/companies', label: 'Companies', icon: IconBuilding },
  { path: '/jobs', label: 'Jobs', icon: IconBriefcase },
  { path: '/applications', label: 'Applications', icon: IconFileText },
  { path: '/contacts', label: 'Contacts', icon: IconUsers },
  { path: '/job-match', label: 'Job Match', icon: IconTarget },
];

const Navbar = ({ opened, toggle }: NavbarProps) => {
  return (
    <AppShell.Header>
      <Group h="100%" px="md" justify="space-between">
        {/* Brand/Logo */}
        <Group>
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Text size="xl" fw={700} c="blue.7">
            Job Tracker
          </Text>
        </Group>

        {/* Desktop Navigation */}
        <Group gap="xs" visibleFrom="sm">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link-active' : 'nav-link'
              }
            >
              {({ isActive }) => (
                <Button
                  variant={isActive ? 'light' : 'subtle'}
                  leftSection={<item.icon size={18} />}
                  color={isActive ? 'blue' : 'gray'}
                >
                  {item.label}
                </Button>
              )}
            </NavLink>
          ))}
        </Group>
      </Group>
    </AppShell.Header>
  );
};

export default Navbar;
