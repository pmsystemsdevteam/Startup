import React, { useState, useRef } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import useClickOutside from "../../hooks/useClickOutside";

function PermissionTypeDropdown({ selectedType, onTypeSelect }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Hook istifadə et - kənara klik
  useClickOutside(wrapperRef, () => setOpen(false));

  const permissionTypes = [
    "Məzuniyyət",
    "Saatlıq",
    "Ezamiyyət",
    "Xəstəlik məzuniyyəti",
    "Ödənişsiz məzuniyyət",
    "Digər",
  ];

  const handleTypeSelect = (type) => {
    onTypeSelect(type);
    setOpen(false); // Seçim edildikdə bağla
  };

  return (
    <div
      className="box1 hasSubmenu"
      style={{ cursor: "pointer" }}
      onClick={() => setOpen(!open)}
      ref={wrapperRef}
    >
      <label>Ərizə növü</label>
      <div className={`icon ${open ? "active" : ""}`}>
        <MdOutlineKeyboardArrowDown />
      </div>
      <p>{selectedType}</p>
      <div
        className={`submenu1 ${!open ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <ul>
          {permissionTypes.map((item, index) => (
            <li
              key={index}
              onClick={() => handleTypeSelect(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PermissionTypeDropdown;
