import React, { useState, useEffect } from 'react';
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
  const [id, setId] = useState(null);
  const [name, setName] = useState(null);
  const [address, setAddress] = useState(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetchCustomerID();
  }, []);

  useEffect(() => {
    fetchCustomerName();
  }, []);

  useEffect(() => {
    fetchCustomerAddress();
  }, []);

  const fetchCustomerName = () => {
    let id = "67c28e049683f20dd518c023";

    request.get(`http://api.nessieisreal.com/customers?key=${API_KEY}`)
      .end(function (err, res) {
        if (err) {
          console.error('Error fetching data:', err);
          return;
        }

        if (res && res.body) {
          for (let x of res.body) {
            if (x['_id'] === id) {
              setName(x['first_name'] + ' ' + x['last_name']);
              break;
            }
          }
        } else {
          console.error('No body in response');
        }
      });
  };

  const fetchCustomerAddress = () => {
    let id = "67c28e049683f20dd518c023";

    request.get(`http://api.nessieisreal.com/customers?key=${API_KEY}`)
      .end(function (err, res) {
        if (err) {
          console.error('Error fetching data:', err);
          return;
        }

        if (res && res.body) {
          for (let x of res.body) {
            if (x['_id'] === id) {
              setAddress(x['address']['street_number'] + ' ' + x['address']['street_name'] + ', ' + x['address']['city']  + ', ' + x['address']['state'] + ' ' + x['address']['zip']);
              break;
            }
          }
        } else {
          console.error('No body in response');
        }
      });
  };

  const fetchCustomerID = () => {
    let first_name = "Jane";
    let last_name = "Doe";

    request.get(`http://api.nessieisreal.com/customers?key=${API_KEY}`)
      .end(function (err, res) {
        if (err) {
          console.error('Error fetching data:', err);
          return;
        }

        if (res && res.body) {
          for (let x of res.body) {
            if (x['first_name'].toLowerCase() === first_name.toLowerCase() && x['last_name'].toLowerCase() === last_name.toLowerCase()) {
              setId(x['_id']);
              break;
            }
          }
        } else {
          console.error('No body in response');
        }
      });
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
              <label>Customer ID</label>
              <p>{id ? id : 'N/A'}</p>
            </div>
            <div className="info-group">
              <label>Email</label>
              <p>{user?.email}</p>
            </div>
            <div className="info-group">
              <label>Customer Name</label>
              <p>{name ? name : 'N/A'}</p>
            </div>

            <div className="info-group">
              <label>Address</label>
              <p>{address ? address : 'N/A'}</p>
            </div>
            
            <div className="info-group">
              <label>Account Created</label>
              <p>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
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
