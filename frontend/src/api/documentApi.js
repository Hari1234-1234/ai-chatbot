import axiosInstance from "./axiosInstance";

// Upload document.
export const uploadDocument = async (file, onUploadProgress) => {
  const formData = new FormData();

  // Add the selected file.
  formData.append("document", file);

  const response = await axiosInstance.post("/documents/upload", formData, {
    onUploadProgress,
  });

  return response.data;
};

// Get uploaded documents.
export const getMyDocuments = async () => {
  const response = await axiosInstance.get("/documents");

  return response.data;
};
