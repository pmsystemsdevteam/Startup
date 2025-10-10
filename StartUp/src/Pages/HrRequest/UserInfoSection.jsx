import React from "react";

function UserInfoSection({ userData }) {
  return (
    <div className="userInfo">
      <h2>İstifadəçi məlumatları:</h2>
      <form>
        <div className="box">
          <label>Ad soyad</label>
          <p>
            {userData?.first_name || "—"} {userData?.last_name || "—"}
          </p>
        </div>
        <div className="box">
          <label>İşçi nömrəsi</label>
          <p>{userData?.staffnumber || "—"}</p>
        </div>
        <div className="box">
          <label>Vəzifə</label>
          <p>{userData?.jobname || "—"}</p>
        </div>
        <div className="box">
          <label>Şöbə</label>
          <p>{userData?.department || "—"}</p>
        </div>
      </form>
    </div>
  );
}

export default UserInfoSection;
