import React, { useState } from 'react';
import 'react-modern-calendar-datepicker/lib/DatePicker.css';
import './Calendar.scss'; 

const Calendar = ({ onClose }) => {
  const [selectedDay, setSelectedDay] = useState(null);

  return (
    <div className="calendarModalOverlay" onClick={onClose} role="presentation">
      <div className="calendarModal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="closeBtn" onClick={onClose} aria-label="Bağla">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="calendarHeader">
          <h2 className="calendarTitle">Təqvim</h2>
          <p className="calendarSubtitle">Bayram və iş günlərini görün</p>
        </div>

        <DatePicker
          value={selectedDay}
          onChange={setSelectedDay}
          shouldHighlightWeekends
          calendarClassName="custom-calendar"
          calendarTodayClassName="custom-today"
          inputPlaceholder="Tarixi seçin"
          locale="az"
        />

        {selectedDay && (
          <div className="holidayInfo">
            <div className="holidayInfoIcon">🎉</div>
            <div className="holidayInfoContent">
              <h3 className="holidayInfoTitle">Seçilmiş Tarix</h3>
              <p className="holidayInfoDate">
                {`${selectedDay.year}-${selectedDay.month.toString().padStart(2, '0')}-${selectedDay.day.toString().padStart(2, '0')}`}
              </p>
            </div>
          </div>
        )}

        <div className="calendarLegend">
          <div className="legendItem">
            <span className="legendDot legendDotHoliday"></span>
            <span className="legendText">Bayram günü</span>
          </div>
          <div className="legendItem">
            <span className="legendDot legendDotToday"></span>
            <span className="legendText">Bu gün</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
