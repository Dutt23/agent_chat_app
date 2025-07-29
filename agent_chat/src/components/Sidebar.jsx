import { Box, VStack, Button, Icon, Text } from "@chakra-ui/react";

/**
 * Sidebar component for navigation
 * @param {Object} props
 * @param {Array} props.navItems - Array of navigation items
 * @param {string} props.activeTab - Currently active tab
 * @param {Function} props.onTabChange - Function to handle tab changes
 * @param {Object} [props.user] - User information for profile
 */
export function Sidebar({ navItems, activeTab, onTabChange, user }) {
  return (
    <Box
      w={{ base: "64px", md: "220px" }}
      h="100%"
      bg="white"
      boxShadow="md"
      borderRight="1px solid"
      borderColor="gray.200"
      p={4}
      display="flex"
      flexDirection="column"
      alignItems={{ base: "center", md: "flex-start" }}
      position="fixed"
      left={0}
      top={0}
      bottom={0}
      zIndex={1}
    >
      <Text
        fontWeight="bold"
        color="blue.600"
        fontSize="xl"
        mb={8}
        display={{ base: "none", md: "block" }}
      >
        Chat Support
      </Text>
      <VStack spacing={2} align="stretch" flex="1" w="full">
        {navItems.map(({ icon, label, key }) => (
          <Button
            key={key}
            variant={activeTab === key ? "solid" : "ghost"}
            colorScheme={activeTab === key ? "blue" : "gray"}
            leftIcon={
              <Icon 
                as={icon} 
                boxSize={5} 
                color={activeTab === key ? "white" : "gray.600"} 
              />
            }
            w="100%"
            justifyContent={{ base: "center", md: "flex-start" }}
            fontWeight={activeTab === key ? "bold" : "medium"}
            color={activeTab === key ? "white" : "gray.700"}
            _hover={{
              bg: activeTab === key ? "blue.500" : "gray.100",
              color: activeTab === key ? "white" : "gray.800"
            }}
            onClick={() => onTabChange(key)}
          >
            <Text display={{ base: "none", md: "inline" }}>{label}</Text>
          </Button>
        ))}
      </VStack>
      {user && (
        <Box mt={8} alignSelf="center">
          <Text fontSize="sm" color="gray.500" textAlign="center">
            {user.email}
          </Text>
        </Box>
      )}
    </Box>
  );
}
