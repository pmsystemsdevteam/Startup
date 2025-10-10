import React from "react";

function SummarySection({
  userData,
  formData,
  calculateCalendarDays,
  people,
  onSubmit,
  onCancel,
}) {
  return (
    <div className="summaryBox">
      <h2>Ərizənin xülasəsi</h2>
      <div className="info">
        <div className="little">
          <p>Ad, soyad:</p>
          <p>
            {userData?.first_name || "—"} {userData?.last_name || "—"}
          </p>
        </div>
        <div className="little">
          <p>Vəzifə:</p>
          <p>{userData?.jobname || "—"}</p>
        </div>
        <div className="little">
          <p>İcazə növü:</p>
          <p>{formData.selectedType}</p>
        </div>
        <div className="little">
          <p>Başlama tarixi:</p>
          <p>
            {formData.dailyStart || "—"} / {formData.startTime || "—"}
          </p>
        </div>
        <div className="little">
          <p>Bitmə tarixi:</p>
          <p>
            {formData.dailyEnd || "—"} / {formData.endTime || "—"}
          </p>
        </div>
        <div className="little">
          <p>İşə çıxma tarixi:</p>
          <p>{formData.date ? formData.date.format("DD.MM.YYYY") : "—"}</p>
        </div>
        <div className="little">
          <p>Təqvim günü sayı:</p>
          <p>
            {formData.dailyStart && formData.dailyEnd
              ? `${calculateCalendarDays()} gün`
              : "—"}
          </p>
        </div>
        <div className="little">
          <p>Sənəd nömrəsi:</p>
          <p>{userData?.document || "444"}</p>
        </div>
        <div className="little">
          <p>Şöbə:</p>
          <p>{userData?.department || "—"}</p>
        </div>
        <div className="little">
          <p>Yüklənmiş sənədlər:</p>
          <p
            style={{
              color:
                formData.files.length > 0 || userData?.documents?.length > 0
                  ? "#128C3C"
                  : "#f01717ff",
              fontWeight: "bold",
            }}
          >
            {formData.files.length > 0 || userData?.documents?.length > 0
              ? "Yüklənib"
              : "Yoxdur"}
          </p>
        </div>
        <div className="little">
          <p>Təsdiq edəcək şəxslər:</p>
          <p style={{ fontWeight: "bold" }}>
            {formData.selectedOrder.length > 0
              ? formData.selectedOrder
                  .map((id, index) => {
                    const person = people.find((p) => p.id === id);
                    return person ? `${index + 1}. ${person.jobname}` : null;
                  })
                  .filter(Boolean)
                  .join(", ")
              : "—"}
          </p>
        </div>
        <div className="buttons">
          <div className="button" onClick={onCancel}>
            Sil
          </div>
          <div className="button" onClick={onSubmit}>
            Göndər
          </div>
        </div>
      </div>
    </div>
  );
}

export default SummarySection;
