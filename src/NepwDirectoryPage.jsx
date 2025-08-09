import React, { useState, useEffect } from 'react';
import './NepwDirectoryPage.css'; // We'll create this CSS file next

const NepwDirectoryPage = () => {
  const [nepwRegistrations, setNepwRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchNepwRegistrations = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    try {
      const response = await fetch(`/api/nepw-registrations?status=approved`, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNepwRegistrations(data);
    } catch (err) {
      console.error("Error fetching NEPW registrations:", err);
      setError('Failed to load NEPW directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNepwRegistrations();
  }, []); // No dependencies, fetches once on mount

  const filteredRegistrations = nepwRegistrations.filter(reg => {
    const searchLower = searchTerm.toLowerCase();
    return (
      reg.first_name.toLowerCase().includes(searchLower) ||
      reg.last_name.toLowerCase().includes(searchLower) ||
      reg.church_town.toLowerCase().includes(searchLower) ||
      reg.church_barangay.toLowerCase().includes(searchLower) ||
      reg.selected_church_name.toLowerCase().includes(searchLower) ||
      (reg.other_church_name && reg.other_church_name.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return <div className="loading-container">Loading NEPW directory...</div>;
  }

  if (error) {
    return <div className="error-container">Error: {error}</div>;
  }

  return (
    <div className="nepw-directory-container">
      <h2>NEPW Directory</h2>
      <div className="controls">
        <input
          type="text"
          placeholder="Search by name, town, barangay, church..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {filteredRegistrations.length === 0 ? (
        <p>No NEPW registrations found.</p>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Town</th>
                <th>Barangay</th>
                <th>Church</th>
                <th>Status</th>
                {/* Add more headers as needed */}
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map((reg) => (
                <tr key={reg._id}>
                  <td>{reg.first_name} {reg.last_name} {reg.name_extension}</td>
                  <td>{reg.church_town}</td>
                  <td>{reg.church_barangay}</td>
                  <td>{reg.selected_church_name === 'Others' ? reg.other_church_name : reg.selected_church_name}</td>
                  <td>{reg.status}</td>
                  {/* Add more data cells as needed */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NepwDirectoryPage;