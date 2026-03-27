import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminClient = () => {
  const [activeTab, setActiveTab] = useState('clients');
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

  const contentStyle = {
    marginTop: '70px',
    padding: '2rem',
    backgroundColor: '#fff',
    minHeight: 'calc(100vh - 70px)'
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

  const sectionTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#333'
  };

  useEffect(() => {
    document.body.style.fontFamily = "'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  }, []);

  const handleNavClick = (tab) => {
    if (tab === 'interns') {
      navigate('/intern-management');
    } else if (tab === 'clients') {
      setActiveTab('clients');
    } else if (tab === 'booking') {
      navigate('/booking-management');
    }
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

      {/* Content Area */}
      <div style={contentStyle}>
        <h1 style={sectionTitleStyle}>Clients Management</h1>
        <p>Manage clients here...</p>
      </div>
    </div>
  );
};

export default AdminClient;