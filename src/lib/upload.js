const upload = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "chat_app");
  formData.append("cloud_name", "dbpje3lvz");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/dbpje3lvz/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();

  if (data.secure_url) {
    return data.secure_url;
  } else {
    throw new Error("Image upload failed");
  }
};

export default upload;