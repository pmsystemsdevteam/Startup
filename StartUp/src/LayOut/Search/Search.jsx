import React from "react";
import "./Search.scss";
import { FiSearch } from "react-icons/fi"; // axtarış üçün icon
import { FaBell } from "react-icons/fa";
function Search() {
  return (
    <div className="navbarSearch">
      <div className="searchBox">
        <FiSearch className="icon" />
        <input type="text" placeholder="Axtarış" />
      </div>

      <div className="notification">
        <FaBell className="bell" />
        <span className="badge"></span>
      </div>
    </div>
  );
}

export default Search;
