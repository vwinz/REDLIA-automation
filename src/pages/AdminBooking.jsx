import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

const AdminBooking = () => {
  const [activeTab, setActiveTab] = useState('booking');
  const navigate = useNavigate();
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [datesWithPending, setDatesWithPending] = useState(new Set());
  const [error, setError] = useState(null);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingAppointmentId, setPendingAppointmentId] = useState(null);

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
    marginTop: '50px',
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
    marginBottom: '1.0rem',
    color: '#333'
  };

  // Error message style
  const errorStyle = {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '0.85rem'
  };

  // Modal styles
  const modalOverlay = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000
  };

  const modalContainer = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
  };

  const modalTitle = {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#333'
  };

  const modalMessage = {
    fontSize: '0.95rem',
    color: '#666',
    marginBottom: '1.5rem',
    lineHeight: '1.5'
  };

  const modalButtons = {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end'
  };

  const modalConfirmButton = {
    padding: '0.5rem 1.25rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  };

  const modalCancelButton = {
    padding: '0.5rem 1.25rem',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    backgroundColor: '#fff',
    color: '#666',
    transition: 'all 0.3s ease'
  };

  // Two-panel layout styles
  const twoPanelContainer = {
    display: 'flex',
    gap: '2rem',
    minHeight: 'calc(100vh - 150px)'
  };

  const calendarPanel = {
    flex: '0.8',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '1rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  };

  const appointmentsPanel = {
    flex: '1.2',
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  };

  // Calendar styles
  const calendarHeader = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem'
  };

  const monthTitle = {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#800000'
  };

  const navButton = {
    background: 'none',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    color: '#800000',
    padding: '0.25rem',
    borderRadius: '6px',
    transition: 'all 0.3s ease',
    fontWeight: 'bold'
  };

  const weekdays = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    textAlign: 'center',
    marginBottom: '0.25rem'
  };

  const weekday = {
    padding: '0.25rem',
    fontWeight: '600',
    color: '#666',
    fontSize: '0.7rem'
  };

  const calendarGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.125rem'
  };

  const dayCell = {
    aspectRatio: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    transition: 'all 0.3s ease',
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    position: 'relative'
  };

  const selectedDayCell = {
    ...dayCell,
    backgroundColor: '#800000',
    color: 'white',
    border: '1px solid #800000'
  };

  const currentMonthDay = {
    color: '#333'
  };

  const otherMonthDay = {
    color: '#ccc',
    backgroundColor: '#f9f9f9'
  };

  const todayCell = {
    ...dayCell,
    border: '2px solid #800000',
    fontWeight: 'bold'
  };

  // Red circle indicator style
  const redCircleIndicator = {
    position: 'absolute',
    top: '2px',
    right: '2px',
    width: '6px',
    height: '6px',
    backgroundColor: '#ff0000',
    borderRadius: '50%'
  };

  // Appointments list styles
  const appointmentsList = {
    maxHeight: 'calc(100vh - 250px)',
    overflowY: 'auto'
  };

  const appointmentCard = {
    backgroundColor: '#f8f9fa',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '0.75rem',
    marginBottom: '0.75rem',
    transition: 'all 0.3s ease'
  };

  const appointmentHeader = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  };

  const appointmentTime = {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#800000'
  };

  const statusBadge = {
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '500'
  };

  const statusPending = {
    ...statusBadge,
    backgroundColor: '#fef3c7',
    color: '#d97706'
  };

  const statusApproved = {
    ...statusBadge,
    backgroundColor: '#d1fae5',
    color: '#059669'
  };

  const statusDeclined = {
    ...statusBadge,
    backgroundColor: '#fee2e2',
    color: '#dc2626'
  };

  const buttonGroup = {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem'
  };

  const actionButton = {
    padding: '0.4rem 0.8rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  };

  const approveButton = {
    ...actionButton,
    backgroundColor: '#059669',
    color: 'white'
  };

  const declineButton = {
    ...actionButton,
    backgroundColor: '#dc2626',
    color: 'white'
  };

  const emptyState = {
    textAlign: 'center',
    padding: '2rem',
    color: '#999',
    fontSize: '0.85rem'
  };

  // Helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
        id: `prev-${year}-${month}-${i}`
      });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
        id: `current-${year}-${month}-${i}`
      });
    }
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        id: `next-${year}-${month}-${i}`
      });
    }
    return days;
  };

  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatDateForDisplay = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTimeForDisplay = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    if (!selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
  };

  const hasPendingAppointments = (date) => {
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return datesWithPending.has(dateKey);
  };

  const fetchPendingAppointmentsForMonth = async (date) => {
    // We need to fetch pending appointments for the current month AND the adjacent months
    // that might be visible in the calendar view (previous and next month days)
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Calculate start date (first day of previous month)
    const prevMonth = new Date(year, month - 1, 1);
    const startDate = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}-01`;
    
    // Calculate end date (last day of next month)
    const nextMonth = new Date(year, month + 2, 0);
    const endDate = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-${nextMonth.getDate()}`;
    
    try {
      const { data, error } = await supabase
        .from('schedule')
        .select('scheddate, status')
        .gte('scheddate', startDate)
        .lte('scheddate', endDate)
        .eq('status', 'Pending');
      
      if (error) {
        console.error('Error fetching pending appointments:', error);
        return;
      }
      
      const pendingDates = new Set();
      data.forEach(appointment => {
        pendingDates.add(appointment.scheddate);
      });
      
      console.log('Pending dates found:', Array.from(pendingDates)); // Debug log
      setDatesWithPending(pendingDates);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAppointments = async (date) => {
    if (!date) return;
    
    setLoading(true);
    setError(null);
    try {
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      const { data, error } = await supabase
        .from('schedule')
        .select('*')
        .eq('scheddate', formattedDate)
        .order('schedtime', { ascending: true });
      
      if (error) {
        console.error('Error fetching appointments:', error);
        setError('Failed to fetch appointments');
        return;
      }
      
      console.log('Fetched appointments:', data);
      setAppointments(data || []);
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    if (!id) {
      console.error('No appointment ID provided');
      setError('Invalid appointment ID');
      return;
    }
    
    setUpdatingStatus(id);
    setError(null);
    
    try {
      console.log('Attempting to update appointment with schedID:', id, 'to status:', newStatus);
      
      const { data, error } = await supabase
        .from('schedule')
        .update({ status: newStatus })
        .eq('schedID', id)
        .select();
      
      if (error) {
        console.error('Supabase error updating status:', error);
        setError(`Failed to update status: ${error.message}`);
        return;
      }
      
      console.log('Update successful:', data);
      
      // Refresh appointments list and pending indicators
      await fetchAppointments(selectedDate);
      await fetchPendingAppointmentsForMonth(currentMonth);
      
    } catch (error) {
      console.error('Unexpected error updating status:', error);
      setError('An unexpected error occurred while updating status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleActionClick = (id, action) => {
    if (!id) {
      console.error('Cannot perform action: No appointment ID');
      setError('Invalid appointment selected');
      return;
    }
    console.log('Action clicked:', { id, action });
    setPendingAppointmentId(id);
    setPendingAction(action);
    setModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (pendingAppointmentId && pendingAction) {
      const newStatus = pendingAction === 'approve' ? 'Approved' : 'Declined';
      await updateStatus(pendingAppointmentId, newStatus);
    }
    setModalOpen(false);
    setPendingAction(null);
    setPendingAppointmentId(null);
  };

  const handleCancelAction = () => {
    setModalOpen(false);
    setPendingAction(null);
    setPendingAppointmentId(null);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    fetchAppointments(date);
  };

  const handleMonthChange = (newMonth) => {
    setCurrentMonth(newMonth);
    fetchPendingAppointmentsForMonth(newMonth);
  };

  useEffect(() => {
    document.body.style.fontFamily = "'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const today = new Date();
    setSelectedDate(today);
    fetchAppointments(today);
    fetchPendingAppointmentsForMonth(today);
  }, []);

  const handleNavClick = (tab) => {
    if (tab === 'interns') {
      navigate('/intern-management');
    } else if (tab === 'clients') {
      navigate('/client-management');
    } else if (tab === 'booking') {
      setActiveTab('booking');
    }
  };

  const days = getDaysInMonth(currentMonth);

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

      {modalOpen && (
        <div style={modalOverlay}>
          <div style={modalContainer}>
            <div style={modalTitle}>
              Confirm {pendingAction === 'approve' ? 'Approval' : 'Decline'}
            </div>
            <div style={modalMessage}>
              Are you sure you want to {pendingAction === 'approve' ? 'approve' : 'decline'} this appointment?
            </div>
            <div style={modalButtons}>
              <button
                key="cancel-button"
                style={modalCancelButton}
                onClick={handleCancelAction}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff';
                }}
              >
                Cancel
              </button>
              <button
                key="confirm-button"
                style={{
                  ...modalConfirmButton,
                  backgroundColor: pendingAction === 'approve' ? '#059669' : '#dc2626',
                  color: 'white'
                }}
                onClick={handleConfirmAction}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {pendingAction === 'approve' ? 'Approve' : 'Decline'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={contentStyle}>
        <h1 style={sectionTitleStyle}>Appointment Booking Management</h1>
        
        {error && (
          <div style={errorStyle}>
            ⚠️ {error}
          </div>
        )}
        
        <div style={twoPanelContainer}>
          <div style={calendarPanel}>
            <div style={calendarHeader}>
              <button 
                style={navButton}
                onClick={() => handleMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              >
                ←
              </button>
              <span style={monthTitle}>{formatMonth(currentMonth)}</span>
              <button 
                style={navButton}
                onClick={() => handleMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              >
                →
              </button>
            </div>
            
            <div style={weekdays}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} style={weekday}>{day}</div>
              ))}
            </div>
            
            <div style={calendarGrid}>
              {days.map((day) => {
                let dayStyle = { ...dayCell };
                
                if (!day.isCurrentMonth) {
                  dayStyle = { ...dayStyle, ...otherMonthDay };
                } else {
                  dayStyle = { ...dayStyle, ...currentMonthDay };
                }
                
                if (isToday(day.date)) {
                  dayStyle = { ...dayStyle, ...todayCell };
                }
                
                if (isSelected(day.date)) {
                  dayStyle = { ...dayStyle, ...selectedDayCell };
                }
                
                // Show red dot for ALL dates that have pending appointments, regardless of month
                const hasPending = hasPendingAppointments(day.date);
                
                return (
                  <div
                    key={day.id}
                    style={dayStyle}
                    onClick={() => handleDateClick(day.date)}
                    onMouseEnter={(e) => {
                      if (!isSelected(day.date) && day.isCurrentMonth) {
                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected(day.date) && day.isCurrentMonth) {
                        e.currentTarget.style.backgroundColor = '#fff';
                      }
                    }}
                  >
                    {day.date.getDate()}
                    {hasPending && <div style={redCircleIndicator} />}
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.75rem', textAlign: 'center' }}>
              Click on any date to view appointments
            </p>
          </div>

          <div style={appointmentsPanel}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333', fontSize: '1.1rem' }}>
              Appointments for {selectedDate ? formatDateForDisplay(selectedDate) : 'Selected Date'}
            </h3>
            
            {loading ? (
              <div style={emptyState}>Loading appointments...</div>
            ) : appointments.length === 0 ? (
              <div style={emptyState}>
                📅 No appointments scheduled for this date
              </div>
            ) : (
              <div style={appointmentsList}>
                {appointments.map((appointment, index) => {
                  const uniqueId = appointment.schedID || appointment.id;
                  const uniqueKey = uniqueId 
                    ? `appointment-${uniqueId}`
                    : `appointment-${index}-${Date.now()}`;
                  
                  return (
                    <div key={uniqueKey} style={appointmentCard}>
                      <div style={appointmentHeader}>
                        <span style={appointmentTime}>
                          Time: {formatTimeForDisplay(appointment.schedtime)}
                        </span>
                        <span style={
                          appointment.status === 'Approved' ? statusApproved :
                          appointment.status === 'Declined' ? statusDeclined :
                          statusPending
                        }>
                          {appointment.status || 'Pending'}
                        </span>
                      </div>
                      <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                        <strong>Email Address:</strong> {appointment.clientemail}
                      </div>
                      {appointment.status !== 'Approved' && appointment.status !== 'Declined' && (
                        <div style={buttonGroup}>
                          <button
                            style={approveButton}
                            onClick={() => handleActionClick(appointment.schedID || appointment.id, 'approve')}
                            disabled={updatingStatus === (appointment.schedID || appointment.id)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            {updatingStatus === (appointment.schedID || appointment.id) ? 'Updating...' : 'Approve'}
                          </button>
                          <button
                            style={declineButton}
                            onClick={() => handleActionClick(appointment.schedID || appointment.id, 'decline')}
                            disabled={updatingStatus === (appointment.schedID || appointment.id)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            {updatingStatus === (appointment.schedID || appointment.id) ? 'Updating...' : 'Decline'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBooking;