import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/az";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { IoCalendarClearOutline } from "react-icons/io5";
import PermissionTypeDropdown from "./PermissionTypeDropdown";
import HourlyTimeInput from "./HourlyTimeInput";
import DateRangeInput from "./DateRangeInput";

dayjs.locale("az");
dayjs.extend(customParseFormat);

function PermissionInfoSection({
  formData,
  updateFormData,
  calculateCalendarDays,
}) {
  // --- Helper: təhlükəsiz tarix oxuyucu ---
  const parseDate = (val) => {
    if (!val) return null;
    if (dayjs.isDayjs(val)) return val.startOf("day");
    if (val instanceof Date) return dayjs(val).startOf("day");
    // String gəlirsə, sərt formatla yoxla
    const parsed =
      dayjs(val, "DD.MM.YYYY", true).isValid()
        ? dayjs(val, "DD.MM.YYYY", true)
        : dayjs(val, "YYYY-MM-DD", true).isValid()
        ? dayjs(val, "YYYY-MM-DD", true)
        : dayjs(val); // son şans (MUI-dən gələ bilər)
    return parsed.isValid() ? parsed.startOf("day") : null;
  };

  // --- İşə çıxma tarixini avtomatik hesabla ---
  useEffect(() => {
    // Saatlıq seçilibsə, işə çıxma tarixi hesablamasını dayandır
    if (formData.selectedType === "Saatlıq") {
      return;
    }

    const start = parseDate(formData.dailyStart);
    let end = parseDate(formData.dailyEnd);

    // Bitmə yoxdursa heç nə yazma
    if (!end && !start) {
      updateFormData("date", null);
      return;
    }
    // Yalnız başlanğıc verilibsə: end = start
    if (!end && start) end = start;

    // end < start olarsa, end-i start-a bərabərlə (təhlükəsiz)
    if (start && end && end.isBefore(start)) {
      end = start;
    }

    // Növbəti iş günü: end + 1
    let next = end.add(1, "day");
    const dow = next.day(); // 0 = bazar, 6 = şənbə
    if (dow === 6) next = next.add(2, "day"); // şənbə → bazar ertəsi
    else if (dow === 0) next = next.add(1, "day"); // bazar → bazar ertəsi

    updateFormData("date", next); // dayjs obyekt saxlayırıq
  }, [formData.dailyStart, formData.dailyEnd, formData.selectedType]); // selectedType də əlavə edildi

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

        {/* Günlük və aylıq yalnız Saatlıq olmadıqda göstər */}
        {formData.selectedType !== "Saatlıq" && (
          <DateRangeInput
            dailyStart={formData.dailyStart}
            dailyEnd={formData.dailyEnd}
            onStartChange={(date) => updateFormData("dailyStart", date)}
            onEndChange={(date) => updateFormData("dailyEnd", date)}
          />
        )}

        {/* İşə çıxma tarixi yalnız Saatlıq olmadıqda göstər */}
        {formData.selectedType !== "Saatlıq" && (
          <div className="box5">
            <label>İşə çıxma tarixi</label>
            <p>
              {formData.date && dayjs.isDayjs(formData.date)
                ? formData.date.format("DD.MM.YYYY")
                : parseDate(formData.date)?.format("DD.MM.YYYY") || "—"}
            </p>
          </div>
        )}

        {/* Təqvim günü sayı yalnız Saatlıq olmadıqda göstər */}
        {formData.selectedType !== "Saatlıq" && (
          <div className="box">
            <label>Təqvim günü sayı</label>
            <p>
              {formData.dailyStart && formData.dailyEnd
                ? `${calculateCalendarDays()} gün`
                : ""}
            </p>
          </div>
        )}

        {formData.selectedType === "Digər" && (
          <div className="box6">
            <label>Açıqlama</label>
            <textarea
              placeholder="İcazə səbəbi və əlavə məlumatlar....."
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
            
            ></textarea>
          </div>
        )}
      </form>
    </div>
  );
}

export default PermissionInfoSection;
