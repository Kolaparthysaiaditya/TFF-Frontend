import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import "@fontsource/great-vibes";
import { AuthProvider } from "./compleates/common/AuthContext";

import CustomerDashboard from "./compleates/Home/CustomerDashboard";
import LoginPage from "./compleates/common/LoginPage";
import AdminDashboard from "./compleates/Admin/AdminDashboard";
import BranchDashboard from "./compleates/Branch/BranchDashboard";
import ChefDashboard from "./compleates/Chef/ChefDashboard";
import PrivateRoute from "./compleates/common/PraviteRoute";
import CustomerAuth from "./compleates/Home/CustomerAuth";
import GetLatLng from "./compleates/GetLatLng";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CustomerDashboard />} />
          <Route path="/login/" element={<LoginPage />} />
          <Route path="/CustomerAuth/" element={<CustomerAuth />} />

          <Route
            path="/AdminDashboard/*"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/BranchDashboard/"
            element={
              <PrivateRoute allowedRoles={["branch_manager"]}>
                <BranchDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/ChefDashboard/*"
            element={
              <PrivateRoute allowedRoles={["chef"]}>
                <ChefDashboard />
              </PrivateRoute>
            }
          />

          <Route path="/getlat/" element={<GetLatLng />}/>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
