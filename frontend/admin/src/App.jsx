import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sign from "./admin/AuthForm";
import Dashboard from "./admin/pages/AdminDashboard";
import Settings from "./admin/pages/Settings";
import Users from "./admin/pages/Users";
import AdminParking from "./admin/pages/parking";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Sign />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/settings" element={<Settings/>} />
        <Route path="/admin/users" element={<Users/>} />
        <Route path="/admin/zones" element={<AdminParking/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;