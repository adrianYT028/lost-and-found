
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';


const ProfilePage = () => {
  const { user, setUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        // Not logged in, redirect to /auth
        navigate('/auth', { replace: true });
        return;
      }
      try {
        setLoading(true);
        const response = await apiService.users.getProfile();
        // Accept both {success, data} and direct user object
        if (response && (response.success === true || response.success === undefined)) {
          const data = response.data || response;
          if (data && (data.id || data.email || data.firstName)) {
            setProfile(data);
          } else {
            setError('Profile data is missing or incomplete.');
          }
        } else if (response && response.message) {
          setError(response.message);
        } else {
          setError('Could not load profile.');
        }
      } catch (err) {
        setError('Failed to fetch profile data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line
  }, [user, navigate]);


  if (loading) {
    return <div className="text-center mt-8">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  if (!profile) {
    return <div className="text-center mt-8">Could not load profile.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <p><strong>First Name:</strong> {profile.firstName || '-'}</p>
        <p><strong>Last Name:</strong> {profile.lastName || '-'}</p>
        <p><strong>Email:</strong> {profile.email || '-'}</p>
        <p><strong>Student ID:</strong> {profile.studentId || profile.studentID || 'Not provided'}</p>
        <p><strong>Phone:</strong> {profile.phone || profile.phoneNumber || 'Not provided'}</p>
      </div>
    </div>
  );
};

export default ProfilePage;
