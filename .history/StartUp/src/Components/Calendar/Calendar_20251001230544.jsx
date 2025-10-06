import React, { useState, useEffect } from 'react';
import ReactCalendar from 'react-calendar';
import './Calendar.scss';

const Calendar = ({ countryCode = 'az', year = new Date().getFullYear() }) => {
  const [holidays, setHolidays] = useState([]);
  const [date, setDate] = useState(new Date());

  const API_KEY = process.env.REACT_APP_CALENDARIFIC_API_KEY;

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

  const tileContent = ({ date: currentDate, view }) => {
    if (view === 'month') {
      const holiday = getHoliday(currentDate);
      // Əgər tətil varsa və ya iş günü deyilsə
      if (holiday && (holiday.isWorkday === false)) {
        return <div className="holiday-indicator" title={holiday.name}></div>;
      }
    }
    return null;
  };

  const tileClassName = ({ date: currentDate, view }) => {
    if (view === 'month') {
      const holiday = getHoliday(currentDate);
      if (holiday && (holiday.isWorkday === false)) {
        return 'holiday-tile';
      }
    }
    return null;
  };

  return (
    <div className="calendarContainer" lang="az">
      <ReactCalendar
        onChange={setDate}
        value={date}
        tileContent={tileContent}
        tileClassName={tileClassName}
        locale="az"
      />
    </div>
  );
};

export default Calendar;
