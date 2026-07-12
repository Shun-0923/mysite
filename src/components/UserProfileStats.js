import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserProfileStats = ({ userId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) {
      setError('User ID is required.');
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');
        // Constructing the URL directly with userId
        const response = await axios.get(`http://localhost:3001/api/users/${userId}/stats`);
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch user stats:', err);
        setError('Failed to load statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  if (loading) {
    return <p>Loading statistics...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!stats) {
    return <p>No statistics available.</p>;
  }

  return (
    <div className="user-stats">
      <h3>Your Activity Stats</h3>
      <p>Total Posts: {stats.totalPosts}</p>
      <p>Total Likes Received: {stats.totalLikesReceived}</p>
      <p>Total Comments: {stats.totalComments}</p>
    </div>
  );
};

export default UserProfileStats;
