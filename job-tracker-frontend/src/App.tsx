import { MantineProvider, AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Jobs from './pages/Jobs';
import Applications from './pages/Applications';
import Contacts from './pages/Contacts';
import JobMatch from './pages/JobMatch';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

export default function App() {
  const [opened, { toggle, close }] = useDisclosure();

  return (
    <MantineProvider>
      <BrowserRouter>
        <AppShell
          header={{ height: 60 }}
          navbar={{
            width: 250,
            breakpoint: 'sm',
            collapsed: { desktop: true, mobile: !opened },
          }}
          padding="md"
        >
          <Navbar opened={opened} toggle={toggle} />
          <MobileNav onNavClick={close} />
          
          <AppShell.Main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/job-match" element={<JobMatch />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppShell.Main>
        </AppShell>
      </BrowserRouter>
    </MantineProvider>
  );
}
