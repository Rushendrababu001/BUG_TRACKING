import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BugProvider, UIProvider, UserProvider } from "./contexts";
import { useAuth } from "./hooks";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoutes from "./Components/ProtectedRoutes";
import NotAuthorized from "./Components/NotAuthorized";
import MyBugs from "./pages/MyBugs/MyBugs";
import Dashboard from "./pages/Dashboard/Dashboard";
import Settings from "./pages/Settings/Settings";
import Projects from "./pages/Projects/Projects";
import TimeTracking from "./pages/TimeTracking/TimeTracking";
import WorkflowBuilder from "./pages/WorkflowBuilder/WorkflowBuilder";
import Reports from "./pages/Reports/Reports";
import Team from "./pages/Team/Team";
import BugActionHandler from "./Components/BugActionHandler";

function AppContent() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/not-authorized" element={<NotAuthorized />} />

        <Route element={<ProtectedRoutes user={user} />}>
          <Route
            path="/:uid/dashboard"
            element={
              <BugProvider>
                <Dashboard />
              </BugProvider>
            }
          />
          <Route
            path="/:uid/mybugs"
            element={
              <BugProvider>
                <MyBugs />
              </BugProvider>
            }
          />
          <Route path="/:uid/settings" element={<Settings />} />
          <Route
            path="/:uid/projects"
            element={
              <BugProvider>
                <Projects />
              </BugProvider>
            }
          />
          <Route
            path="/:uid/time-tracking"
            element={
              <BugProvider>
                <TimeTracking />
              </BugProvider>
            }
          />
          <Route
            path="/:uid/workflows"
            element={
              <BugProvider>
                <WorkflowBuilder />
              </BugProvider>
            }
          />
          <Route
            path="/:uid/reports"
            element={
              <BugProvider>
                <Reports />
              </BugProvider>
            }
          />
          <Route path="/:uid/team" element={<Team />} />

          <Route path="/bug-action/resolve" element={<BugActionHandler />} />
          <Route path="/bug-action/invalid" element={<BugActionHandler />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <UIProvider>
      <AppContent />
    </UIProvider>
  );
}

export default App;
