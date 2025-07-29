import React from "react";
import { Box, Container, Heading } from "@chakra-ui/react";
import { Tabs } from "@chakra-ui/react";
import { TicketManager } from "./TicketManager";
import { UserManager } from "./UserManager";
import { AgentTuning } from "./AgentTuning";
import { ChatWidgetPreview } from "./ChatWidgetPreview";

export function Dashboard({ user }) {
  return (
    <Container maxW="container.lg" mt={10}>
      <Heading as="h2" size="xl" mb={6} color="blue.600">
        Welcome, {user.email}
      </Heading>
      <Box bg="white" rounded="md" shadow="md" p={6}>
        <Tabs.Root defaultValue="tickets" variant="enclosed" colorPalette="blue">
          <Tabs.List>
            <Tabs.Trigger value="tickets">Tickets</Tabs.Trigger>
            <Tabs.Trigger value="users">Users</Tabs.Trigger>
            <Tabs.Trigger value="tuning">Agent Tuning</Tabs.Trigger>
            <Tabs.Trigger value="widget">Widget Preview</Tabs.Trigger>
            <Tabs.Indicator />
          </Tabs.List>
          <Tabs.Content value="tickets">
            <TicketManager />
          </Tabs.Content>
          <Tabs.Content value="users">
            <UserManager />
          </Tabs.Content>
          <Tabs.Content value="tuning">
            <AgentTuning />
          </Tabs.Content>
          <Tabs.Content value="widget">
            <ChatWidgetPreview />
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </Container>
  );
}
