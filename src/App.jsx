import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CheckRole from "./pages/CheckRole";
import ProtectedRoutes from "./Components/ProtectedRoutes";
import NotAuthorized from "./Components/NotAuthorized";
import Dashboard from "./pages/Dashboard.jsx/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/not-authorized" element={<NotAuthorized/>} />
        <Route path="/checkrole/:uid" element={<ProtectedRoutes allowedRoles={[ "user", "admin" ]}> <CheckRole /> </ProtectedRoutes>} />
        <Route path="dashboard/:uid" element={<ProtectedRoutes allowedRoles={[ "user", "admin" ]}> <Dashboard/></ProtectedRoutes>} /> 
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
