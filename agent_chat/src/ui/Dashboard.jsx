// Dashboard.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Button,
  Heading,
} from "@chakra-ui/react";
import { FiMessageSquare, FiUsers, FiSettings, FiPlus, FiMessageCircle } from "react-icons/fi";
import { Sidebar } from "../components/Sidebar";

// Import tab components
import { AgentListPage } from "./tabs/AgentListPreview";
import { AgentTuning } from "./tabs/AgentTuning";
import { TicketManager } from "./tabs/TicketManager";
import { UserManager } from "./tabs/UserManager";

export function Dashboard({ user }) {
  // Active tab state (manual – not Chakra Tabs)
  const [activeTab, setActiveTab] = useState("chatbots");
  const navigate = useNavigate();

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  const handleNewChatbotClick = () => {
    navigate('/chatbots/new');
  };

  // Tab configuration
  const TAB_CONFIG = {
    chatbots: {
      key: "chatbots",
      label: "Chatbots",
      icon: FiMessageSquare,
      headerAction: (
        <Button 
          leftIcon={<FiPlus />}
          colorScheme="blue" 
          size="md"
          onClick={handleNewChatbotClick}
        >
          New Chatbot
        </Button>
      ),
      component: AgentListPage,
    },
    users: {
      key: "users",
      label: "Users",
      icon: FiUsers,
      headerAction: null,
      component: UserManager,
    },
    tickets: {
      key: "tickets",
      label: "Tickets",
      icon: FiMessageCircle,
      headerAction: null,
      component: TicketManager,
    },
    settings: {
      key: "settings",
      label: "Agent Settings",
      icon: FiSettings,
      headerAction: null,
      component: AgentTuning,
    },
  };

  // Convert config to navItems for Sidebar
  const navItems = Object.values(TAB_CONFIG).map(({ key, label, icon }) => ({
    key,
    label,
    icon,
  }));

  return (
    <Flex h="100vh" bg="white" overflow="hidden" width="100vw">
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
        /* Remove ml and width calc so it fills remaining width */
        ml="0"
        width="auto"
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
          flexShrink={0}
        >
          <Heading size="lg" color="blue.800" fontWeight="extrabold">
            {TAB_CONFIG[activeTab]?.label || activeTab}
          </Heading>
          {TAB_CONFIG[activeTab]?.headerAction}
        </Flex>

        {/* Main Panel */}
        <Box p={8} flex="1" overflow="auto" bg="white">
          {(() => {
            const TabComponent = TAB_CONFIG[activeTab]?.component;
            return TabComponent ? <TabComponent /> : null;
          })()}
        </Box>
      </Flex>
    </Flex>
  );
}
