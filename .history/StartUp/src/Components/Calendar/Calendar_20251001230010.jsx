import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import './LeavePermissionModal.scss';

const LeavePermissionModal = ({ isOpen, onClose, countryCode, year }) => {
  const [holidays, setHolidays] = useState([]);
  const [date, setDate] = useState(new Date());
  const [formData, setFormData] = useState({
    employeeName: '',
    leaveType: '',
    reason: '',
    startDate: null,
    endDate: null,
  });

  // API açarı environmentdən gələcək
  const API_KEY = process.env.REACT_APP_CALENDARIFIC_API_KEY;

  useEffect(() => {
    if (!isOpen) return;
    const fetchHolidays = async () => {
      try {
        const response = await fetch(
          `https://calendarific.com/api/v2/holidays?api_key=${API_KEY}&country=${countryCode}&year=${year}`
        );
        const data = await response.json();
        if (data.response && data.response.holidays) {
          // Azərbaycan dilində adlar varsa, onları istifadə edirik
          const holidaysAz = data.response.holidays.map((holiday) => ({
            date: holiday.date.iso,
            name: holiday.name_az || holiday.name,  // name_az yoxdursa, default name
          }));
          setHolidays(holidaysAz);
        }
      } catch (error) {
        console.error('Tətil günləri alınarkən xəta:', error);
      }
    };
    fetchHolidays();
  }, [isOpen, API_KEY, countryCode, year]);

  if (!isOpen) return null;

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
    setFormData({...formData, startDate: selectedDate});
  };

  const isHoliday = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return holidays.find(h => h.date === dateStr);
  };

  const handleInputChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Burada icazə müraciəti göndərmə loqikası olacaq
    console.log('Form submitted:', formData);
  };

  // Calendar üçün günləri xüsusi rənglə işarələyək
  const tileContent = ({ date, view }) => {
    if (view === 'month' && isHoliday(date)) {
      return <div className="holiday-marker" title={isHoliday(date).name}></div>;
    }
    return null;
  };

  return (
    <div className="popUp open" role="dialog" aria-modal="true">
      <div className="normalPop">
        <button
          className="icon close-btn"
          onClick={onClose}
          aria-label="Bağla"
          type="button"
        >
          ×
        </button>
        <h2>İcazə Formu</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="employeeName">İşçinin adı</label>
          <input
            type="text"
            id="employeeName"
            name="employeeName"
            placeholder="Adınızı daxil edin"
            value={formData.employeeName}
            onChange={handleInputChange}
            required
          />

          <label htmlFor="leaveType">İcazə növü</label>
          <select
            name="leaveType"
            id="leaveType"
            value={formData.leaveType}
            onChange={handleInputChange}
            required
          >
            <option value="">Seçin</option>
            <option value="illik">İllik İcazə</option>
            <option value="xeste">Xəstəlik İcazəsi</option>
            <option value="shexsi">Şəxsi İcazə</option>
          </select>

          <label>Başlama tarixi</label>
          <Calendar
            onChange={(date) => setFormData({ ...formData, startDate: date })}
            value={formData.startDate || date}
            tileContent={tileContent}
          />

          <label>Bitmə tarixi</label>
          <Calendar
            onChange={(date) => setFormData({ ...formData, endDate: date })}
            value={formData.endDate || date}
            tileContent={tileContent}
          />

          <label htmlFor="reason">Səbəb</label>
          <textarea
            id="reason"
            name="reason"
            placeholder="İcazənin səbəbini daxil edin"
            value={formData.reason}
            onChange={handleInputChange}
            required
          />

          <div className="buttons">
            <button className="button submit-btn" type="submit">
              Göndər
            </button>
            <button
              className="button cancel-btn"
              type="button"
              onClick={onClose}
            >
              İmtina
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeavePermissionModal;
