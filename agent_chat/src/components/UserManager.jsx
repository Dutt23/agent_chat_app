import { Box, Heading, Text } from '@chakra-ui/react';
export function UserManager() {
  return (
    <Box p={4} borderWidth={1} borderRadius="md" borderColor="blue.300">
      <Heading as="h3" size="md" color="blue.600" mb={2}>User Management</Heading>
      <Text>(Invite, edit users. Wire this up to User API!)</Text>
    </Box>
  );
}
