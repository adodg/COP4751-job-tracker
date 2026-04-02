import { AppShell, Stack, NavLink as MantineNavLink } from '@mantine/core';
import { NavLink } from 'react-router-dom';
import {
  IconLayoutDashboard,
  IconBuilding,
  IconBriefcase,
  IconFileText,
  IconUsers,
  IconTarget,
} from '@tabler/icons-react';

interface MobileNavProps {
  onNavClick: () => void;
}

const navigationItems = [
  { path: '/', label: 'Dashboard', icon: IconLayoutDashboard },
  { path: '/companies', label: 'Companies', icon: IconBuilding },
  { path: '/jobs', label: 'Jobs', icon: IconBriefcase },
  { path: '/applications', label: 'Applications', icon: IconFileText },
  { path: '/contacts', label: 'Contacts', icon: IconUsers },
  { path: '/job-match', label: 'Job Match', icon: IconTarget },
];

const MobileNav = ({ onNavClick }: MobileNavProps) => {
  return (
    <AppShell.Navbar p="md">
      <Stack gap="xs">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={{ textDecoration: 'none' }}
            onClick={onNavClick}
          >
            {({ isActive }) => (
              <MantineNavLink
                label={item.label}
                leftSection={<item.icon size={18} />}
                active={isActive}
                variant="filled"
              />
            )}
          </NavLink>
        ))}
      </Stack>
    </AppShell.Navbar>
  );
};

export default MobileNav;
