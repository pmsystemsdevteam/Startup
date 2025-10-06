import React, { useState, useEffect } from 'react';
import ReactCalendar from 'react-calendar';
import './Calendar.scss';

const Calendar = ({ countryCode = 'az', year = new Date().getFullYear(), onClose }) => {
  const [holidays, setHolidays] = useState([]);
  const [date, setDate] = useState(new Date());
  const [selectedHoliday, setSelectedHoliday] = useState(null);

  const API_KEY = import.meta.env.VITE_CALENDARIFIC_API_KEY;

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await fetch(
          `https://calendarific.com/api/v2/holidays?api_key=${API_KEY}&country=${countryCode}&year=${year}`
        );
        const data = await res.json();
        if (data.response && data.response.holidays) {
          const azHolidays = data.response.holidays.map(h => ({
            date: h.date.iso,
            name: h.name_az || h.name,
            isWorkday: h.type.includes('Observance') ? false : h.workday !== undefined ? h.workday : false
          }));
          setHolidays(azHolidays);
        }
      } catch (err) {
        console.error('Tətil günləri alınarkən xəta:', err);
      }
    };
    fetchHolidays();
  }, [API_KEY, countryCode, year]);

  const getHoliday = (currentDate) => {
    const str = currentDate.toISOString().split('T')[0];
    return holidays.find(h => h.date === str);
  };

  const handleDateClick = (value) => {
    setDate(value);
    const holiday = getHoliday(value);
    if (holiday && holiday.isWorkday === false) {
      setSelectedHoliday(holiday);
    } else {
      setSelectedHoliday(null);
    }
  };

  const tileContent = ({ date: currentDate, view }) => {
    if (view === 'month') {
      const holiday = getHoliday(currentDate);
      if (holiday && holiday.isWorkday === false) {
        return <span className="holiday-dot" title={holiday.name}></span>;
      }
    }
    return null;
  };

  const tileClassName = ({ date: currentDate, view }) => {
    if (view === 'month') {
      const holiday = getHoliday(currentDate);
      if (holiday && holiday.isWorkday === false) {
        return 'holiday-tile';
      }
    }
    return null;
  };

  return (
    <div className="calendarModalOverlay" onClick={onClose} role="presentation">
      <div className="calendarModal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="closeBtn" onClick={onClose} aria-label="Bağla">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="calendarHeader">
          <h2 className="calendarTitle">Təqvim</h2>
          <p className="calendarSubtitle">Bayram və iş günlərini görün</p>
        </div>

        <ReactCalendar
          onChange={handleDateClick}
          value={date}
          tileContent={tileContent}
          tileClassName={tileClassName}
          locale="az"
          showNeighboringMonth={false}
          minDetail="month"
          prev2Label={null}
          next2Label={null}
        />

        {selectedHoliday && (
          <div className="holidayInfo">
            <div className="holidayInfoIcon">🎉</div>
            <div className="holidayInfoContent">
              <h3 className="holidayInfoTitle">{selectedHoliday.name}</h3>
              <p className="holidayInfoDate">
                {date.toLocaleDateString('az-AZ', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
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
