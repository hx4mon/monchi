import React, { useEffect, useState } from 'react';
import CenteredFormWrapper from './CenteredFormWrapper'; // Import the wrapper
import './DashboardPage.css';

const DashboardPage = ({ userRole }) => {
  
  const [unauthorizedMessage, setUnauthorizedMessage] = useState('');
  const [totalChurches, setTotalChurches] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);

  useEffect(() => {
    const message = localStorage.getItem('unauthorizedAttempt');
    if (message) {
      setUnauthorizedMessage('Access Denied: You do not have permission to view that page.');
      localStorage.removeItem('unauthorizedAttempt'); // Clear the flag
    }

    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Include the token
      };

      try {
        // Fetch total churches
        const churchesResponse = await fetch('/api/churches', { headers });
        if (!churchesResponse.ok) {
          throw new Error(`HTTP error! status: ${churchesResponse.status}`);
        }
        const churchesData = await churchesResponse.json();
        setTotalChurches(churchesData.length);

        // Fetch total members (assuming NEPW registrations are members)
        const membersResponse = await fetch('/api/nepw-registrations', { headers });
        if (!membersResponse.ok) {
          throw new Error(`HTTP error! status: ${membersResponse.status}`);
        }
        const membersData = await membersResponse.json();
        setTotalMembers(membersData.length);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setDataError('Failed to load dashboard data.');
      } finally {
        setLoadingData(false);
      }
    };

    if (userRole) { // Only fetch data if userRole is available
      fetchData();
    }
  }, [userRole]);

  if (loadingData) {
    return <div className="dashboard-container">Loading dashboard data...</div>;
  }

  if (dataError) {
    return <div className="dashboard-container">Error: {dataError}</div>;
  }

  return (
    <div>
      {unauthorizedMessage && <p className="unauthorized-message">{unauthorizedMessage}</p>}

      <div className="summary-cards-container">
          <div className="summary-card">
            <h3>Total Registered Churches</h3>
            <p className="summary-value">{totalChurches}</p>
          </div>
          <div className="summary-card">
            <h3>Total Registered Members</h3>
            <p className="summary-value">{totalMembers}</p>
          </div>
        </div>
    </div>
  );
};

export default DashboardPage;
