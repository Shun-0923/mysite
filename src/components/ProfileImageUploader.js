import React, { useState } from 'react';
import axios from 'axios';

const ProfileImageUploader = ({ userId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadStatus('');
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadStatus('ファイルを選択してください。');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('ファイルを選択してください。');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile); // Changed key from 'profileImage' to 'file'
    formData.append('userId', userId); // userId is sent directly

    try {
      setUploadStatus('アップロード中...');
      const response = await axios.post('/api/profile/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadStatus('アップロード成功: ' + response.data.message);
    } catch (error) {
      setUploadStatus('アップロード失敗: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div>
      <h3>プロフィール画像アップロード</h3>
      <input type="file" onChange={handleFileChange} />
      {previewUrl && (
        <div>
          <h4>プレビュー:</h4>
          <img src={previewUrl} alt="プレビュー" style={{ maxWidth: '200px', maxHeight: '200px' }} />
        </div>
      )}
      <button onClick={handleUpload} disabled={!selectedFile}>アップロード</button>
      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  );
};

export default ProfileImageUploader;
