// src/pages/Intern.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import mclogo from '../assets/mclogo.png';

const Intern = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('attendance');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Attendance state
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [currentAttendanceId, setCurrentAttendanceId] = useState(null);
  
  // Daily Tasks state
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Complete project documentation', completed: false, priority: 'high' },
    { id: 2, title: 'Review team pull requests', completed: false, priority: 'medium' },
    { id: 3, title: 'Update user profile information', completed: true, priority: 'low' },
    { id: 4, title: 'Prepare weekly report', completed: false, priority: 'high' },
    { id: 5, title: 'Attend stand-up meeting', completed: false, priority: 'medium' },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskFilter, setTaskFilter] = useState('all');

  useEffect(() => {
    checkUser();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      fetchAttendanceRecords();
      checkCurrentClockStatus();
    }
  }, [user]);
// Add this style tag to your component - put it right after the return statement or in a useEffect
useEffect(() => {
  // Apply font to the entire document
  document.body.style.fontFamily = "'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
}, []);
  const checkUser = async () => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    const localUser = JSON.parse(userData);
    
    // Fetch complete user data from Supabase to get all fields
    try {
      const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('id', localUser.id)
        .single();
      
      if (error) {
        console.error('Error fetching user data:', error);
        setUser(localUser);
      } else {
        setUser(data);
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error:', err);
      setUser(localUser);
    }
  };

  const fetchAttendanceRecords = async () => {
  try {
    // Fetch all attendance records for the current user, ordered by created_at descending
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching attendance records:', error);
    } else {
      // Transform the data for display - using login and logout fields
      const formattedRecords = data.map(record => ({
        id: record.id,
        date: new Date(record.created_at).toLocaleDateString(),
        loginTime: record.login ? new Date(record.login).toLocaleTimeString() : '--:--',
        logoutTime: record.logout ? new Date(record.logout).toLocaleTimeString() : '--:--'
      }));
      setAttendanceRecords(formattedRecords);
    }
  } catch (err) {
    console.error('Error:', err);
  }
};

  const checkCurrentClockStatus = async () => {
  try {
    // Check if there's an open clock-in (login without logout) for today
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', user.id)
      .is('logout', null)  // Check for records where logout is null
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error checking clock status:', error);
      return;
    }
    
    if (data && data.length > 0) {
      // User has clocked in today without clocking out
      const loginRecord = data[0];
      setClockedIn(true);
      setClockInTime(new Date(loginRecord.login));
      setCurrentAttendanceId(loginRecord.id);
    } else {
      // No active clock-in today
      setClockedIn(false);
      setClockInTime(null);
      setCurrentAttendanceId(null);
    }
  } catch (err) {
    console.error('Error:', err);
  }
};

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

 const handleClockIn = async () => {
  const now = new Date();
  
  try {
    // Insert new attendance record with login time and current date for created_at
    const { data, error } = await supabase
      .from('attendance')
      .insert([
        {
          user_id: user.id,
          login: now.toISOString(),
          logout: null,
          created_at: now.toISOString().split('T')[0] // Add created_at date
        }
      ])
      .select();
    
    if (error) {
      console.error('Error saving clock-in:', error);
      alert('Failed to clock in. Please try again.');
      return;
    }
    
    setClockedIn(true);
    setClockInTime(now);
    setCurrentAttendanceId(data[0].id);
    
    // Refresh attendance records
    await fetchAttendanceRecords();
    
  } catch (err) {
    console.error('Error:', err);
    alert('Failed to clock in. Please try again.');
  }
};
 const handleClockOut = async () => {
  if (!currentAttendanceId) {
    alert('No active clock-in found. Please clock in first.');
    return;
  }
  
  const now = new Date();
  
  try {
    // Update the existing attendance record with logout time
    const { error } = await supabase
      .from('attendance')
      .update({ logout: now.toISOString() })
      .eq('id', currentAttendanceId);
    
    if (error) {
      console.error('Error saving clock-out:', error);
      alert('Failed to clock out. Please try again.');
      return;
    }
    
    setClockedIn(false);
    setClockInTime(null);
    setCurrentAttendanceId(null);
    
    // Refresh attendance records
    await fetchAttendanceRecords();
    
  } catch (err) {
    console.error('Error:', err);
    alert('Failed to clock out. Please try again.');
  }
};
  const calculateDuration = (loginTime, logoutTime) => {
    if (!loginTime || !logoutTime) return '--:--';
    const diffMs = new Date(logoutTime) - new Date(loginTime);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);
    return `${diffHrs}h ${diffMins}m`;
  };

  const toggleTaskComplete = async (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
    
    // Optionally save task completion to Supabase
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      try {
        const { error } = await supabase
          .from('tasks')
          .upsert({
            user_id: user.id,
            task_id: taskId,
            title: task.title,
            completed: !task.completed,
            priority: task.priority,
            updated_at: new Date().toISOString()
          });
        
        if (error) {
          console.error('Error saving task:', error);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    }
  };

  const addNewTask = async () => {
    if (newTaskTitle.trim() === '') return;
    const newTask = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      completed: false,
      priority: 'medium'
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    
    // Save new task to Supabase
    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          task_id: newTask.id,
          title: newTask.title,
          completed: false,
          priority: 'medium',
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error saving new task:', error);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const deleteTask = async (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    
    // Delete from Supabase
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('user_id', user.id)
        .eq('task_id', taskId);
      
      if (error) {
        console.error('Error deleting task:', error);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityLabel = (priority) => {
    switch(priority) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return priority;
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (taskFilter === 'active') return !task.completed;
    if (taskFilter === 'completed') return task.completed;
    return true;
  });

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    active: tasks.filter(t => !t.completed).length
  };

  if (!user) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          overflow: hidden;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
      <div style={styles.landingContainer}>
        <div style={styles.dashboardLayout}>
          
          {/* LEFT SIDEBAR - PROFILE SECTION */}
          <aside style={styles.profileSidebar}>
            {/* Logo and Title Section */}
            <div style={styles.logoSection}>
              <img src={mclogo} alt="MC Logo" style={styles.mcLogo} />
              <span style={styles.logoTitle}>MCISM</span>
              <button onClick={handleLogout} style={styles.logoutBtnSidebar}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
            
            <div style={styles.profileAvatarContainer}>
              <div style={styles.profileAvatarMain}>
                {user.first_name ? user.first_name[0].toUpperCase() : 
                 user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                {user.last_name ? user.last_name[0].toUpperCase() : 
                 user.lastName ? user.lastName[0].toUpperCase() : ''}
              </div>
              <h2 style={styles.profileName}>
                {user.first_name || user.firstName} {user.last_name || user.lastName}
              </h2>
              <p style={styles.profileEmailSidebar}>{user.email}</p>
              <div style={styles.profileRoleBadge}>
                <span style={{
                  ...styles.roleTag,
                  ...(user.role === 'admin' ? styles.roleAdmin : styles.roleUser)
                }}>
                  {user.role === 'admin' ? '👑 Administrator' : '👤 Intern'}
                </span>
              </div>
            </div>
            
            {/* Additional Profile Details from Supabase */}
            <div style={styles.profileDetailsSidebar}>
              <div style={styles.detailRow}>
                <span style={styles.detailIcon}>🏫</span>
                <div>
                  <small>School</small>
                  <p>{user.school || 'Not specified'}</p>
                </div>
              </div>
              
              <div style={styles.detailRow}>
                <span style={styles.detailIcon}>⏰</span>
                <div>
                  <small>Required Hours</small>
                  <p>{user.required_hours || user.hours || '486 hours'}</p>
                </div>
              </div>
              
              <div style={styles.detailRow}>
                <span style={styles.detailIcon}>📍</span>
                <div>
                  <small>Address</small>
                  <p>{user.address || 'Not specified'}</p>
                </div>
              </div>
              
              <div style={styles.detailRow}>
                <span style={styles.detailIcon}>📞</span>
                <div>
                  <small>Phone Number</small>
                  <p>{user.phone_number || user.phone || 'Not specified'}</p>
                </div>
              </div>
              
              <div style={styles.detailRow}>
                <span style={styles.detailIcon}>🎓</span>
                <div>
                  <small>Course/Program</small>
                  <p>{user.course || 'Not specified'}</p>
                </div>
              </div>
            </div>
            
            {/* Greeting Card */}
            <div style={styles.greetingCard}>
              <div style={styles.greetingIcon}>🌟</div>
              <div>
                <p style={styles.greetingText}>{getGreeting()},</p>
                <p style={styles.greetingName}>
                  {user.first_name || user.firstName}!
                </p>
              </div>
            </div>
          </aside>
          
          {/* RIGHT CONTENT - TABS SECTION */}
          <main style={styles.tabsContent}>
            <div style={styles.tabNavigation}>
              <button 
                style={{
                  ...styles.tabBtn,
                  ...(activeTab === 'attendance' ? styles.tabBtnActive : {})
                }}
                onClick={() => setActiveTab('attendance')}
              >
                <span style={styles.tabIcon}>⏱️</span>
                Attendance
              </button>
              <button 
                style={{
                  ...styles.tabBtn,
                  ...(activeTab === 'tasks' ? styles.tabBtnActive : {})
                }}
                onClick={() => setActiveTab('tasks')}
              >
                <span style={styles.tabIcon}>✅</span>
                Daily Tasks
              </button>
            </div>
            
            <div style={styles.tabPanel}>
              {/* ATTENDANCE TAB */}
              {activeTab === 'attendance' && (
                <div style={styles.attendancePanel}>
                  <div style={styles.panelHeader}>
                    <h2>📋 Time Tracker</h2>
                    <p style={styles.currentDateTime}>
                      {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      <span style={styles.timeDisplay}>{currentTime.toLocaleTimeString()}</span>
                    </p>
                  </div>
                  
                  <div style={styles.clockCard}>
                    <div style={styles.clockStatus}>
                      <div style={{
                        ...styles.statusIndicator,
                        ...(clockedIn ? styles.clockedIn : styles.clockedOut)
                      }}>
                        {clockedIn ? '🔴 Currently Clocked In' : '⚪ Ready to Clock In'}
                      </div>
                      {clockedIn && clockInTime && (
                        <div style={styles.clockTimeInfo}>
                          Clocked in at: <strong>{clockInTime.toLocaleTimeString()}</strong>
                        </div>
                      )}
                    </div>
                    <div style={styles.clockActions}>
                      {!clockedIn ? (
                        <button style={{...styles.clockBtn, ...styles.clockIn}} onClick={handleClockIn}>
                          ⏰ Clock In
                        </button>
                      ) : (
                        <button style={{...styles.clockBtn, ...styles.clockOut}} onClick={handleClockOut}>
                          🏁 Clock Out
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div style={styles.attendanceHistory}>
  <h3>Attendance Records</h3>
  <div style={styles.historyTableContainer}>
    <table style={styles.historyTable}>
      <thead>
        <tr>
          <th>Date</th>
          <th>Login Time</th>
          <th>Logout Time</th>
        </tr>
      </thead>
      <tbody>
        {attendanceRecords.length === 0 ? (
          <tr>
            <td colSpan="3" style={styles.emptyStateCell}>
              <div style={styles.emptyState}>
                <span>📭</span>
                <p>No attendance records yet. Clock in to start tracking!</p>
              </div>
            </td>
          </tr>
        ) : (
          attendanceRecords.map(record => (
            <tr key={record.id}>
              <td style={styles.tableCell}>{record.date}</td>
              <td style={styles.tableCell}>
                <span style={styles.loginTimeBadge}>{record.loginTime}</span>
              </td>
              <td style={styles.tableCell}>
                <span style={record.logoutTime === '--:--' ? styles.activeBadge : styles.logoutTimeBadge}>
                  {record.logoutTime}
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>
                </div>
              )}
              
              {/* DAILY TASKS TAB */}
              {activeTab === 'tasks' && (
                <div style={styles.tasksPanel}>
                  <div style={{...styles.panelHeader, ...styles.tasksHeader}}>
                    <div>
                      <h2>📝 Daily Tasks</h2>
                      <div style={styles.taskStats}>
                        <span style={styles.statBadge}>Total: {taskStats.total}</span>
                        <span style={{...styles.statBadge, ...styles.statBadgeCompleted}}>Done: {taskStats.completed}</span>
                        <span style={{...styles.statBadge, ...styles.statBadgeActive}}>Active: {taskStats.active}</span>
                      </div>
                    </div>
                    <div style={styles.taskFilters}>
                      <button 
                        style={{
                          ...styles.filterChip,
                          ...(taskFilter === 'all' ? styles.filterChipActive : {})
                        }}
                        onClick={() => setTaskFilter('all')}
                      >All</button>
                      <button 
                        style={{
                          ...styles.filterChip,
                          ...(taskFilter === 'active' ? styles.filterChipActive : {})
                        }}
                        onClick={() => setTaskFilter('active')}
                      >Active</button>
                      <button 
                        style={{
                          ...styles.filterChip,
                          ...(taskFilter === 'completed' ? styles.filterChipActive : {})
                        }}
                        onClick={() => setTaskFilter('completed')}
                      >Completed</button>
                    </div>
                  </div>
                  
                  <div style={styles.addTaskSection}>
                    <input 
                      type="text" 
                      style={styles.taskInput}
                      placeholder="Add a new task... e.g., 'Finish presentation'"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addNewTask()}
                    />
                    <button style={styles.addTaskBtn} onClick={addNewTask}>
                      + Add Task
                    </button>
                  </div>
                  
                  <div style={styles.tasksList}>
                    {filteredTasks.length === 0 ? (
                      <div style={styles.emptyState}>
                        <span>🎯</span>
                        <p>No tasks in this category. Add a new task to get started!</p>
                      </div>
                    ) : (
                      filteredTasks.map(task => (
                        <div key={task.id} style={{
                          ...styles.taskItem,
                          ...(task.completed ? styles.taskItemCompleted : {})
                        }}>
                          <div style={styles.taskCheckbox} onClick={() => toggleTaskComplete(task.id)}>
                            {task.completed ? (
                              <span style={{...styles.checkbox, ...styles.checkboxChecked}}>✓</span>
                            ) : (
                              <span style={{...styles.checkbox, ...styles.checkboxUnchecked}}>○</span>
                            )}
                          </div>
                          <div style={styles.taskContent}>
                            <span style={styles.taskTitle}>{task.title}</span>
                            <span style={{
                              ...styles.taskPriority,
                              backgroundColor: getPriorityColor(task.priority)
                            }}>
                              {getPriorityLabel(task.priority)}
                            </span>
                          </div>
                          <button style={styles.deleteTaskBtn} onClick={() => deleteTask(task.id)}>
                            🗑️
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div style={styles.taskQuote}>
                    <p>💡 "The secret of getting ahead is getting started." — Mark Twain</p>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

// Styles object
const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontFamily: 'Inter, sans-serif',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '3px solid rgba(255,255,255,0.3)',
    borderTop: '3px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  landingContainer: {
    height: '100vh',
    overflow: 'hidden',
    fontFamily: 'Inter, sans-serif',
  },
  dashboardLayout: {
    display: 'flex',
    height: '100vh',
    background: '#f5f7fa',
  },
  profileSidebar: {
    width: '370px',
    background: 'linear-gradient(135deg, #800000 0%, #4a0000 100%)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 20px 16px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.15)',
  },
  mcLogo: {
    width: '40px',
    height: '40px',
    objectFit: 'contain',
  },
  logoTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    flex: 1,
  },
  logoutBtnSidebar: {
    background: 'rgba(255,255,255,0.15)',
    border: 'none',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s',
  },
  profileAvatarContainer: {
    textAlign: 'center',
    padding: '24px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  profileAvatarMain: {
    width: '100px',
    height: '100px',
    background: 'linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    fontWeight: 'bold',
    margin: '0 auto 20px',
    border: '4px solid rgba(255,255,255,0.3)',
  },
  profileName: {
    fontSize: '22px',
    marginBottom: '8px',
  },
  profileEmailSidebar: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '12px',
  },
  profileRoleBadge: {
    marginTop: '8px',
  },
  roleTag: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  },
  roleAdmin: {
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#f87171',
  },
  roleUser: {
    background: 'rgba(16, 185, 129, 0.2)',
    color: '#6ee7b7',
  },
  profileDetailsSidebar: {
    padding: '24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  detailIcon: {
    fontSize: '20px',
    width: '32px',
  },
  greetingCard: {
    margin: '24px',
    padding: '20px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backdropFilter: 'blur(10px)',
  },
  greetingIcon: {
    fontSize: '32px',
  },
  greetingText: {
    fontSize: '14px',
    opacity: 0.8,
  },
  greetingName: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  tabsContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '32px',
    animation: 'slideIn 0.3s ease-out',
  },
  tabNavigation: {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px',
    borderBottom: '2px solid #e2e8f0',
  },
  tabBtn: {
    padding: '12px 24px',
    background: 'none',
    border: 'none',
    fontSize: '16px',
    fontWeight: '500',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
  },
  tabBtnActive: {
    color: '#800000',
    borderBottomColor: '#800000',
  },
  tabIcon: {
    fontSize: '18px',
  },
  tabPanel: {
    animation: 'slideIn 0.3s ease-out',
  },
  attendancePanel: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  panelHeader: {
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e2e8f0',
  },
  currentDateTime: {
    color: '#64748b',
    marginTop: '8px',
    fontSize: '14px',
  },
  timeDisplay: {
    marginLeft: '12px',
    fontWeight: '500',
    color: '#800000',
  },
  clockCard: {
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
    textAlign: 'center',
  },
  clockStatus: {
    marginBottom: '20px',
  },
  statusIndicator: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '12px',
  },
  clockedIn: {
    color: '#ef4444',
  },
  clockedOut: {
    color: '#10b981',
  },
  clockTimeInfo: {
    fontSize: '14px',
    color: '#475569',
  },
  clockActions: {
    display: 'flex',
    justifyContent: 'center',
  },
  clockBtn: {
    padding: '12px 32px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  clockIn: {
    background: '#10b981',
    color: 'white',
  },
  clockOut: {
    background: '#ef4444',
    color: 'white',
  },
  attendanceHistory: {
    marginTop: '24px',
  },
  historyTableContainer: {
    overflowX: 'auto',
    marginTop: '16px',
  },
  historyTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
 tableCell: {
  padding: '12px',
  borderBottom: '1px solid #e2e8f0',
  textAlign: 'left',
},
emptyStateCell: {
  textAlign: 'center',
  padding: '48px',
},
loginTimeBadge: {
  display: 'inline-block',
  padding: '4px 12px',
  background: '#dbeafe',
  color: '#1e40af',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: '500',
},
logoutTimeBadge: {
  display: 'inline-block',
  padding: '4px 12px',
  background: '#f3f4f6',
  color: '#374151',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: '500',
},
activeBadge: {
  display: 'inline-block',
  padding: '4px 12px',
  background: '#fef3c7',
  color: '#92400e',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: '500',
},
  tasksPanel: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  tasksHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px',
  },
  taskStats: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
  },
  statBadge: {
    padding: '4px 12px',
    background: '#f1f5f9',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#475569',
  },
  statBadgeCompleted: {
    background: '#d1fae5',
    color: '#065f46',
  },
  statBadgeActive: {
    background: '#fed7aa',
    color: '#9b2c1d',
  },
  taskFilters: {
    display: 'flex',
    gap: '8px',
  },
  filterChip: {
    padding: '6px 16px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s',
  },
  filterChipActive: {
    background: '#800000',
    color: 'white',
  },
  addTaskSection: {
    display: 'flex',
    gap: '12px',
    margin: '24px 0',
  },
  taskInput: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s',
  },
  addTaskBtn: {
    padding: '12px 24px',
    background: '#800000',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.3s',
  },
  tasksList: {
    marginTop: '24px',
  },
  taskItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderBottom: '1px solid #e2e8f0',
    transition: 'all 0.3s',
  },
  taskItemCompleted: {
    opacity: 0.6,
  },
  taskCheckbox: {
    cursor: 'pointer',
  },
  checkbox: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    fontSize: '16px',
  },
  checkboxChecked: {
    background: '#10b981',
    color: 'white',
    borderRadius: '6px',
  },
  checkboxUnchecked: {
    color: '#94a3b8',
  },
  taskContent: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  taskTitle: {
    fontSize: '14px',
    color: '#1e293b',
  },
  taskPriority: {
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '500',
    color: 'white',
  },
  deleteTaskBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    opacity: 0.5,
    transition: 'opacity 0.3s',
  },
  taskQuote: {
    marginTop: '24px',
    padding: '16px',
    background: '#fef3c7',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#92400e',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px',
    color: '#94a3b8',
  },
};

export default Intern;