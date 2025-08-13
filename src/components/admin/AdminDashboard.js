import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, getImageUrl } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Try to fetch data with proper error handling
      const promises = [
        apiService.admin.getDashboardStats().catch(err => {
          console.error('Stats fetch failed:', err);
          return { data: null, error: err.message };
        }),
        apiService.admin.getItems().catch(err => {
          console.error('Items fetch failed:', err);
          return { data: [], error: err.message };
        }),
        apiService.admin.getUsers().catch(err => {
          console.error('Users fetch failed:', err);
          return { data: [], error: err.message };
        })
      ];

      const results = await Promise.all(promises);
      
      // Handle stats result
      const statsResult = results[0];
      if (statsResult && !statsResult.error) {
        // Handle both wrapped and direct responses
        const statsData = statsResult.data || statsResult;
        setStats(statsData || {});
      } else {
        console.warn('Failed to fetch stats:', statsResult?.error);
        setStats({});
      }
      
      // Handle items result
      const itemsResult = results[1];
      if (itemsResult && !itemsResult.error) {
        const itemsData = itemsResult.data || itemsResult;
        setItems(Array.isArray(itemsData) ? itemsData : []);
      } else {
        console.warn('Failed to fetch items:', itemsResult?.error);
        setItems([]);
      }
      
      // Handle users result
      const usersResult = results[2];
      if (usersResult && !usersResult.error) {
        const usersData = usersResult.data || usersResult;
        setUsers(Array.isArray(usersData) ? usersData : []);
      } else {
        console.warn('Failed to fetch users:', usersResult?.error);
        setUsers([]);
      }
      
      // Handle analytics if needed
      if (activeTab === 'analytics') {
        try {
          const analyticsResult = await apiService.admin.getAnalytics();
          if (analyticsResult && !analyticsResult.error) {
            const analyticsData = analyticsResult.data || analyticsResult;
            setAnalytics(analyticsData || {});
          }
        } catch (error) {
          console.warn('Analytics not available:', error);
          setAnalytics({});
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please check your admin credentials and try again.');
      setLoading(false);
      
      // Only redirect on authentication errors
      if (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('auth')) {
        console.log('Authentication error, redirecting to login...');
        navigate('/auth');
      }
    }
  };

  const updateItemStatus = async (itemId, status, adminNote = '') => {
    try {
      await apiService.admin.updateItemStatus(itemId, status, adminNote);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error updating item status:', error);
      setError('Failed to update item status');
    }
  };

  const markAsClaimed = async (itemId, location, instructions = '') => {
    try {
      await apiService.admin.markAsClaimed(itemId, location, instructions);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error marking item ready for collection:', error);
      setError('Failed to mark item ready for collection');
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await apiService.admin.updateUserRole(userId, role);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error updating user role:', error);
      setError('Failed to update user role');
    }
  };

  // Enhanced admin powers
  const deleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }
    
    try {
      await apiService.admin.deleteItem(itemId);
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting item:', error);
      setError('Failed to delete item');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This will also delete all their items.')) {
      return;
    }
    
    try {
      await apiService.admin.deleteUser(userId);
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
    }
  };

  const resetUserPassword = async (userId) => {
    const newPassword = prompt('Enter new password (minimum 6 characters):');
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    
    try {
      await apiService.admin.resetUserPassword(userId, newPassword);
      alert('Password reset successfully');
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Failed to reset password');
    }
  };

  const toggleUserActivation = async (userId, currentStatus) => {
    try {
      await apiService.admin.activateUser(userId, !currentStatus);
      fetchDashboardData();
    } catch (error) {
      console.error('Error toggling user activation:', error);
      setError('Failed to update user status');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedItems.length === 0) {
      alert('Please select items first');
      return;
    }

    let actionData = {};
    
    if (action === 'mark_ready') {
      const location = prompt('Enter collection location:', 'Main Office');
      const instructions = prompt('Enter collection instructions:', 'Please bring ID');
      if (!location) return;
      actionData = { collectionLocation: location, collectionInstructions: instructions };
    } else if (action === 'reject') {
      const note = prompt('Enter rejection reason:');
      if (!note) return;
      actionData = { adminNote: note };
    }

    if (action === 'delete' && !window.confirm(`Delete ${selectedItems.length} items? This cannot be undone.`)) {
      return;
    }

    try {
      await apiService.admin.bulkAction(selectedItems, action, actionData);
      setSelectedItems([]);
      setShowBulkActions(false);
      fetchDashboardData();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      setError('Failed to perform bulk action');
    }
  };

  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const exportData = async (type) => {
    try {
      const response = await fetch(`/api/admin/export?type=${type}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_export.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">College Admin Dashboard</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button 
              onClick={() => setError('')}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {['dashboard', 'items', 'users', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
            <div className="ml-auto flex space-x-2">
              <button
                onClick={() => navigate('/admin/found-items')}
                className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center"
              >
                🔍 Review Found Items
              </button>
              <button
                onClick={() => exportData('items')}
                className="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                Export Items
              </button>
              <button
                onClick={() => exportData('users')}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Export Users
              </button>
            </div>
          </nav>
        </div>

        {/* Dashboard Stats */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                      📦
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Items</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalItems || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white">
                      ⏳
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Items</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.pendingItems || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                      ✅
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Claimed Items</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.claimedItems || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white">
                      👥
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalUsers || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Items Management */}
        {activeTab === 'items' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Items Management</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage all lost and found items</p>
                </div>
                <div className="flex space-x-2">
                  {selectedItems.length > 0 && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleBulkAction('verify')}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Verify Selected ({selectedItems.length})
                      </button>
                      <button
                        onClick={() => handleBulkAction('reject')}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Reject Selected
                      </button>
                      <button
                        onClick={() => handleBulkAction('mark_ready')}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Mark Ready
                      </button>
                      <button
                        onClick={() => handleBulkAction('delete')}
                        className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-900"
                      >
                        Delete Selected
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedItems(selectedItems.length === items.length ? [] : items.map(item => item.id))}
                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                  >
                    {selectedItems.length === items.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>
            </div>
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item.id} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleItemSelect(item.id)}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-shrink-0 h-10 w-10">
                        {item.images && item.images.length > 0 ? (
                          <img 
                            className="h-10 w-10 rounded object-cover" 
                            src={getImageUrl(item.images[0])} 
                            alt={item.title}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`h-10 w-10 rounded bg-gray-200 flex items-center justify-center ${item.images && item.images.length > 0 ? 'hidden' : ''}`}
                        >
                          📦
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="text-sm font-medium text-gray-900">{item.title}</div>
                        <div className="text-sm text-gray-500">{item.category} - {item.type}</div>
                        <div className="text-xs text-gray-400">
                          Status: <span className={`font-medium ${
                            item.status === 'pending' ? 'text-yellow-600' :
                            item.status === 'verified' ? 'text-blue-600' :
                            item.status === 'ready_for_collection' ? 'text-green-600' :
                            item.status === 'collected' ? 'text-purple-600' : 'text-gray-600'
                          }`}>{item.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {item.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateItemStatus(item.id, 'matched')}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => updateItemStatus(item.id, 'closed', 'Does not meet criteria')}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {item.status === 'verified' && (
                        <button
                                                    onClick={() => markAsClaimed(item.id, 'Main Office', 'Please bring ID')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Ready for Collection
                        </button>
                      )}
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="bg-red-800 text-white px-3 py-1 rounded text-sm hover:bg-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Users Management */}
        {activeTab === 'users' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Users Management</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage user accounts and roles</p>
            </div>
            <ul className="divide-y divide-gray-200">
              {users.map((user) => (
                <li key={user.id} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                        {!user.isActive && <span className="ml-2 text-red-500">(Deactivated)</span>}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">
                        Role: <span className={`font-medium ${
                          user.role === 'admin' ? 'text-red-600' : 'text-blue-600'
                        }`}>{user.role}</span>
                        {user.studentId && ` • Student ID: ${user.studentId}`}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {user.role === 'user' && (
                        <button
                          onClick={() => updateUserRole(user.id, 'admin')}
                          className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
                        >
                          Make Admin
                        </button>
                      )}
                      {user.role === 'admin' && user.email !== 'admin@college.edu' && (
                        <button
                          onClick={() => updateUserRole(user.id, 'user')}
                          className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                        >
                          Remove Admin
                        </button>
                      )}
                      <button
                        onClick={() => resetUserPassword(user.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => toggleUserActivation(user.id, user.isActive)}
                        className={`px-3 py-1 rounded text-sm ${
                          user.isActive 
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      {user.email !== 'admin@college.edu' && (
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="bg-red-800 text-white px-3 py-1 rounded text-sm hover:bg-red-900"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Analytics</h3>
              {analytics.itemsByStatus && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Items by Status</h4>
                    <div className="space-y-1">
                      {analytics.itemsByStatus.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="capitalize">{item.status}</span>
                          <span className="font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Items by Category</h4>
                    <div className="space-y-1">
                      {analytics.itemsByCategory?.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="capitalize">{item.category}</span>
                          <span className="font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Items by Type</h4>
                    <div className="space-y-1">
                      {analytics.itemsByType?.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="capitalize">{item.type}</span>
                          <span className="font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
