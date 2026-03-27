// src/pages/admin.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase'; // Adjust path as needed

const AdminIntern = () => {
  const [activeTab, setActiveTab] = useState('interns');
  const [activeSidebarItem, setActiveSidebarItem] = useState('list'); // 'list', 'attendance'
  const [interns, setInterns] = useState([]);
  const [filteredInterns, setFilteredInterns] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month', custom
  const [customDate, setCustomDate] = useState('');
  const [internFilter, setInternFilter] = useState('all'); // 'all' or specific intern id
  const [availableDates, setAvailableDates] = useState([]);
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

  const loadingContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    flexDirection: 'column',
    gap: '1rem'
  };

  const spinnerStyle = {
    width: '50px',
    height: '50px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #800000',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  const searchContainerStyle = {
    display: 'flex',
    justifyContent: 'flex-end'
  };

  const filterContainerStyle = {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    marginBottom: '1rem',
    flexWrap: 'wrap'
  };

  const filterSelectStyle = {
    padding: '8px 12px',
    fontSize: '0.9rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    outline: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    minWidth: '150px'
  };

  const dateInputStyle = {
    padding: '8px 12px',
    fontSize: '0.9rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    outline: 'none',
    fontFamily: 'inherit'
  };

  const searchInputStyle = {
    padding: '8px 10px',
    fontSize: '0.95rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    width: '420px',
    outline: 'none',
    transition: 'all 0.3s',
    fontFamily: 'inherit'
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
    fontWeight: '800',
    marginBottom: '1rem',
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

  useEffect(() => {
    // Filter interns based on search term
    if (searchTerm.trim() === '') {
      setFilteredInterns(interns);
    } else {
      const filtered = interns.filter(intern => 
        intern.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intern.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intern.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intern.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intern.school?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInterns(filtered);
    }
  }, [searchTerm, interns]);

  useEffect(() => {
    // Filter attendance based on date filter and intern filter
    if (attendance.length > 0) {
      let filtered = [...attendance];
      
      // Filter by intern
      if (internFilter !== 'all') {
        filtered = filtered.filter(record => record.user_id === internFilter);
      }
      
      // Filter by date
      if (dateFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        filtered = filtered.filter(record => record.created_at.split('T')[0] === today);
      } else if (dateFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(record => new Date(record.created_at) >= weekAgo);
      } else if (dateFilter === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = filtered.filter(record => new Date(record.created_at) >= monthAgo);
      } else if (dateFilter === 'custom' && customDate) {
        filtered = filtered.filter(record => record.created_at.split('T')[0] === customDate);
      }
      
      setFilteredAttendance(filtered);
    }
  }, [dateFilter, customDate, attendance, internFilter]);

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
      setFilteredInterns(data || []);
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAttendance(data || []);
      setFilteredAttendance(data || []);
      
      // Extract unique dates for filter options
      const dates = [...new Set(data.map(record => record.created_at.split('T')[0]))];
      setAvailableDates(dates.sort().reverse());
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

  useEffect(() => {
    document.body.style.fontFamily = "'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      input:focus, select:focus {
        border-color: #800000;
        box-shadow: 0 0 0 2px rgba(128, 0, 0, 0.1);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString();
  };

  const handleNavClick = (tab) => {
    if (tab === 'interns') {
      setActiveTab('interns');
      setActiveSidebarItem('list');
      setSearchTerm('');
    } else if (tab === 'clients') {
      navigate('/client-management');
    } else if (tab === 'booking') {
      navigate('/booking-management');
    }
  };

  const handleSidebarClick = (item) => {
    setActiveSidebarItem(item);
    if (item === 'list') {
      setSearchTerm('');
    } else if (item === 'attendance') {
      setDateFilter('all');
      setCustomDate('');
      setInternFilter('all');
    }
  };

  const LoadingSpinner = () => (
    <div style={loadingContainerStyle}>
      <div style={spinnerStyle}></div>
      <p style={{ color: '#666', fontSize: '0.9rem' }}>Loading data...</p>
    </div>
  );

  return (
    <div>
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

      <div style={mainContainerStyle}>
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
              List of Interns
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
              Attendance Records
            </button>
          </div>
        )}

        <div style={contentStyle}>
          {activeTab === 'interns' && (
            <div>
              {activeSidebarItem === 'list' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={sectionTitleStyle}>List of Interns</h2>
                    <div style={searchContainerStyle}>
                      <input
                        type="text"
                        placeholder="🔍 Search by name, email, course, or school..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={searchInputStyle}
                        onFocus={(e) => e.target.style.borderColor = '#800000'}
                        onBlur={(e) => e.target.style.borderColor = '#ddd'}
                      />
                    </div>
                  </div>
                  {loading ? (
                    <LoadingSpinner />
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
                          {filteredInterns.length > 0 ? (
                            filteredInterns.map((intern) => (
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
                                {searchTerm ? 'No interns match your search' : 'No interns found'}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      {filteredInterns.length > 0 && searchTerm && (
                        <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.85rem' }}>
                          Found {filteredInterns.length} result(s) for "{searchTerm}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeSidebarItem === 'attendance' && (
                <div>
                  <h2 style={sectionTitleStyle}>Attendance Records</h2>
                  
                  {/* Filter Controls */}
                  <div style={filterContainerStyle}>
                    <select 
                      value={internFilter} 
                      onChange={(e) => setInternFilter(e.target.value)}
                      style={filterSelectStyle}
                    >
                      <option value="all">All Interns</option>
                      {interns.map(intern => (
                        <option key={intern.id} value={intern.id}>
                          {intern.firstName} {intern.lastName || ''}
                        </option>
                      ))}
                    </select>
                    
                    <select 
                      value={dateFilter} 
                      onChange={(e) => setDateFilter(e.target.value)}
                      style={filterSelectStyle}
                    >
                      <option value="all">All Dates</option>
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                      <option value="custom">Custom Date</option>
                    </select>
                    
                    {dateFilter === 'custom' && (
                      <input
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        style={dateInputStyle}
                      />
                    )}
                    
                    {(dateFilter !== 'all' || internFilter !== 'all') && filteredAttendance.length > 0 && (
                      <span style={{ color: '#666', fontSize: '0.85rem' }}>
                        Showing {filteredAttendance.length} record(s)
                      </span>
                    )}
                  </div>
                  
                  {loading ? (
                    <LoadingSpinner />
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
                          {filteredAttendance.length > 0 ? (
                            filteredAttendance.map((record) => {
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
        </div>
      </div>
    </div>
  );
};

export default AdminIntern;