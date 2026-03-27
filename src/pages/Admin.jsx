// src/pages/admin.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase'; // Adjust path as needed

const Admin = () => {
  const [activeTab, setActiveTab] = useState('interns');
  const [activeSidebarItem, setActiveSidebarItem] = useState('list'); // 'list', 'attendance'
  const [interns, setInterns] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const navbarStyle = {
    background: 'linear-gradient(135deg, #800000 50%, #4a0000 100%)',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000
  };

  const mainContainerStyle = {
    display: 'flex',
    marginTop: '70px',
    minHeight: 'calc(100vh - 70px)'
  };

  const sidebarStyle = {
    width: '250px',
    backgroundColor: '#f8f9fa',
    borderRight: '1px solid #ddd',
    padding: '2rem 0',
    position: 'fixed',
    left: 0,
    top: '70px',
    bottom: 0,
    overflowY: 'auto'
  };

  const contentStyle = {
    flex: 1,
    marginLeft: '250px',
    padding: '2rem',
    backgroundColor: '#fff'
  };

  const sidebarItemStyle = {
    padding: '12px 24px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'all 0.3s',
    border: 'none',
    background: 'none',
    width: '100%',
    textAlign: 'left',
    color: '#333',
    borderLeft: '3px solid transparent'
  };

  const activeSidebarItemStyle = {
    ...sidebarItemStyle,
    backgroundColor: '#f0f0f0',
    color: '#800000',
    borderLeftColor: '#800000',
    fontWeight: '600'
  };

  const navItemStyle = {
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'all 0.3s',
    border: 'none',
    background: 'none',
    outline: 'none',
    position: 'relative'
  };

  const activeNavItemStyle = {
    ...navItemStyle,
    color: '#ffffff'
  };

  const underlineStyle = {
    position: 'absolute',
    bottom: '0',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '80%',
    height: '2px',
    backgroundColor: '#ffffff',
    borderRadius: '2px',
    transition: 'all 0.3s'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    fontSize: '0.9rem'
  };

  const thStyle = {
    backgroundColor: '#f4f4f4',
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #ddd',
    fontWeight: '600'
  };

  const tdStyle = {
    padding: '12px',
    borderBottom: '1px solid #ddd'
  };

  const sectionTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#333'
  };

  useEffect(() => {
    if (activeTab === 'interns') {
      if (activeSidebarItem === 'list') {
        fetchInterns();
      } else if (activeSidebarItem === 'attendance') {
        fetchAttendance();
      }
    }
  }, [activeTab, activeSidebarItem]);

  const fetchInterns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('role', 'intern')
        .order('firstName', { ascending: true });

      if (error) throw error;
      setInterns(data || []);
    } catch (error) {
      console.error('Error fetching interns:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          user:user_id (
            firstName,
            lastName
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAttendance(data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };
// Add this style tag to your component - put it right after the return statement or in a useEffect
useEffect(() => {
  // Apply font to the entire document
  document.body.style.fontFamily = "'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
}, []);
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString();
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'interns') {
      setActiveSidebarItem('list');
    }
  };

  const handleSidebarClick = (item) => {
    setActiveSidebarItem(item);
  };

  return (
    <div>
      {/* Main Navbar */}
      <nav style={navbarStyle}>
        <button
          onClick={() => handleNavClick('interns')}
          style={activeTab === 'interns' ? activeNavItemStyle : navItemStyle}
          onMouseEnter={(e) => {
            if (activeTab !== 'interns') {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'interns') {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
          onFocus={(e) => e.target.style.outline = 'none'}
        >
          Interns
          {activeTab === 'interns' && <span style={underlineStyle} />}
        </button>
        <button
          onClick={() => handleNavClick('clients')}
          style={activeTab === 'clients' ? activeNavItemStyle : navItemStyle}
          onMouseEnter={(e) => {
            if (activeTab !== 'clients') {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'clients') {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
          onFocus={(e) => e.target.style.outline = 'none'}
        >
          Clients
          {activeTab === 'clients' && <span style={underlineStyle} />}
        </button>
        <button
          onClick={() => handleNavClick('booking')}
          style={activeTab === 'booking' ? activeNavItemStyle : navItemStyle}
          onMouseEnter={(e) => {
            if (activeTab !== 'booking') {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'booking') {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
          onFocus={(e) => e.target.style.outline = 'none'}
        >
          Booking
          {activeTab === 'booking' && <span style={underlineStyle} />}
        </button>
      </nav>

      {/* Main Container with Sidebar */}
      <div style={mainContainerStyle}>
        {/* Sidebar - Only visible when Interns tab is active */}
        {activeTab === 'interns' && (
          <div style={sidebarStyle}>
            <button
              onClick={() => handleSidebarClick('list')}
              style={activeSidebarItem === 'list' ? activeSidebarItemStyle : sidebarItemStyle}
              onMouseEnter={(e) => {
                if (activeSidebarItem !== 'list') {
                  e.target.style.backgroundColor = '#f0f0f0';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSidebarItem !== 'list') {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              📋 List of Interns
            </button>
            <button
              onClick={() => handleSidebarClick('attendance')}
              style={activeSidebarItem === 'attendance' ? activeSidebarItemStyle : sidebarItemStyle}
              onMouseEnter={(e) => {
                if (activeSidebarItem !== 'attendance') {
                  e.target.style.backgroundColor = '#f0f0f0';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSidebarItem !== 'attendance') {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              📅 Attendance Records
            </button>
          </div>
        )}

        {/* Content Area */}
        <div style={contentStyle}>
          {activeTab === 'interns' && (
            <div>
              {activeSidebarItem === 'list' && (
                <div>
                  <h2 style={sectionTitleStyle}>List of Interns</h2>
                  {loading ? (
                    <p>Loading interns...</p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={tableStyle}>
                      <thead>
  <tr>
    <th style={thStyle}>First Name</th>
    <th style={thStyle}>Last Name</th>
    <th style={thStyle}>Email</th>
    <th style={thStyle}>Course</th>
    <th style={thStyle}>School</th>
    <th style={thStyle}>Hours</th>
    <th style={thStyle}>Phone</th>
  </tr>
</thead>
<tbody>
  {interns.length > 0 ? (
    interns.map((intern) => (
      <tr key={intern.id}>
        <td style={tdStyle}>{intern.firstName}</td>
        <td style={tdStyle}>{intern.lastName || 'N/A'}</td>
        <td style={tdStyle}>{intern.email || 'N/A'}</td>
        <td style={tdStyle}>{intern.course || 'N/A'}</td>
        <td style={tdStyle}>{intern.school || 'N/A'}</td>
        <td style={tdStyle}>{intern.hours || '0'}</td>
        <td style={tdStyle}>{intern.phone_number || 'N/A'}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="7" style={{ ...tdStyle, textAlign: 'center' }}>
        No interns found
      </td>
    </tr>
  )}
</tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeSidebarItem === 'attendance' && (
                <div>
                  <h2 style={sectionTitleStyle}>Attendance Records</h2>
                  {loading ? (
                    <p>Loading attendance records...</p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={tableStyle}>
                        <thead>
                          <tr>
                            <th style={thStyle}>Date</th>
                            <th style={thStyle}>Intern Name</th>
                            <th style={thStyle}>Login Time</th>
                            <th style={thStyle}>Logout Time</th>
                            <th style={thStyle}>Hours Worked</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendance.length > 0 ? (
                            attendance.map((record) => {
                              const hoursWorked = record.login && record.logout 
                                ? ((new Date(record.logout) - new Date(record.login)) / (1000 * 60 * 60)).toFixed(2)
                                : 'N/A';
                              
                              return (
                                <tr key={record.id}>
                                  <td style={tdStyle}>{formatDate(record.created_at)}</td>
                                  <td style={tdStyle}>
                                    {record.user ? `${record.user.firstName} ${record.user.lastName || ''}` : 'Unknown'}
                                  </td>
                                  <td style={tdStyle}>{formatTime(record.login)}</td>
                                  <td style={tdStyle}>{formatTime(record.logout)}</td>
                                  <td style={tdStyle}>{hoursWorked !== 'N/A' ? `${hoursWorked} hrs` : 'N/A'}</td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan="5" style={{ ...tdStyle, textAlign: 'center' }}>
                                No attendance records found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {activeTab === 'clients' && (
            <div>
              <h2 style={sectionTitleStyle}>Clients Management</h2>
              <p>Manage clients here...</p>
            </div>
          )}
          {activeTab === 'booking' && (
            <div>
              <h2 style={sectionTitleStyle}>Booking Management</h2>
              <p>Manage bookings here...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;