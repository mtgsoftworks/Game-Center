import React, { useState, useEffect } from 'react';
import { Avatar, Button, LinearProgress, Box } from '@mui/material';

const AvatarUpload = ({ currentAvatar, onUpload }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(currentAvatar);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setPreview(currentAvatar);
  }, [currentAvatar]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await onUpload(file, (p) => setProgress(p));
      setUploading(false);
      setFile(null);
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  return (
    <Box display="flex" alignItems="center" mb={2}>
      <Avatar src={preview} sx={{ width: 64, height: 64, mr: 2 }} />
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="avatar-upload-input"
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor="avatar-upload-input">
        <Button variant="outlined" component="span">Resim Seç</Button>
      </label>
      <Button
        variant="contained"
        onClick={handleUpload}
        disabled={!file || uploading}
        sx={{ ml: 1 }}
      >Yükle</Button>
      {uploading && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ width: '100%', ml: 2 }}
        />
      )}
    </Box>
  );
};

export default AvatarUpload; 