// API Configuration
export const BASE_API_URL = process.env.REACT_APP_API_URL || 'https://checkin-api-as1t.onrender.com/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  
  // Members
  MEMBERS: '/members',
  MEMBER_BY_ID: (id) => `/members/${id}`,
  SEARCH_MEMBERS: '/admin/search/members',
  
  // Attendance
  ATTENDANCE: '/attendance',
  ATTENDANCE_EXPORT: '/attendance/export',
  
  // Reports
  REPORTS_EXPORT: '/admin/reports/export',
  
  // Analytics
  ANALYTICS: '/admin/reports/analytics',
  TOP_ACTIVE_MEMBERS: '/admin/reports/analytics/top-active',
  INACTIVE_MEMBERS: '/admin/reports/analytics/inactive',
  
  // QR Scanner
  QR_SCAN: '/qr/scan',
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => `${BASE_API_URL}${endpoint}`; 