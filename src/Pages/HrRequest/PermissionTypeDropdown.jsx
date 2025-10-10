import React, { useState } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

function PermissionTypeDropdown({ selectedType, onTypeSelect }) {
  const [open, setOpen] = useState(true);

  const permissionTypes = [
    "Məzuniyyət",
    "Saatlıq",
    "Ezamiyyət",
    "Xəstəlik məzuniyyəti",
    "Ödənişsiz məzuniyyət",
    "Təlim",
  ];

  const handleTypeSelect = (type) => {
    onTypeSelect(type);
    setOpen(true);
  };

  return (
    <div
      className="box1 hasSubmenu"
      style={{ cursor: "pointer" }}
      onClick={() => setOpen(!open)}
    >
      <label>Ərizə növü</label>
      <div className={`icon ${open ? "" : "active"}`}>
        <MdOutlineKeyboardArrowDown />
      </div>
      <p>{selectedType}</p>
      <div
        className={`submenu1 ${open ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <ul>
          {permissionTypes.map((item, index) => (
            <li key={index} onClick={() => handleTypeSelect(item)}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PermissionTypeDropdown;
