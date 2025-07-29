import React, { useState } from 'react';
import {
  Container, Heading, VStack, Input, Button, Text,
} from '@chakra-ui/react';

export function AuthForm({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const bg = useColorModeValue('blue.50', 'blue.900');

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: replace with API call
    if (email && password) onLogin({ email });
  }

  return (
    <Container maxW="sm" p={8} rounded="md" mt="12" boxShadow="md">
      <Heading mb={6} color="blue.600" textAlign="center">
        {isSignup ? 'Sign Up' : 'Login'}
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <Input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} isRequired />
          <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} isRequired />
          <Button type="submit" colorScheme="blue" width="full">
            {isSignup ? 'Sign Up' : 'Login'}
          </Button>
        </VStack>
      </form>
      <Text mt={4} textAlign="center" color="gray.600">
        {isSignup ? 'Already have an account?' : 'No account yet?'}{' '}
        <Button variant="link" colorScheme="blue" onClick={() => setIsSignup(s => !s)}>
          {isSignup ? 'Login' : 'Sign Up'}
        </Button>
      </Text>
    </Container>
  );
}
