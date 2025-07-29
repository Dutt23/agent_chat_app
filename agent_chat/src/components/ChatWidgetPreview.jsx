import { Box, Heading, Input, Text } from '@chakra-ui/react';
export function ChatWidgetPreview() {
  return (
    <Box maxW="md" p={6} borderWidth={1} borderRadius="md" borderColor="blue.300">
      <Heading as="h3" size="md" color="blue.600" mb={4}>Chat Widget Preview</Heading>
      <Box
        p={4}
        borderWidth={1}
        borderRadius="md"
        bg="blue.50"
        minH="120px"
        mb={4}
        display="flex"
        alignItems="center"
        justifyContent="center"
        color="blue.700"
      >
        [Chat UI goes here]
      </Box>
      <Input placeholder="Type your message..." mb={4} />
      <Box as="pre" p={4} bg="gray.100" borderRadius="md" fontSize="sm" overflowX="auto">
        {`<script src="https://your-cdn.com/support-widget.js"></script>
<div id="your-support-widget"></div>`}
      </Box>
      <Text mt={2} color="gray.600">Copy-paste this snippet onto your site!</Text>
    </Box>
  );
}
