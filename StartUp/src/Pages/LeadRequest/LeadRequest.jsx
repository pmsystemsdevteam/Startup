import "./LeadRequest.scss";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { isAuthenticated, getUserId, logout } from "../../api";
import Loading from "../../Components/Loading/Loading";
import RestBalanceSection from "./RestBalanceSection";
import UserInfoSection from "./UserInfoSection";
import PermissionInfoSection from "./PermissionInfoSection";
import DocumentUploadSection from "./DocumentUploadSection";
import SummarySection from "./SummarySection";
import StatusPopup from "./StatusPopup";
import PageFooter from "./PageFooter";
import LeadApproverSection from "./LeadApproverSection";

function LeadRequest({ multiple = true, onSelect }) {
  const navigate = useNavigate();

  // State management
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [popup, setPopup] = useState(null);
  const [people, setPeople] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    selectedType: "Ərizə növü seçin",
    startTime: "",
    endTime: "",
    dailyStart: "",
    dailyEnd: "",
    date: null,
    description: "",
    files: [],
    selectedOrder: [],
  });

  // Fetch user data
  async function fetchUserData(userId) {
    try {
      const res = await api.get(`/api/users/${userId}/`, {});
      setUserData(res.data);
      return res.data;
    } catch (err) {
      console.error("Employee fetch error:", err);
      setError("Məlumat alına bilmədi");
    } finally {
      setLoading(false);
    }
  }

  // Fetch approvers - CEO üçün BOSS, digərləri üçün CEO
  async function fetchApprovers(companyId, currentUserJobType) {
    try {
      const res = await api.get(`/api/users/`, {});
      let filtered = [];

      if (currentUserJobType?.toLowerCase() === "ceo") {
        // CEO-dursa, yalnız BOSS göstər
        filtered = res.data
          .filter((u) => u.jobtype?.toLowerCase() === "boss")
          .map((u) => ({
            id: u.id,
            name: `${u.first_name} ${u.last_name}`,
            jobname: u.jobname,
            jobtype: u.jobtype,
          }));
      } else {
        // CEO deyilsə, yalnız CEO göstər
        filtered = res.data
          .filter(
            (u) =>
              u.company?.id === companyId && u.jobtype?.toLowerCase() === "ceo"
          )
          .map((u) => ({
            id: u.id,
            name: `${u.first_name} ${u.last_name}`,
            jobname: u.jobname,
            jobtype: u.jobtype,
          }));
      }

      setPeople(filtered);
    } catch (err) {
      console.error("Approvers fetch error:", err);
    }
  }

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    const userId = getUserId();
    if (!userId) {
      logout();
      navigate("/login");
      return;
    }
    fetchUserData(userId).then((data) => {
      if (data?.company?.id) {
        fetchApprovers(data.company.id, data.jobtype);
      }
    });
  }, [navigate]);

  // Update form data
  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate calendar days
  const calculateCalendarDays = () => {
    if (formData.dailyStart && formData.dailyEnd) {
      return Math.ceil(
        (new Date(formData.dailyEnd.split(".").reverse().join("-")) -
          new Date(formData.dailyStart.split(".").reverse().join("-"))) /
          (1000 * 60 * 60 * 24)
      );
    }
    return 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    const errors = [];

    if (formData.selectedType === "Ərizə növü seçin") {
      errors.push("• Ərizə növü seçilməyib.");
    }

    if (formData.selectedType === "Saatlıq") {
      if (!formData.startTime) errors.push("• Başlama vaxtı daxil edilməyib.");
      if (!formData.endTime) errors.push("• Bitmə vaxtı daxil edilməyib.");
    }

    if (!formData.dailyStart) {
      errors.push("• Başlama tarixi daxil edilməyib.");
    }
    if (!formData.dailyEnd) {
      errors.push("• Bitmə tarixi daxil edilməyib.");
    }

    const calendarDays = calculateCalendarDays();
    const permissionDay = userData?.permission_day ?? 0;
    if (calendarDays > permissionDay) {
      errors.push(
        `• Təqvim günü sayı (${calendarDays} gün) qalıq icazə günlərindən (${permissionDay} gün) çoxdur!`
      );
    }

    if (!formData.date) {
      errors.push("• İşə çıxma tarixi seçilməyib.");
    }

    if (!formData.description.trim()) {
      errors.push("• Açıqlama sahəsi boş buraxıla bilməz.");
    }

    if (formData.files.length === 0) {
      errors.push("• Qoşma sənəd yüklənməyib.");
    }

    if (formData.selectedOrder.length === 0) {
      errors.push("• Təsdiq edəcək şəxs seçilməyib.");
    }

    if (errors.length > 0) {
      alert("Formu göndərmək üçün xətaları düzəldin:\n\n" + errors.join("\n"));
      setSubmitLoading(false);
      return;
    }

    setSubmitLoading(true);

    try {
      const submitFormData = new FormData();
      submitFormData.append("documentType", formData.selectedType || "");

      if (formData.selectedType === "Saatlıq") {
        submitFormData.append("time_start", formData.startTime);
        submitFormData.append("time_end", formData.endTime);
      }

      submitFormData.append(
        "date_start",
        formData.dailyStart ? formData.dailyStart.split(".").reverse().join("-") : ""
      );
      submitFormData.append(
        "date_end",
        formData.dailyEnd ? formData.dailyEnd.split(".").reverse().join("-") : ""
      );
      submitFormData.append(
        "start_job_date",
        formData.date ? formData.date.format("YYYY-MM-DD") : ""
      );
      submitFormData.append("calendar_count", calendarDays);
      submitFormData.append("document_number", "444");
      submitFormData.append("description", formData.description || "");

      formData.selectedOrder.forEach((id) => {
        submitFormData.append("accept_person", id);
      });

      formData.files.forEach((file) => {
        submitFormData.append("document", file);
      });

      const res = await api.post(`/api/hr/forms/`, submitFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setPopup("approve");
      setTimeout(() => {
        navigate("/staff/permission-history");
      }, 2000);
    } catch (err) {
      console.error("Form submit error:", err.response?.data || err);
      setPopup("cancel");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    setPopup("cancel");
  };

  if (loading) return <Loading />;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <section id="staffPage">
      {submitLoading && <Loading />}

      <StatusPopup popup={popup} onClose={() => setPopup(null)} />

      <h1>İcazə tələb formu</h1>

      <RestBalanceSection permissionDay={userData?.permission_day} />

      <UserInfoSection userData={userData} />

      <PermissionInfoSection
        formData={formData}
        updateFormData={updateFormData}
        calculateCalendarDays={calculateCalendarDays}
      />

      <DocumentUploadSection
        files={formData.files}
        onFilesChange={(files) => updateFormData("files", files)}
        multiple={multiple}
        onSelect={onSelect}
      />

      <LeadApproverSection
        people={people}
        selectedOrder={formData.selectedOrder}
        onSelectionChange={(order) => updateFormData("selectedOrder", order)}
      />

      <SummarySection
        userData={userData}
        formData={formData}
        calculateCalendarDays={calculateCalendarDays}
        people={people}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />

      <PageFooter />
    </section>
  );
}

export default LeadRequest;
