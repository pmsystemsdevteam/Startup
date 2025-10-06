import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../Image/PmsLogo.png";
import "./Dashboard.scss";
import api, { isAuthenticated, getUserId, logout } from "../../api";
import { IoExitOutline } from "react-icons/io5";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    const userId = getUserId();
    if (!userId) {
      logout();
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await api.get(`/api/users/${userId}/`);
        setUser(res.data);
      } catch (err) {
        console.error("User fetch error", err);
        setError("Məlumat alına bilmədi");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) return <div className="loader"></div>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <nav id="dashboard">
      <div className="logo-container">
        <img src={user?.company?.image} alt="Project Management Systems Logo" />
      </div>

      <ul className="nav-menu">
        <li>
          <NavLink
            to={`/${
              user.jobtype === "staff"
                ? "staff"
                : user.jobtype === "hr"
                ? "hr"
                : "lead"
            }/permission-info`}
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            {user.jobtype === "staff" ? "İstifadəçi məlumatları" : "İcazə məlumatları"}
          </NavLink>
        </li>

        <li>
          <NavLink
            to={`/${
              user.jobtype === "staff"
                ? "staff"
                : user.jobtype === "hr"
                ? "hr"
                : "lead"
            }/permission-history`}
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            İcazə keçmişi
          </NavLink>
        </li>

        {/* Lead müraciət səhifəsi - yalnız lead və hr üçün */}
        {(user.jobtype === "lead" || user.jobtype === "hr") && (
          <li>
            <NavLink
              to={`/${user.jobtype === "hr" ? "hr" : "lead"}/lead-request`}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Rhbər müraciəti
            </NavLink>
          </li>
        )}

        {/* Lead müraciət tarixçəsi - yalnız lead və hr üçün */}
        {(user.jobtype === "lead" || user.jobtype === "hr") && (
          <li>
            <NavLink
              to={`/${user.jobtype === "hr" ? "hr" : "lead"}/lead-request-history`}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Lead müraciət tarixçəsi
            </NavLink>
          </li>
        )}

        {/* Əlavə permission history səhifəsi "staff" xaricində */}
        {user.jobtype !== "staff" && (
          <li>
            <NavLink
              to={`/${
                user.jobtype === "hr" ? "hr" : "lead"
              }/lead-permission-history`}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Rəhbər İcazə keçmişi
            </NavLink>
          </li>
        )}

        {user && (
          <div className="userBox" style={{ marginTop: "auto" }}>
            <div className="name">
              {user.first_name?.[0]}
              {user.last_name?.[0]}
            </div>

            <div className="text">
              <span>
                {user.first_name} {user.last_name}
              </span>
              <p>{user.email}</p>
            </div>
          </div>
        )}

        {/* Çıxış düyməsi */}
        <li style={{ marginTop: "1rem" }}>
          <button className="nav-link-logout" onClick={handleLogout}>
            <p>Çıxış</p>{" "}
            <div className="icon">
              <IoExitOutline />
            </div>
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Dashboard;
