// src/App.jsx
import React, { useEffect, useState } from "react";
import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import Dashboard from "./LayOut/Dashboard/Dashboard";
import Search from "./LayOut/Search/Search";

import StaffPage from "./Pages/Staff/StaffPage";
import StaffSchedule from "./Pages/StaffSchedule/StaffSchedule";
import HrPage from "./Pages/Hr/HrPage";
import PermissionDetail from "./Pages/PermissionDetail/PermissionDetail";
import Login from "./Pages/Login/Login";
import { isAuthenticated, getUserJobtype, ensureJobtypeInStorage } from "./api";
import LeadPage from "./Pages/Lead/LeadPage";
import LeadStaffSchedule from "./Pages/LeadStaffSchedule/LeadStaffSchedule";
import LeadSchedule from "./Pages/LeadSchedule/LeadSchedule";
import LeadRequest from "./Pages/LeadRequest/LeadRequest";
import HrStaffSchedule from "./Pages/HrStaffSchedule/HrStaffSchedule";
import HrSchedule from "./Pages/HrSchedule/HrSchedule";
import HrRequest from "./Pages/HrRequest/HrRequest";
import Loading from "./Components/Loading/Loading";

/* --- Qorunan Layout: Dashboard + Search həmişə açıq, altında Outlet --- */
function ProtectedLayout() {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return (
    <>
      <Dashboard />
      <Search />
      <Outlet />
    </>
  );
}

/* --- Kök route üçün rol əsasında yönləndirmə --- */
function RoleRedirect() {
  const [loading, setLoading] = useState(true);
  const [jobtype, setJobtype] = useState(null);

  useEffect(() => {
    async function fetchJobtype() {
      const jt = getUserJobtype() || (await ensureJobtypeInStorage());
      setJobtype(jt);
      setLoading(false);
    }
    fetchJobtype();
  }, []);

  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (loading) return <Loading/>;

  if (jobtype === "staff")
    return <Navigate to="/staff/permission-info" replace />;
  if (jobtype === "hr") return <Navigate to="/hr/permission-info" replace />;
  if (jobtype === "lead" || jobtype === "teamlead" || jobtype === "ceo")
    return <Navigate to="/lead/permission-info" replace />;

  // fallback
  return <Navigate to="/staff/permission-info" replace />;
}
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected (Dashboard + Search açıq qalır) */}
        <Route element={<ProtectedLayout />}>
          {/* Root-a gələndə rola görə yönləndir */}
          <Route path="/" element={<RoleRedirect />} />
          {/* Staff */}
          <Route path="/staff/permission-info" element={<StaffPage />} />
          <Route path="/staff/permission-history" element={<StaffSchedule />} />
          {/* HR */}
          <Route path="/hr/permission-info" element={<HrPage />} />
          <Route path="/hr/permission-history" element={<HrStaffSchedule />} />
          <Route
            path="/hr/lead-permission-history"
            element={<HrSchedule />}
          />
          {/* Rəhbər İcazə Keçmişi*/}
          <Route path="/hr/hr-request" element={<HrRequest />} />{" "}
          {/* Rəhbər
          Müraciəti*/}
          <Route
            path="/hr/permission-history-detail/:id"
            element={<PermissionDetail />}
          />
          <Route
            path="/hr/permission-info-detail/:id"
            element={<PermissionDetail />}
          />
          {/* Lead */}
          <Route path="/lead/lead-request" element={<LeadRequest />} />
          <Route path="/lead/permission-info" element={<LeadPage />} />
          <Route
            path="/lead/permission-history"
            element={<LeadStaffSchedule />}
          />
          <Route
            path="/lead/lead-permission-history"
            element={<LeadSchedule />}
          />
        </Route>

        {/* Catch-all → root (orada RoleRedirect işləyəcək) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
