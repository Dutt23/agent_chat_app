import React, { useState } from 'react';
import { Box } from '@chakra-ui/react';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);
  return (
    <Box minH="100vh" bg="blue.100" p={4}>
      {user ? <Dashboard user={user} /> : <AuthForm onLogin={setUser} />}
    </Box>
  );
}
