import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminDashboard from "./admin/AdminDashboard";
import PublicParking from "./public/PublicParking";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/parking" element={<PublicParking />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;