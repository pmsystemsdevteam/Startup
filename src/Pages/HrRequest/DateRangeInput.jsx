import React, { useState } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

function DateRangeInput({ dailyStart, dailyEnd, onStartChange, onEndChange }) {
  const [open, setOpen] = useState(true);

  return (
    <div
      className="box4 hasSubmenu"
      style={{ cursor: "pointer" }}
      onClick={() => setOpen(!open)}
    >
      <label>Günlük və aylıq</label>
      <div className={`icon ${open ? "" : "active"}`}>
        <MdOutlineKeyboardArrowDown />
      </div>
      <p>
        {dailyStart && dailyEnd
          ? `${dailyStart} - ${dailyEnd}`
          : "Başlama və bitmə tarixini seçin"}
      </p>
      <div
        className={`submenu ${open ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="littleBox">
          <label>Başlama tarixi</label>
          <input
            type="text"
            placeholder="dd.mm.yyyy"
            value={dailyStart}
            onChange={(e) => onStartChange(e.target.value)}
            required
          />
        </div>
        <div className="littleBox">
          <label>Bitmə tarixi</label>
          <input
            type="text"
            placeholder="dd.mm.yyyy"
            value={dailyEnd}
            onChange={(e) => onEndChange(e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );
}

export default DateRangeInput;
