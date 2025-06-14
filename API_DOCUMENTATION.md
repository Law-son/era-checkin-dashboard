# ERA Hub Check-in API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## Member Management

### POST /members/register
Register a new member and generate QR code.

**Body:**
```json
{
  "fullName": "string",
  "gender": "male|female|other",
  "phone": "string",
  "email": "string",
  "dateOfBirth": "date",
  "department": "string",
  "membershipType": "basic|premium|vip"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Member registered successfully",
  "data": {
    "member": {
      "memberId": "string",
      "qrCodeUrl": "string",
      ...
    }
  }
}
```

### POST /members/check-in
Check in a member using QR code.

**Body:**
```json
{
  "memberId": "string",
  "location": [longitude, latitude]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Check-in successful",
  "data": {
    "attendance": {
      "checkIn": "datetime",
      "status": "checked-in",
      ...
    }
  }
}
```

### POST /members/check-out
Check out a member using QR code.

**Body:**
```json
{
  "memberId": "string",
  "location": [longitude, latitude]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Check-out successful",
  "data": {
    "attendance": {
      "checkIn": "datetime",
      "checkOut": "datetime",
      "duration": "number",
      "status": "checked-out",
      ...
    }
  }
}
```

## Authentication

### POST /auth/login
Login for admin users.

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "string",
    "admin": {
      "email": "string",
      "fullName": "string",
      "role": "admin|superadmin",
      ...
    }
  }
}
```

### POST /auth/register
Register a new admin user (requires super admin authentication).

**Body:**
```json
{
  "email": "string",
  "password": "string",
  "fullName": "string",
  "role": "admin|superadmin"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Admin registered successfully",
  "data": {
    "admin": {
      "email": "string",
      "fullName": "string",
      "role": "admin|superadmin",
      ...
    }
  }
}
```

### GET /auth/me
Get current admin profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "admin": {
      "email": "string",
      "fullName": "string",
      "role": "admin|superadmin",
      ...
    }
  }
}
```

### PUT /auth/update-me
Update current admin profile.

**Body:**
```json
{
  "fullName": "string",
  "email": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "admin": {
      "email": "string",
      "fullName": "string",
      "role": "admin|superadmin",
      ...
    }
  }
}
```

### POST /auth/change-password
Change current admin password.

**Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "string",
    "admin": {
      "email": "string",
      "fullName": "string",
      "role": "admin|superadmin",
      ...
    }
  }
}
```

### GET /auth/admins
Get all admin users (requires super admin authentication).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "admins": [{
      "email": "string",
      "fullName": "string",
      "role": "admin|superadmin",
      ...
    }]
  }
}
```

### PUT /auth/admins/:id
Update an admin user (requires super admin authentication).

**Body:**
```json
{
  "fullName": "string",
  "email": "string",
  "role": "admin|superadmin"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "admin": {
      "email": "string",
      "fullName": "string",
      "role": "admin|superadmin",
      ...
    }
  }
}
```

### DELETE /auth/admins/:id
Delete an admin user (requires super admin authentication).

**Response (200):**
```json
{
  "success": true,
  "message": "Admin deleted successfully"
}
```

### POST /auth/forgot-password
Request password reset.

**Body:**
```json
{
  "email": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Reset token generated successfully",
  "data": {
    "resetToken": "string"
  }
}
```

### POST /auth/reset-password/:token
Reset password using token.

**Body:**
```json
{
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "string",
    "admin": {...}
  }
}
```

## Admin Dashboard

### GET /admin/dashboard
Get overview statistics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "members": {
        "total": "number",
        "active": "number",
        "present": "number",
        "membershipTypes": [...]
      },
      "attendance": {
        "today": "number",
        "week": "number",
        "month": "number",
        "avgDuration": "number"
      }
    }
  }
}
```

### GET /admin/dashboard/today
Get today's statistics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalCheckins": "number",
      "currentlyPresent": "number",
      "avgDuration": "number",
      "hourlyDistribution": [...]
    }
  }
}
```

### GET /admin/live/present
Get currently present members.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "members": [{
      "memberId": "string",
      "fullName": "string",
      "email": "string",
      "lastCheckIn": "datetime",
      ...
    }]
  }
}
```

## Attendance Management

### GET /attendance
Get all attendance records with pagination.

**Query Parameters:**
- page (number, default: 1)
- limit (number, default: 10)
- status (string, optional)
- memberId (string, optional)

**Response (200):**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number",
    "hasNextPage": "boolean",
    "hasPrevPage": "boolean"
  }
}
```

### GET /attendance/member/:memberId
Get attendance history for a specific member.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "attendance": [...]
  }
}
```

### GET /attendance/export
Export attendance data.

**Query Parameters:**
- startDate (date, optional)
- endDate (date, optional)
- format (string, default: 'csv')

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [...],
    "format": "csv"
  }
}
```

## Analytics

### GET /admin/reports/analytics
Get analytics report.

**Query Parameters:**
- period (string: 'week'|'month'|'year', default: 'month')

**Response (200):**
```json
{
  "success": true,
  "data": {
    "analytics": {
      "dailyTrends": [...],
      "peakHours": [...],
      "membershipDistribution": [...]
    }
  }
}
```

### GET /attendance/heatmap
Get attendance heatmap data.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "heatmap": [{
      "_id": {
        "dayOfWeek": "number",
        "hour": "number"
      },
      "count": "number"
    }]
  }
}
```

## Member Search

### GET /admin/search/members
Search members.

**Query Parameters:**
- query (string, optional)
- status (string, optional)
- membershipType (string, optional)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "members": [...]
  }
}
```

### GET /admin/search/attendance
Search attendance records.

**Query Parameters:**
- memberId (string, optional)
- startDate (date, optional)
- endDate (date, optional)
- status (string, optional)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "attendance": [...]
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Error description"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "You are not logged in. Please log in to get access."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
``` 