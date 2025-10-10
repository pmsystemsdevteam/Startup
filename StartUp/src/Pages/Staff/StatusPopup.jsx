import React from "react";
import { IoCheckmark } from "react-icons/io5";
import { AiOutlineExclamation } from "react-icons/ai";

function StatusPopup({ popup, onClose }) {
  return (
    <div className={`popUp ${popup ? "open" : ""}`} onClick={onClose}>
      <div className="button">
        <div
          className="icon"
          style={{
            color: popup === "approve" ? "#128c3c" : "#FF3D00",
            border:
              popup === "approve"
                ? "1.5px solid #128c3c"
                : "1.5px solid #FF3D00",
          }}
        >
          {popup === "approve" && <IoCheckmark />}
          {popup === "cancel" && <AiOutlineExclamation />}
        </div>
        {popup === "approve" && (
          <p style={{ color: "#128c3c" }}>
            Müraciətlər təsdiqləyiciyə göndərildi
          </p>
        )}
        {popup === "cancel" && (
          <p style={{ color: "#FF3D00" }}>Müraciətlər ləğv edildi</p>
        )}
      </div>
    </div>
  );
}

export default StatusPopup;
