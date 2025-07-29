// App.jsx
import React, { useState } from "react";
import { Flex } from "@chakra-ui/react";
import { AuthForm } from "./components/AuthForm";
import { Dashboard } from "./components/Dashboard";

export default function App() {
  const [user, setUser] = useState({});

  // Fixed, app-wide background/colors
  const bg = "blue.50";

  return (
    <Flex
      minH="100vh"
      w="100vw"
      bg={bg}
      align="center"
      justify="center"
      direction="column"
    >
      {/* All main pages are rendered here, centered */}
      {user ? <Dashboard user={user} /> : <AuthForm onLogin={setUser} />}
    </Flex>
  );
}
