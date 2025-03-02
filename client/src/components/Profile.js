import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import '../styles/profile.css';

const API_KEY = "f671082f5fdbe6488ce24f306baf37a3";

var request = require('superagent');


function Profile() {
  const { user, updatePassword, error, loading } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);


  const fetchCustomerID = () => {
    //yes this is hard coded, it's because currently don't have a way to get the name
    let first_name = "Jane";
    let last_name = "Doe";

    request.get(`http://api.nessieisreal.com/customers/accounts?key=${API_KEY}`)
      .end(function (err, res) {
        if (err) {
          console.error('Error fetching data:', err);
          return;
        }

        if (!res) {
          console.error('No response received');
          return;
        }

        if (res && res.status) {
          console.log('Response Status:', res.status);
        }

        if (res && res.body) {
          console.log('Response Body:', res.body);
          for (let x of res.body) {
            if (x['first_name'].lower() === first_name.lower() && x['last_name'].lower() === last_name.lower()) {
              return x['_id'];
            }
          }
        } else {
          console.error('No body in response');
        }
      });

    return "67c28e049683f20dd518c023";
  };
  

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage('Please fill in all fields');
      setIsError(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      setIsError(true);
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      setIsError(true);
      return;
    }

    const success = await updatePassword(newPassword);
    if (success) {
      setMessage('Password updated successfully');
      setIsError(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setMessage(error || 'Failed to update password. Please try again.');
      setIsError(true);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Your Profile</h1>
        <p>Manage your account settings and security preferences</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <h2>Account Information</h2>
          <div className="profile-info">
            <div className="info-group">
              <label>Email</label>
              <p>{user?.email}</p>
            </div>
            <div className="info-group">
              <label>Account Created</label>
              <p>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div className="info-group">
              <label>Customer ID</label>
              <p>{fetchCustomerID() ? fetchCustomerID() : 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h2>Change Password</h2>
          {message && (
            <div className={`profile-message ${isError ? 'error' : 'success'}`}>
              {message}
            </div>
          )}
          <form onSubmit={handlePasswordChange} className="password-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="update-button" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile; 