import React, { useState, useRef } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import useClickOutside from "../../hooks/useClickOutside";

function HourlyTimeInput({ startTime, endTime, onStartTimeChange, onEndTimeChange }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Hook istifadə et - kənara klik
  useClickOutside(wrapperRef, () => setOpen(false));

  // Avtomatik iki nöqtə əlavə edən format funksiyası
  const formatTimeInput = (value) => {
    // Yalnız rəqəmləri saxla
    const numbers = value.replace(/\D/g, "");
    
    // Maksimum 4 rəqəm (hhmm)
    const limitedNumbers = numbers.slice(0, 4);
    
    // Avtomatik iki nöqtə ilə formatla
    let formatted = limitedNumbers;
    if (limitedNumbers.length >= 3) {
      formatted = limitedNumbers.slice(0, 2) + ":" + limitedNumbers.slice(2);
    }
    
    return formatted;
  };

  // Vaxt validasiyası
  const validateTime = (timeString) => {
    if (!timeString || timeString.length < 5) return true;
    
    const parts = timeString.split(":");
    if (parts.length !== 2) {
      alert("Düzgün vaxt formatı daxil edin! (SS:DD)");
      return false;
    }
    
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    
    // Saat və dəqiqə yoxlaması
    if (isNaN(hours) || isNaN(minutes)) {
      alert("Düzgün vaxt formatı daxil edin! (SS:DD)");
      return false;
    }
    
    if (hours < 0 || hours > 23) {
      alert("Saat 00-23 arasında olmalıdır!");
      return false;
    }
    
    if (minutes < 0 || minutes > 59) {
      alert("Dəqiqə 00-59 arasında olmalıdır!");
      return false;
    }
    
    return true;
  };

  const handleStartChange = (e) => {
    const formatted = formatTimeInput(e.target.value);
    onStartTimeChange(formatted);
  };

  const handleEndChange = (e) => {
    const formatted = formatTimeInput(e.target.value);
    onEndTimeChange(formatted);
  };

  const handleStartBlur = (e) => {
    const value = e.target.value;
    if (value.length === 5 && !validateTime(value)) {
      onStartTimeChange("");
    }
  };

  const handleEndBlur = (e) => {
    const value = e.target.value;
    if (value.length === 5 && !validateTime(value)) {
      onEndTimeChange("");
    }
  };

  return (
    <div
      className="box3 hasSubmenu"
      style={{ cursor: "pointer" }}
      onClick={() => setOpen(!open)}
      ref={wrapperRef}
    >
      <label>Saatlıq</label>
      <div className={`icon ${open ? "active" : ""}`}>
        <MdOutlineKeyboardArrowDown />
      </div>
      <p>
        {startTime && endTime
          ? `${startTime} - ${endTime}`
          : "Başlama və bitmə vaxtını seçin"}
      </p>
      <div
        className={`submenu ${!open ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="littleBox">
          <label>Başlama vaxtı</label>
          <input
            type="text"
            placeholder="SS:DD (15:30)"
            value={startTime}
            onChange={handleStartChange}
            onBlur={handleStartBlur}
            maxLength={5}
            required
          />
        </div>
        <div className="littleBox">
          <label>Bitmə vaxtı</label>
          <input
            type="text"
            placeholder="SS:DD (16:30)"
            value={endTime}
            onChange={handleEndChange}
            onBlur={handleEndBlur}
            maxLength={5}
            required
          />
        </div>
      </div>
    </div>
  );
}

export default HourlyTimeInput;
