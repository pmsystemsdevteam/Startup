import React, { useState } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

function HourlyTimeInput({ startTime, endTime, onStartTimeChange, onEndTimeChange }) {
  const [open, setOpen] = useState(true);

  return (
    <div
      className="box3 hasSubmenu"
      style={{ cursor: "pointer" }}
      onClick={() => setOpen(!open)}
    >
      <label>Saatlıq</label>
      <div className={`icon ${open ? "" : "active"}`}>
        <MdOutlineKeyboardArrowDown />
      </div>
      <p>
        {startTime && endTime
          ? `${startTime} - ${endTime}`
          : "Başlama və bitmə vaxtını seçin"}
      </p>
      <div
        className={`submenu ${open ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="littleBox">
          <label>Başlama vaxtı</label>
          <input
            type="text"
            placeholder="15:30"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            required
          />
        </div>
        <div className="littleBox">
          <label>Bitmə vaxtı</label>
          <input
            type="text"
            placeholder="16:30"
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );
}

export default HourlyTimeInput;
