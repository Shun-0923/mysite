const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 画像保存先の設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ユーザーIDに基づいてディレクトリを作成
    const userDir = req.user && req.user.id ? req.user.id : 'anonymous';
    const uploadDir = path.join(__dirname, '../../uploads/profile_images', userDir);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // オリジナルファイル名をそのまま使用
    cb(null, file.originalname);
  }
});

// ファイルフィルターの設定（画像のみ許可、サイズ制限）
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: Only images (jpeg, jpg, png, gif) are allowed!'));
  }
}).single('profileImage');

exports.uploadProfileImage = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // データベースにファイルパスを保存するなどの処理
    const userDir = req.user && req.user.id ? req.user.id : 'anonymous';
    const imageUrl = `/uploads/profile_images/${userDir}/${req.file.filename}`;
    // 例: User.findByIdAndUpdate(req.user.id, { profileImageUrl: imageUrl }, ...) 
    res.status(200).json({ message: 'Profile image uploaded successfully!', imageUrl: imageUrl });
  });
};

// 既存の画像削除機能（例）
exports.deleteProfileImage = (req, res) => {
  const userDir = req.user && req.user.id ? req.user.id : 'anonymous';
  const imagePath = path.join(__dirname, '../../uploads/profile_images', userDir, req.body.filename);
  fs.unlink(imagePath, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({ message: 'File not found.' });
      }
      return res.status(500).json({ message: 'Failed to delete image.', error: err.message });
    }
    res.status(200).json({ message: 'Profile image deleted successfully.' });
  });
};
