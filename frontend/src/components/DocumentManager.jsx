import { useEffect, useRef, useState } from "react";

import { uploadDocument, getMyDocuments } from "../api/documentApi";

const ALLOWED_EXTENSIONS = [".pdf", ".docx"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const getFileType = (name = "", mimeType = "") =>
  mimeType === "application/pdf" || name.toLowerCase().endsWith(".pdf")
    ? "PDF"
    : "DOCX";

const DocumentManager = () => {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [dragging, setDragging] = useState(false);

  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch documents when the component loads.
  const fetchDocuments = async () => {
    try {
      setFetching(true);
      const response = await getMyDocuments();
      setDocuments(response.documents || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load documents");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const clearInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Validate a file from the picker or from a drop, then keep it if it is valid.
  const validateAndSelect = (file) => {
    setError("");
    setSuccess("");
    setProgress(0);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const extension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setError("Only PDF and DOCX files are allowed");
      setSelectedFile(null);
      clearInput();
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size cannot exceed 10 MB");
      setSelectedFile(null);
      clearInput();
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (event) => {
    validateAndSelect(event.target.files?.[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (loading) return;

    const file = event.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      // Keep the hidden input in sync with the dropped file.
      const transfer = new DataTransfer();
      transfer.items.add(file);
      fileInputRef.current.files = transfer.files;
    }
    validateAndSelect(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError("");
    setProgress(0);
    clearInput();
  };

  // Upload the selected document.
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a document first");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      setProgress(0);

      const response = await uploadDocument(selectedFile, (event) => {
        if (event.total) {
          setProgress(Math.round((event.loaded * 100) / event.total));
        }
      });

      setSuccess(response.message);
      setSelectedFile(null);
      clearInput();

      // Refresh the uploaded documents list.
      await fetchDocuments();
    } catch (err) {
      setError(err.response?.data?.message || "Document upload failed");
    } finally {
      setLoading(false);
    }
  };

  // Convert bytes into KB or MB.
  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Format upload date.
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <section className="document-manager">
      <div className="document-heading">
        <div>
          <h2>My documents</h2>
          <p>PDF and Word files you upload are kept in your own library.</p>
        </div>

        <span className="document-count">
          {documents.length} {documents.length === 1 ? "document" : "documents"}
        </span>
      </div>

      {/* Upload area */}
      <div className="upload-card">
        <label
          className={`dropzone ${dragging ? "is-dragging" : ""} ${
            loading ? "is-disabled" : ""
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            if (!loading) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            disabled={loading}
            className="visually-hidden"
          />

          <span className="dropzone-icon" aria-hidden="true">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 16V4" />
              <path d="m6 10 6-6 6 6" />
              <path d="M4 20h16" />
            </svg>
          </span>

          <span className="dropzone-title">
            {dragging
              ? "Drop to select"
              : "Drag a file here, or click to browse"}
          </span>
          <span className="dropzone-sub">PDF or DOCX, up to 10 MB</span>
        </label>

        {selectedFile && (
          <div className="upload-actions">
            <div className="selected-file">
              <span
                className={`file-badge is-${getFileType(
                  selectedFile.name,
                ).toLowerCase()}`}
              >
                {getFileType(selectedFile.name)}
              </span>

              <div className="selected-file-info">
                <strong>{selectedFile.name}</strong>
                <small>{formatFileSize(selectedFile.size)}</small>
              </div>

              <button
                type="button"
                className="remove-file"
                onClick={handleRemoveFile}
                disabled={loading}
                aria-label={`Remove ${selectedFile.name}`}
              >
                Remove
              </button>
            </div>

            <button
              type="button"
              className="btn-primary upload-button"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload document"}
            </button>
          </div>
        )}

        {loading && (
          <div className="upload-progress">
            <div className="progress-info">
              <span>Uploading document...</span>
              <span>{progress}%</span>
            </div>

            <div
              className="progress-track"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="document-alert error-alert" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="document-alert success-alert" role="status">
            {success}
          </div>
        )}
      </div>

      {/* Uploaded documents */}
      <div className="documents-list">
        <div className="documents-list-heading">
          <h3>Uploaded documents</h3>

          <button
            type="button"
            className="btn-secondary"
            onClick={fetchDocuments}
            disabled={fetching}
          >
            {fetching ? "Loading..." : "Refresh"}
          </button>
        </div>

        {fetching ? (
          <p className="empty-documents">Loading documents...</p>
        ) : documents.length === 0 ? (
          <div className="empty-documents">
            <strong>No documents yet</strong>
            <p>Upload a PDF or DOCX above to get started.</p>
          </div>
        ) : (
          <div className="document-table-wrapper">
            <table className="document-table">
              <thead>
                <tr>
                  <th scope="col">Document</th>
                  <th scope="col">Size</th>
                  <th scope="col">Uploaded on</th>
                </tr>
              </thead>

              <tbody>
                {documents.map((document) => {
                  const type = getFileType(
                    document.originalName,
                    document.mimeType,
                  );

                  return (
                    <tr key={document.id}>
                      <td>
                        <div className="document-name">
                          <span
                            className={`file-badge is-${type.toLowerCase()}`}
                          >
                            {type}
                          </span>
                          <span>{document.originalName}</span>
                        </div>
                      </td>

                      <td>{formatFileSize(document.fileSize)}</td>
                      <td>{formatDate(document.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default DocumentManager;
