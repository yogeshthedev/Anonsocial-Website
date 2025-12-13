import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateAvatar } from "../features/user/userThunks";
import { useNavigate } from "react-router-dom";

const ChangeAvatar = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.user);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = () => {
    if (!file) return;

    dispatch(updateAvatar(file)).then((res) => {
      if (!res.error) {
        navigate("/me");
      }
    });
  };

  return (
    <div>
      <h2>Change Avatar</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Preview */}
      {preview && (
        <div>
          <img src={preview} alt="Preview" width={120} />
        </div>
      )}

      {/* File Input */}
      <input type="file" accept="image/*" onChange={handleFileChange} />

      <button onClick={handleUpload} disabled={loading || !file}>
        Upload Avatar
      </button>
    </div>
  );
};

export default ChangeAvatar;
