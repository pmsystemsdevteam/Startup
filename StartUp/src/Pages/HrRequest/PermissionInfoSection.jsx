import React, { useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/az";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { IoCalendarClearOutline } from "react-icons/io5";
import PermissionTypeDropdown from "./PermissionTypeDropdown";
import HourlyTimeInput from "./HourlyTimeInput";
import DateRangeInput from "./DateRangeInput";

function PermissionInfoSection({ formData, updateFormData, calculateCalendarDays }) {
  const [open, setOpen] = useState({
    calendar: true,
  });

  dayjs.locale("az");

  const toggle = (id) => setOpen((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="allowInfo">
      <h2>Ərizə məlumatı:</h2>
      <form>
        <PermissionTypeDropdown
          selectedType={formData.selectedType}
          onTypeSelect={(type) => updateFormData("selectedType", type)}
        />

        <div className="box2">
          <label>Sənəd nömrəsi</label>
          <p>444</p>
        </div>

        {formData.selectedType === "Saatlıq" && (
          <HourlyTimeInput
            startTime={formData.startTime}
            endTime={formData.endTime}
            onStartTimeChange={(time) => updateFormData("startTime", time)}
            onEndTimeChange={(time) => updateFormData("endTime", time)}
          />
        )}

        <DateRangeInput
          dailyStart={formData.dailyStart}
          dailyEnd={formData.dailyEnd}
          onStartChange={(date) => updateFormData("dailyStart", date)}
          onEndChange={(date) => updateFormData("dailyEnd", date)}
        />

        <div className="box5">
          <label>İşə çıxma tarixi</label>
          <div className="icon" onClick={() => toggle("calendar")}>
            <IoCalendarClearOutline />
          </div>
          <div className={`datebox ${open.calendar ? "open" : ""}`}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="az">
              <DateCalendar
                value={formData.date || dayjs()}
                onChange={(newDate) => updateFormData("date", newDate)}
                views={["day"]}
                sx={{
                  "& .MuiPickersDay-root": { borderRadius: "8px" },
                  "& .MuiPickersCalendarHeader-root": { mb: 1 },
                }}
              />
            </LocalizationProvider>
          </div>
          <p>{formData.date ? formData.date.format("DD.MM.YYYY") : "—"}</p>
        </div>

        <div className="box">
          <label>Təqvim günü sayı</label>
          <p>
            {formData.dailyStart && formData.dailyEnd
              ? `${calculateCalendarDays()} gün`
              : ""}
          </p>
        </div>

        <div className="box6">
          <label>Açıqlama</label>
          <textarea
            placeholder="İcazə səbəbi və əlavə məlumatlar....."
            value={formData.description}
            onChange={(e) => updateFormData("description", e.target.value)}
            required
          ></textarea>
        </div>
      </form>
    </div>
  );
}

export default PermissionInfoSection;
