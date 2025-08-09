{/*this jsx file was created by Raymund Cruz Espanto and Delnoel Duran for MIS SOL */}

import React, { useState, useEffect } from 'react';
import './AdminApprovalPage.css';

const AdminApprovalPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState(null); // 'approve' or 'reject'
  const [selectedId, setSelectedId] = useState(null);

  const fetchPendingRegistrations = async () => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    try {
      const response = await fetch('/api/nepw-registrations', { headers });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setRegistrations(data);
    } catch (err) {
      console.error("Error fetching pending registrations:", err);
      setError('Failed to load pending registrations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  const confirmAction = (id, action) => {
    setSelectedId(id);
    setModalAction(action);
    setModalVisible(true);
  };

  const executeAction = async () => {
    if (!selectedId || !modalAction) return;
    setActionLoading(true);
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    const endpoint = `/api/nepw-registrations/${selectedId}/${modalAction}`;
    try {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers,
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      alert(`Registration ${selectedId} ${modalAction}d!`);
      setRegistrations(prev => prev.filter(reg => reg._id !== selectedId));
    } catch (err) {
      console.error(`Error during ${modalAction}:`, err);
      alert(`Failed to ${modalAction} registration ${selectedId}.`);
    } finally {
      setActionLoading(false);
      setModalVisible(false);
      setSelectedId(null);
      setModalAction(null);
    }
  };

  if (loading) return <div className="loading-container">Loading pending registrations...</div>;
  if (error) return <div className="error-container">Error: {error}</div>;

  return (
    <div className="admin-approval-container">
      <div className="admin-page-content-wrapper">
        <h2>All NEPW Registrations</h2>
        {registrations.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No registrations found.</p>
        ) : (
          <div className="registration-list">
            {registrations.map((reg) => (
              <div key={reg._id} className="registration-card">
                {reg.image && (
                  <div className="registration-image-container">
                    <img
                      src={`/uploads/${reg.image}`}
                      alt={`Registration of ${reg.first_name} ${reg.last_name}`}
                      className="registration-image"
                    />
                  </div>
                )}
                <div className="registration-details">
                  <h3>{reg.first_name} {reg.middle_name} {reg.last_name} {reg.name_extension}</h3>
                  
                  <p><strong>Town:</strong> {reg.church_town}</p>
                  <p><strong>Barangay:</strong> {reg.church_barangay}</p>
                  <p><strong>Birthday:</strong> {reg.facebook_messenger_account_name_of_church}</p>
                  <p><strong>Contact:</strong> {reg.church_contact_number}</p>
                  {reg.selected_church_name.toLowerCase() === 'others' ? (
                    reg.other_church_name && <p><strong>Other Church:</strong> {reg.other_church_name}</p>
                  ) : (
                    <>
                      <p><strong>Church:</strong> {reg.selected_church_name}</p>
                      {reg.other_church_name && <p><strong>Other Church:</strong> {reg.other_church_name}</p>}
                    </>
                  )}
                  <p><strong>Status:</strong> {reg.status}</p>
                  <div className="actions">
                    <button
                      onClick={() => confirmAction(reg._id, 'approve')}
                      className="btn-approve"
                      disabled={actionLoading}
                    >
                      {actionLoading && selectedId === reg._id && modalAction === 'approve' ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => confirmAction(reg._id, 'reject')}
                      className="btn-reject"
                      disabled={actionLoading}
                    >
                      {actionLoading && selectedId === reg._id && modalAction === 'reject' ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm {modalAction === 'approve' ? 'Approval' : 'Rejection'}</h3>
            <p>Are you sure you want to {modalAction} this registration?</p>
            <div className="modal-actions">
              <button onClick={executeAction} className="btn-confirm" disabled={actionLoading}>
                {actionLoading ? 'Processing...' : 'Yes'}
              </button>
              <button onClick={() => setModalVisible(false)} className="btn-cancel" disabled={actionLoading}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApprovalPage;