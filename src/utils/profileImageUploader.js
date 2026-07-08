import AWS from 'aws-sdk';
import sharp from 'sharp';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

export const uploadProfileImage = async (userId, fileBuffer, mimetype) => {
  if (!fileBuffer || !mimetype) {
    throw new Error('File buffer and mimetype are required.');
  }

  // 画像のリサイズとフォーマット変換
  const resizedBuffer = await sharp(fileBuffer)
    .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
    .toBuffer(); // JPEG変換を意図的に省略

  // ファイル名はユーザーIDと元々のファイル拡張子を使用
  const fileExtension = mimetype.split('/')[1];
  const fileName = `profile_images/${userId}.${fileExtension}`;
  
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: resizedBuffer,
    ContentType: mimetype, // 元のMIMEタイプを使用
    ACL: 'public-read' // 公開読み取り可能に設定
  };

  try {
    await s3.upload(params).promise();
    // 成功した場合、S3の公開URLをそのまま返す
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw new Error('Failed to upload profile image.');
  }
};

export const getProfileImageUrl = (userId, fileExtension = 'jpeg') => {
  // 実際にはアップロード時に保存された拡張子をDBなどから取得すべきだが、ここでは簡略化
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/profile_images/${userId}.${fileExtension}`;
};
