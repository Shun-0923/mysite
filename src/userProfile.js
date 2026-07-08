import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// 画像保存設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ユーザーIDに基づいてディレクトリを作成し、パーソナルな保存領域を提供
    const userId = req.headers['x-user-id'] || 'anonymous'; // ユーザーIDをヘッダーから取得
    const uploadPath = path.join(__dirname, '../uploads/profile_images', userId);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // 元のファイル名をそのまま使用
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MBまで
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Images Only!'));
    }
  }
});

// プロフィール画像アップロードエンドポイント
router.post('/uploadProfileImage', upload.single('profileImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  // 実際のアプリケーションでは、ユーザーIDとファイルパスをDBに保存します。
  // ここでは簡略化のため、ファイル名と保存パスを返します。
  const userId = req.headers['x-user-id'] || 'anonymous';
  const filePath = path.join('uploads/profile_images', userId, req.file.filename);
  res.status(200).json({ message: 'Profile image uploaded successfully', filename: req.file.filename, path: filePath });
});

// プロフィール画像取得エンドポイント
router.get('/profileImage/:userId/:filename', (req, res) => {
  const userId = req.params.userId;
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, '../uploads/profile_images', userId, filename);

  // ファイルが存在するか確認し、存在すれば送信
  fs.access(imagePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('Image not found.');
    }
    res.sendFile(imagePath);
  });
});

export default router;
