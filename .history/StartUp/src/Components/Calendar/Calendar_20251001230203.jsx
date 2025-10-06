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
        const response = await fetch(
          `https://calendarific.com/api/v2/holidays?api_key=${API_KEY}&country=${countryCode}&year=${year}`
        );
        const data = await response.json();
        if (data.response && data.response.holidays) {
          const azHolidays = data.response.holidays.map(h => ({
            date: h.date.iso,
            name: h.name_az || h.name
          }));
          setHolidays(azHolidays);
        }
      } catch (error) {
        console.error('Tətil günləri alınarkən xəta:', error);
      }
    };

    fetchHolidays();
  }, [API_KEY, countryCode, year]);

  const getHoliday = (currentDate) => {
    const formatted = currentDate.toISOString().split('T')[0];
    return holidays.find(h => h.date === formatted);
  };

  const tileContent = ({ date: currentDate, view }) => {
    if (view === 'month') {
      const holiday = getHoliday(currentDate);
      if (holiday) {
        return <span className="holiday-dot" title={holiday.name}></span>;
      }
    }
    return null;
  };

  return (
    <div className="calendar-container" lang="az">
      <ReactCalendar
        onChange={setDate}
        value={date}
        tileContent={tileContent}
        locale="az"
      />
    </div>
  );
};

export default Calendar;
