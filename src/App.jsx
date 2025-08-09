import React, { useState, useEffect } from 'react';
import './App.css';
import Map from './Map';
import ChurchRegistrationForm from './ChurchRegistrationForm';
import NepwRegistrationForm from './NepwRegistrationForm';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import NotFoundPage from './NotFoundPage';
import Layout from './Layout';
import HomePage from './HomePage';
import AdminApprovalPage from './AdminApprovalPage';
import RegistrationLandingPage from './RegistrationLandingPage';
import DirectoryLandingPage from './DirectoryLandingPage';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';

import NepwDirectoryPage from './NepwDirectoryPage';
import ChurchDirectoryPage from './ChurchDirectoryPage';

// ProtectedRoute component
function ProtectedRoute({ children, isLoggedIn, allowedRoles, userRole }) {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    localStorage.setItem('unauthorizedAttempt', 'true'); // Set flag
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true); // New loading state

  useEffect(() => {
    // Check for token and role in localStorage on app load
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
    setLoading(false); // Set loading to false after check
  }, []);

  const handleLogin = (role) => {
    console.log('App.jsx: handleLogin - Role received:', role);
    localStorage.setItem('userRole', role); // Save user role to localStorage
    setIsLoggedIn(true);
    setUserRole(role);
    navigate('/dashboard'); // Redirect to dashboard after login
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    setUserRole(null);
  };

  const [selectedChurch, setSelectedChurch] = useState(null);
  const [freeTextSearchQuery, setFreeTextSearchQuery] = useState('');
  const [selectedTown, setSelectedTown] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [isMenuSidebarOpen, setIsMenuSidebarOpen] = useState(false);
  const location = useLocation(); // Import useLocation

  useEffect(() => {
    // Close sidebar when navigating to the map page
    if (location.pathname === '/map') {
      setIsMenuSidebarOpen(false);
    }
  }, [location.pathname]);
  const [selectedTownForBarangayFilter, setSelectedTownForBarangayFilter] = useState(null);
  const [towns, setTowns] = useState([]);
  const [allChurches, setAllChurches] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // If no token, don't make the request
          console.warn("No token found, skipping church data fetch.");
          return;
        }

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Include the token
        };
        const response = await fetch('/api/churches', { headers });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAllChurches(data);

        const uniqueTowns = [...new Set(data.map(church => church.church_town))];
        setTowns(uniqueTowns.sort());
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    if (isLoggedIn) { // Only fetch if logged in
      fetchLocations();
    }
  }, [isLoggedIn]);

  const handleMapClick = () => {
    setSelectedChurch(null); // Close the info sidebar
    setIsMenuSidebarOpen(false); // Close the main menu sidebar
  };

  const handleSearch = (query) => {
    setFreeTextSearchQuery(query);
    setSelectedTown('');
    setSelectedBarangay('');
    setSelectedTownForBarangayFilter(null);
  };

  const handleTownSelect = (townName) => {
    setSelectedTown(townName);
    setSelectedBarangay('');
    setFreeTextSearchQuery('');
    setSelectedTownForBarangayFilter(townName);
  };

  const handleBarangaySelect = (barangayName) => {
    setSelectedBarangay(barangayName);
    setFreeTextSearchQuery('');
  };

  const navigate = useNavigate();

  const handleRegistrationSuccess = () => {
    navigate('/map'); // Navigate to the map page after successful registration
  };

  if (loading) {
    return <div className="loading-container">Loading application...</div>; // Simple loading indicator
  }

  return (
    <div className="App">
      <Layout 
        selectedChurch={selectedChurch} 
        onMapClick={handleMapClick} 
        onSearch={handleSearch} 
        isMenuSidebarOpen={isMenuSidebarOpen} 
        setIsMenuSidebarOpen={setIsMenuSidebarOpen} 
        onTownSelect={handleTownSelect} 
        onBarangaySelect={handleBarangaySelect} 
        selectedTownForBarangayFilter={selectedTownForBarangayFilter} 
        selectedTown={selectedTown} 
        selectedBarangay={selectedBarangay} 
        allChurches={allChurches}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        userRole={userRole}
      >
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<ProtectedRoute isLoggedIn={isLoggedIn}><DashboardPage userRole={userRole} /></ProtectedRoute>} />
          <Route path="/registration" element={<ProtectedRoute isLoggedIn={isLoggedIn}><RegistrationLandingPage /></ProtectedRoute>} />
          <Route path="/registration/church" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ChurchRegistrationForm onFormSubmit={handleRegistrationSuccess} /></ProtectedRoute>} />
          <Route path="/registration/nepw" element={<ProtectedRoute isLoggedIn={isLoggedIn}><NepwRegistrationForm onFormSubmit={handleRegistrationSuccess} isLoggedIn={isLoggedIn} /></ProtectedRoute>} />
          <Route path="/directory" element={<ProtectedRoute isLoggedIn={isLoggedIn}><DirectoryLandingPage /></ProtectedRoute>} />
          <Route path="/directory/churches" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ChurchDirectoryPage /></ProtectedRoute>} />
          <Route path="/directory/nepw" element={<ProtectedRoute isLoggedIn={isLoggedIn}><NepwDirectoryPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/admin-approval" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['admin']} userRole={userRole}><AdminApprovalPage /></ProtectedRoute>} />
          <Route path="/admin/nepw-approvals" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['admin']} userRole={userRole}><AdminApprovalPage /></ProtectedRoute>} />
          <Route path="/map" element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Map 
                onChurchSelect={setSelectedChurch} 
                onMapClick={handleMapClick} 
                freeTextSearchQuery={freeTextSearchQuery} 
                selectedTown={selectedTown} 
                selectedBarangay={selectedBarangay} 
                selectedChurch={selectedChurch} 
                selectedMarkerId={selectedChurch?.id} 
                isLoggedIn={isLoggedIn}
              />
            </ProtectedRoute>
          } />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;