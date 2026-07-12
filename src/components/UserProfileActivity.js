import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserProfileActivity = ({ userId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        // ユーザーIDが提供されている場合のみアクティビティをフェッチ
        if (userId) {
          const response = await axios.get(`/api/users/${userId}/activities`);
          setActivities(response.data);
        }
      } catch (err) {
        // エラーが発生した場合はコンソールに出力し、ユーザーにメッセージを表示
        console.error('Failed to fetch user activities:', err);
        setError('アクティビティの取得中に問題が発生しました。');
      } finally {
        // ロード状態を常に終了
        setLoading(false);
      }
    };

    fetchActivities();
  }, [userId]);

  if (loading) {
    return <div className="loading-indicator">アクティビティを読み込み中...</div>;
  }

  if (error) {
    return <div className="error-message">エラー: {error}</div>;
  }

  if (activities.length === 0) {
    return <div className="no-data-message">まだアクティビティがありません。</div>;
  }

  return (
    <div className="activity-feed">
      <h3>最近のアクティビティ</h3>
      <ul className="activity-list">
        {activities.map((activity, index) => (
          <li key={index} className="activity-item">
            <p><strong>{activity.action}</strong>: {activity.details}</p>
            <small>{new Date(activity.createdAt).toLocaleDateString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserProfileActivity;
