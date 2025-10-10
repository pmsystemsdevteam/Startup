import React, { useState, useRef } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { IoMdCheckmark } from "react-icons/io";
import useClickOutside from "../../hooks/useClickOutside";

function ApproverSection({ people, selectedOrder, onSelectionChange }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Hook istifadə et - kənara klik
  useClickOutside(wrapperRef, () => setOpen(false));

  const toggleTick = (id) => {
    const exists = selectedOrder.includes(id);
    if (exists) {
      onSelectionChange(selectedOrder.filter((personId) => personId !== id));
    } else {
      onSelectionChange([...selectedOrder, id]);
    }
  };

  const getSelectedPeopleNames = () => {
    return selectedOrder
      .map((id) => {
        const person = people.find((p) => p.id === id);
        return person ? person.name : null;
      })
      .filter(Boolean)
      .join(", ");
  };

  const isPersonSelected = (id) => selectedOrder.includes(id);

  const getPersonOrderNumber = (id) => {
    const index = selectedOrder.indexOf(id);
    return index !== -1 ? index + 1 : null;
  };

  return (
    <div className="confirmBox">
      <h2>Təsdiq edəcək şəxslər</h2>
      <div 
        className="chosenPerson" 
        onClick={() => setOpen(!open)}
        ref={wrapperRef}
      >
        <label>Təsdiq</label>
        <div className={`icon ${open ? "active" : ""}`}>
          <MdOutlineKeyboardArrowDown />
        </div>
        <p>
          {selectedOrder.length > 0
            ? getSelectedPeopleNames()
            : people.length > 0
            ? "Təsdiq edəcək şəxsi seçin"
            : "Uyğun təsdiqləyici yoxdur"}
        </p>
        <div
          className={`subMenu ${!open ? "open" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          {people.length > 0 ? (
            people.map((person) => {
              const isSelected = isPersonSelected(person.id);
              const orderNum = getPersonOrderNumber(person.id);

              return (
                <div
                  key={person.id}
                  className={`littleBox ${isSelected ? "onclick" : ""}`}
                  onClick={() => toggleTick(person.id)}
                >
                  <div className={`square ${isSelected ? "onclickBox" : ""}`}>
                    {isSelected && <IoMdCheckmark />}
                  </div>
                  <span>
                    {person.name} — {person.jobname}
                    {orderNum && (
                      <span
                        style={{
                          marginLeft: "8px",
                          fontWeight: "bold",
                          color: "#128c3c",
                        }}
                      >
                        (Sıra: {orderNum})
                      </span>
                    )}
                  </span>
                </div>
              );
            })
          ) : (
            <p style={{ padding: "10px", color: "#888" }}>
              Yüklənir və ya təsdiqləyici tapılmadı
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApproverSection;
