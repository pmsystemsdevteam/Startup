import React from "react";
import { Link } from "react-router-dom";

function PageFooter() {
  return (
    <div className="copy">
      © {new Date().getFullYear()}{" "}
      <Link to={"https://pmsystems.az/"} target="_blank" className="linkk">
        PM Systems
      </Link>{" "}
      tərəfindən hazırlanmışdır.
    </div>
  );
}

export default PageFooter;
