// Dashboard.jsx

import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  VStack,
  Button,
  Heading,
  SimpleGrid,
} from "@chakra-ui/react";
import { FiMessageSquare, FiUsers, FiSettings, FiPlus } from "react-icons/fi";
import { Sidebar } from "./Sidebar";

// Sidebar navigation items
const navItems = [
  { key: "chatbots", icon: FiMessageSquare, label: "Chatbots" },
  { key: "users", icon: FiUsers, label: "Users" },
  { key: "settings", icon: FiSettings, label: "Settings" },
];

// Example chatbot data (replace with your API or state)
const chatbots = [
  { id: 1, name: "Support Assistant", status: "Online", updated: "3 min ago" },
  { id: 2, name: "Sales Enquirer", status: "Idle", updated: "1 hour ago" },
  { id: 3, name: "Feedback Bot", status: "Offline", updated: "yesterday" },
];

export function Dashboard({ user }) {
  // Active tab state (manual – not Chakra Tabs)
  const [activeTab, setActiveTab] = useState("chatbots");

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  return (
    <Flex h="100vh" bg="white" overflow="hidden">
      {/* Sidebar */}
      <Sidebar 
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        user={user}
      />

      {/* Main Content */}
      <Flex 
        flex="1" 
        flexDir="column"
        ml={{ base: "64px", md: "220px" }}
        width={{ base: "calc(100% - 64px)", md: "calc(100% - 220px)" }}
        minW={0} /* Prevents flex items from overflowing */
        bg="white"
      >
        {/* Header */}
        <Flex
          as="header"
          align="center"
          justify="space-between"
          h="60px"
          px={8}
          bg="white"
          borderBottom="1px solid"
          borderColor="gray.200"
        >
          <Heading size="lg" color="blue.800" fontWeight="extrabold">
            {activeTab === "chatbots"
              ? "Chatbots"
              : activeTab === "users"
              ? "Users"
              : "Settings"}
          </Heading>
          {activeTab === "chatbots" && (
            <Button leftIcon={<FiPlus />} colorScheme="blue" size="md">
              New Chatbot
            </Button>
          )}
        </Flex>
        {/* Main Panel */}
        <Box p={8} flex="1" overflow="auto" bg="white">
          {/* Chatbots list */}
          {activeTab === "chatbots" && (
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              {chatbots.map((bot) => (
                <Box
                  key={bot.id}
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="xl"
                  boxShadow="sm"
                  p={6}
                  _hover={{ boxShadow: "lg", borderColor: "blue.300" }}
                  transition="all 0.2s"
                >
                  <Heading size="md" color="blue.700" mb={2}>
                    {bot.name}
                  </Heading>
                  <Text fontSize="sm" color="gray.500">
                    Status: <b>{bot.status}</b>
                  </Text>
                  <Text fontSize="xs" color="gray.400" mt={2}>
                    Last updated: {bot.updated}
                  </Text>
                  <Button mt={4} colorScheme="blue" size="sm" w="full">
                    View Details
                  </Button>
                </Box>
              ))}
            </SimpleGrid>
          )}

          {/* Users panel */}
          {activeTab === "users" && (
            <Box bg="white" borderRadius="lg" p={8} boxShadow="sm" textAlign="center">
              <Text fontSize="xl" color="blue.700">User management coming soon…</Text>
            </Box>
          )}

          {/* Settings panel */}
          {activeTab === "settings" && (
            <Box bg="white" borderRadius="lg" p={8} boxShadow="sm" textAlign="center">
              <Text fontSize="xl" color="blue.700">Settings coming soon…</Text>
            </Box>
          )}
        </Box>
      </Flex>
    </Flex>
  );
}
