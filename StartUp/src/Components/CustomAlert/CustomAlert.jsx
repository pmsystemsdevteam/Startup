import React from "react";
import "./CustomAlert.scss";
import { IoCheckmark } from "react-icons/io5";
import { AiOutlineExclamation } from "react-icons/ai";
import { IoMdClose } from "react-icons/io";

function CustomAlert({ isOpen, onClose, type = "error", title, messages = [] }) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <IoCheckmark />;
      case "error":
        return <AiOutlineExclamation />;
      case "warning":
        return <AiOutlineExclamation />;
      default:
        return <AiOutlineExclamation />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "success":
        return {
          iconBg: "#128c3c",
          iconBorder: "#128c3c",
          titleColor: "#128c3c",
          messageColor: "#333",
        };
      case "error":
        return {
          iconBg: "#FF3D00",
          iconBorder: "#FF3D00",
          titleColor: "#FF3D00",
          messageColor: "#333",
        };
      case "warning":
        return {
          iconBg: "#FF9800",
          iconBorder: "#FF9800",
          titleColor: "#FF9800",
          messageColor: "#333",
        };
      default:
        return {
          iconBg: "#2196F3",
          iconBorder: "#2196F3",
          titleColor: "#2196F3",
          messageColor: "#333",
        };
    }
  };

  const colors = getColors();

  return (
    <div className="customAlertOverlay" onClick={onClose}>
      <div className="customAlertBox" onClick={(e) => e.stopPropagation()}>
        <button className="closeBtn" onClick={onClose}>
          <IoMdClose />
        </button>

        <div
          className="alertIcon"
          style={{
            backgroundColor: colors.iconBg,
            border: `2px solid ${colors.iconBorder}`,
          }}
        >
          {getIcon()}
        </div>

        <h3 className="alertTitle" style={{ color: colors.titleColor }}>
          {title}
        </h3>

        <div className="alertMessages">
          {messages.length > 0 ? (
            <ul>
              {messages.map((msg, index) => (
                <li key={index} style={{ color: colors.messageColor }}>
                  {msg}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: colors.messageColor }}>Əlavə məlumat yoxdur</p>
          )}
        </div>

        <button
          className="confirmBtn"
          onClick={onClose}
          style={{
            backgroundColor: colors.iconBg,
            border: `1px solid ${colors.iconBorder}`,
          }}
        >
          Bağla
        </button>
      </div>
    </div>
  );
}

export default CustomAlert;
