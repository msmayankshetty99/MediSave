import React, { useState } from 'react';
import './ReceiptScanner.css';

const ReceiptScanner = ({ onScanComplete, onCancel }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a receipt image to scan');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('receipt', file);

      const response = await fetch('http://localhost:5000/api/scan-receipt', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to scan receipt');
      }

      if (result.success && result.data) {
        onScanComplete(result.data);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error scanning receipt:', err);
      setError(err.message || 'Failed to scan receipt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="receipt-scanner">
      <h3>Scan Receipt</h3>
      <p className="scanner-description">
        Upload a photo of your medical receipt to automatically extract expense details.
      </p>

      <form onSubmit={handleSubmit} className="scanner-form">
        <div className="file-upload-container">
          <label htmlFor="receipt-upload" className="file-upload-label">
            {preview ? (
              <div className="preview-container">
                <img src={preview} alt="Receipt preview" className="receipt-preview" />
              </div>
            ) : (
              <div className="upload-placeholder">
                <span className="upload-icon">📷</span>
                <span>Click to select a receipt image</span>
              </div>
            )}
          </label>
          <input
            type="file"
            id="receipt-upload"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="file-input"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="scanner-actions">
          <button 
            type="button" 
            className="cancel-button" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="scan-button" 
            disabled={!file || isLoading}
          >
            {isLoading ? 'Scanning...' : 'Scan Receipt'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReceiptScanner; 