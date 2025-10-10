import React, { useRef } from "react";
import { BsDownload } from "react-icons/bs";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function DocumentUploadSection({ files, onFilesChange, multiple, onSelect }) {
  const inputRef = useRef(null);

  const openPicker = () => inputRef.current?.click();

  const handleChange = (e) => {
    const picked = Array.from(e.target.files || []);
    onFilesChange(picked);
    onSelect?.(picked);
  };

  return (
    <div className="documentSend">
      <h2>Qoşma sənədlər</h2>
      <div className="doxBox">
        <div className="icon">
          <BsDownload />
        </div>
        <p>Sənədləri seçin və ya buraya atın (pdf, Docx)</p>
        <Box className="fileItem">
          <Button
            variant="contained"
            onClick={openPicker}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Sənədləri seçin
          </Button>
          <input
            ref={inputRef}
            hidden
            type="file"
            multiple={multiple}
            onChange={handleChange}
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            required
          />
          {files.length > 0 && (
            <Box mt={1}>
              {files.map((f, i) => (
                <Typography key={i} variant="body2" component="div">
                  {f.name} — {(f.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      </div>
    </div>
  );
}

export default DocumentUploadSection;
