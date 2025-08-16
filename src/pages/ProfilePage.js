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

  // Profile update form state
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    studentId: profile.studentId || '',
    phoneNumber: profile.phoneNumber || ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        studentId: profile.studentId || '',
        phoneNumber: profile.phoneNumber || ''
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await apiService.users.updateProfile(form);
      if (response && response.success && response.data) {
        setProfile(response.data);
        toast.success('Profile updated!');
        setEditMode(false);
      } else {
        toast.error('Failed to update profile.');
      }
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        {editMode ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">First Name</label>
              <input type="text" name="firstName" value={form.firstName} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block font-semibold mb-1">Last Name</label>
              <input type="text" name="lastName" value={form.lastName} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block font-semibold mb-1">Student ID</label>
              <input type="text" name="studentId" value={form.studentId} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Phone Number</label>
              <input type="text" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              <button type="button" className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400" onClick={() => setEditMode(false)} disabled={saving}>Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <p><strong>First Name:</strong> {profile.firstName}</p>
            <p><strong>Last Name:</strong> {profile.lastName}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Student ID:</strong> {profile.studentId || 'Not provided'}</p>
            <p><strong>Phone:</strong> {profile.phoneNumber || 'Not provided'}</p>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={() => setEditMode(true)}>Edit Profile</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
