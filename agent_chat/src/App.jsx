// App.jsx
import React, { useState } from "react";
import { Flex } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthForm } from "./ui/AuthForm";
import { Dashboard } from "./ui/Dashboard";
import  NewChatBot  from "./ui/NewChatBot";
import ChatPage from "./ui/ChatPage";

function AppContent({ user, setUser }) {
  // Fixed, app-wide background/colors
  const bg = "white";

  return (
    <Flex
      minH="100vh"
      w="100vw"
      bg={bg}
      align="center"
      justify="center"
      direction="column"
    >
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/login" element={
          user ? <Navigate to="/dashboard" /> : <AuthForm onLogin={setUser} />
        } />
        <Route path="/dashboard" element={
          user ? <Dashboard user={user} /> : <Navigate to="/login" />
        } />
        <Route path="/chatbots/new" element={
          user ? <NewChatBot /> : <Navigate to="/login" />
        } />
        <Route path="/chat/:agentId" element={
          user ? <ChatPage /> : <Navigate to="/login" />
        } />
      </Routes>
    </Flex>
  );
}

export default function App() {
  const [user, setUser] = useState({});

  return (
    <Router>
      <AppContent user={user} setUser={setUser} />
    </Router>
  );
}
