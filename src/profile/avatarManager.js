// src/profile/avatarManager.js
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

/**
 * プロフィール画像をS3にアップロードします。
 * @param {string} userId - ユーザーID
 * @param {Buffer} imageBuffer - アップロードする画像のバッファ
 * @param {string} mimeType - 画像のMIMEタイプ (例: 'image/jpeg')
 * @returns {Promise<string>} アップロードされた画像のURL
 */
export const uploadAvatar = async (userId, imageBuffer, mimeType) => {
  if (!userId || !imageBuffer || !mimeType) {
    throw new Error('Missing required parameters for avatar upload.');
  }

  const fileExtension = mimeType.split('/')[1];
  // 許可されたMIMEタイプのみをチェック
  if (!['jpeg', 'png', 'gif', 'image/jpeg', 'image/png', 'image/gif'].includes(mimeType)) {
    throw new Error('Unsupported file type.');
  }

  const fileName = `avatars/${userId}/${uuidv4()}.${fileExtension}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: imageBuffer,
    ContentType: mimeType,
    ACL: 'public-read' // 公開読み取り可能に設定
  };

  try {
    await s3.upload(params).promise();
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error('Error uploading avatar to S3:', error);
    throw new Error('Failed to upload avatar.');
  }
};

/**
 * ユーザーの既存のプロフィール画像を削除します。
 * @param {string} userId - ユーザーID
 * @param {string} imageUrl - 削除する画像のURL
 * @returns {Promise<void>}
 */
export const deleteAvatar = async (userId, imageUrl) => {
  if (!userId || !imageUrl) {
    throw new Error('Missing required parameters for avatar deletion.');
  }

  // URLからS3のキーを抽出
  const urlParts = imageUrl.split('/');
  const key = urlParts.slice(urlParts.indexOf('avatars')).join('/');

  // ユーザーが自分の画像のみを削除できるようにする基本的なチェック
  if (!key.startsWith(`avatars/${userId}/`)) {
    console.warn(`User ${userId} attempted to delete an unauthorized object: ${key}`);
    throw new Error('Unauthorized deletion attempt.');
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: key
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('Error deleting avatar from S3:', error);
    throw new Error('Failed to delete avatar.');
  }
};