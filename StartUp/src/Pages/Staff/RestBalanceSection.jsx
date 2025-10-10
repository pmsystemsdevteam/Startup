import React from "react";
import Back from "../../Video/back.gif";

function RestBalanceSection({ permissionDay }) {
  return (
    <div className="restBalance">
      <h2>İllik məzuniyyət balansı:</h2>
      <div className="box" style={{ backgroundImage: `url(${Back})` }}>
        <div className="blur">
          <span>Qalıq icazə günləri</span>
          <p>{permissionDay ?? "—"}</p>
          <span>gün qalıb</span>
        </div>
      </div>
    </div>
  );
}

export default RestBalanceSection;
