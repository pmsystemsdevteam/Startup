import React, { useState, useRef } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import useClickOutside from "../../hooks/useClickOutside";

dayjs.extend(customParseFormat);

function DateRangeInput({ dailyStart, dailyEnd, onStartChange, onEndChange }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Custom hook istifadə et
  useClickOutside(wrapperRef, () => setOpen(false));

  // Format funksiyası
  const formatDateInput = (value) => {
    const numbers = value.replace(/\D/g, "");
    const limitedNumbers = numbers.slice(0, 8);
    
    let formatted = limitedNumbers;
    if (limitedNumbers.length >= 3) {
      formatted = limitedNumbers.slice(0, 2) + "." + limitedNumbers.slice(2);
    }
    if (limitedNumbers.length >= 5) {
      formatted = limitedNumbers.slice(0, 2) + "." + limitedNumbers.slice(2, 4) + "." + limitedNumbers.slice(4);
    }
    
    return formatted;
  };

  // Validasiya
  const validateDate = (dateString) => {
    if (!dateString || dateString.length < 10) return true;
    
    const parsed = dayjs(dateString, "DD.MM.YYYY", true);
    
    if (!parsed.isValid()) {
      alert("Düzgün tarix formatı daxil edin! (GG.AA.IIII)");
      return false;
    }
    
    const today = dayjs().startOf("day");
    const inputDate = parsed.startOf("day");
    
    if (inputDate.isBefore(today)) {
      alert("Keçmiş tarix seçə bilməzsiniz! Zəhmət olmasa cari və ya gələcək tarix daxil edin.");
      return false;
    }
    
    return true;
  };

  const handleStartChange = (e) => {
    const formatted = formatDateInput(e.target.value);
    onStartChange(formatted);
  };

  const handleEndChange = (e) => {
    const formatted = formatDateInput(e.target.value);
    onEndChange(formatted);
  };

  const handleStartBlur = (e) => {
    const value = e.target.value;
    if (value.length === 10 && !validateDate(value)) {
      onStartChange("");
    }
  };

  const handleEndBlur = (e) => {
    const value = e.target.value;
    if (value.length === 10 && !validateDate(value)) {
      onEndChange("");
    }
  };

  return (
    <div
      className="box4 hasSubmenu"
      style={{ cursor: "pointer" }}
      onClick={() => setOpen(!open)}
      ref={wrapperRef}
    >
      <label>Günlük və aylıq</label>
      <div className={`icon ${open ? "active" : ""}`}>
        <MdOutlineKeyboardArrowDown />
      </div>
      <p>
        {dailyStart && dailyEnd
          ? `${dailyStart} - ${dailyEnd}`
          : "Başlama və bitmə tarixini seçin"}
      </p>
      <div
        className={`submenu ${!open ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="littleBox">
          <label>Başlama tarixi</label>
          <input
            type="text"
            placeholder="GG.AA.IIII (gün.ay.il)"
            value={dailyStart}
            onChange={handleStartChange}
            onBlur={handleStartBlur}
            maxLength={10}
            required
          />
        </div>
        <div className="littleBox">
          <label>Bitmə tarixi</label>
          <input
            type="text"
            placeholder="GG.AA.IIII (gün.ay.il)"
            value={dailyEnd}
            onChange={handleEndChange}
            onBlur={handleEndBlur}
            maxLength={10}
            required
          />
        </div>
      </div>
    </div>
  );
}

export default DateRangeInput;
