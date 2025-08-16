import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiService } from '../services/api';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user, setUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        setError('You must be logged in to view this page.');
        return;
      }
      try {
        setLoading(true);
        const response = await apiService.users.getProfile();
        console.log('Profile response:', response);
        
        // Handle different response structures safely
        if (response && response.success && response.data) {
          setProfile(response.data);
        } else if (response && response.data) {
          setProfile(response.data);
        } else if (response) {
          setProfile(response);
        } else {
          setError('No profile data received');
        }
      } catch (err) {
        setError('Failed to fetch profile data.');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

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
        <p><strong>First Name:</strong> {profile.firstName}</p>
        <p><strong>Last Name:</strong> {profile.lastName}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Student ID:</strong> {profile.studentId || 'Not provided'}</p>
  <p><strong>Phone:</strong> {profile.phoneNumber || 'Not provided'}</p>
      </div>
    </div>
  );
};

export default ProfilePage;
