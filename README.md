# Attendance Management System

A comprehensive full-stack attendance management application built with React, Node.js/Express, and MongoDB. This system allows managers to track employee attendance, view department statistics, and manage employee profiles with phone numbers.

## Features

### For Employees
- ✅ Mark attendance (Check-in/Check-out)
- ✅ View personal attendance history
- ✅ Monthly attendance summary
- ✅ Edit profile with phone number
- ✅ View personal dashboard

### For Managers
- ✅ View all employees' attendance status
- ✅ Department-wise statistics and filtering
- ✅ Member details page with attendance history
- ✅ Filter employees by status and department
- ✅ View detailed attendance records for each employee
- ✅ Edit profile with phone number
- ✅ Export attendance reports
- ✅ Manager dashboard with analytics

## Project Structure

```
attendance-system/
├── frontend/                    # React application
│   ├── src/
│   │   ├── pages/              # Page components
│   │   │   ├── employee/       # Employee pages
│   │   │   └── manager/        # Manager pages
│   │   ├── services/           # API services
│   │   ├── store/              # Redux store
│   │   ├── components/         # Reusable components
│   │   └── App.js              # Main app component
│   └── package.json
│
├── backend/                     # Node.js/Express application
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   ├── models/             # Mongoose models
│   │   ├── routes/             # API routes
│   │   ├── middleware/         # Custom middleware
│   │   ├── config/             # Configuration files
│   │   └── server.js           # Server entry point
│   ├── .env                    # Environment variables
│   └── package.json
│
└── README.md                    # This file
```

## Setup Instructions
### Step 1: Clone the Repository

```bash
cd "Attendance management TAP AC\attendance-system"
```

### Step 2: Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend will run on `http://localhost:5000`

### Step 3: Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will run on `http://localhost:3000`

### Step 4: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## How to Run

### Running Both Frontend and Backend

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
```

## Environment Variables

### Backend (.env file)

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/attendance-system
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance-system

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```
## Dummy.env
```env
MONGODB_URI=mongodb://localhost:27017/attendance-system
JWT_SECRET="TAP-AC"
JWT_EXPIRE=7d
```

## Default Login Credentials

### Manager Account
- **Email:** manager@example.com
- **Password:** password123
- **Role:** Manager
- **Employee ID:** MGR001
- **Department:** Management

### Employee Accounts
- **Alice Employee**
  - Email: alice@example.com
  - Password: password123
  - Employee ID: EMP001
  - Department: IT

- **Bob Employee**
  - Email: bob@example.com
  - Password: password123
  - Employee ID: EMP002
  - Department: HR

- **Carol Employee**
  - Email: carol@example.com
  - Password: password123
  - Employee ID: EMP003
  - Department: IT

- **David Employee**
  - Email: david@example.com
  - Password: password123
  - Employee ID: EMP004
  - Department: Finance

## Database Seeding

The application comes with pre-seeded dummy data:
- **2 months of attendance records** (1,680 records)
- **5 users** (1 manager + 4 employees)
- **Attendance distribution:**
  - 70% Present
  - 10% Late
  - 10% Half-day
  - 10% Absent

Data is automatically seeded when the backend starts for the first time.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Dashboard
- `GET /api/dashboard/employee` - Employee dashboard
- `GET /api/dashboard/manager` - Manager dashboard
- `GET /api/dashboard/manager/department` - Manager department details

### Attendance
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/today` - Today's status
- `GET /api/attendance/my-history` - Personal history
- `GET /api/attendance/my-summary` - Personal summary
- `GET /api/attendance/all` - All attendance (manager)
- `GET /api/attendance/member/:id` - Member details (manager)
- `GET /api/attendance/employee/:id` - Employee attendance (manager)
- `GET /api/attendance/summary` - Summary (manager)
- `GET /api/attendance/today-status` - Today status all (manager)
- `GET /api/attendance/export` - Export attendance (manager)

## Features in Detail

### My Department Page (Manager)
- View all employees under supervision
- Real-time attendance status (Present, Absent, Late, Half-day, Not Marked)
- Department-wise statistics
- Filter by department and status
- Quick contact buttons (Call, Email)
- Click "Details" to view member attendance history

### Member Details Page (Manager)
- Complete member information
- Full attendance history
- Attendance statistics
- Filter by status with dates
- Call and email buttons

### Profile Management
- View personal information
- Edit name and phone number
- Changes persist across the system
- Phone number displayed everywhere

### Dashboard
- Employee: Personal attendance overview
- Manager: Team attendance analytics

## Development

### Running Tests
```bash
cd backend
npm test

cd frontend
npm test
```

## Deployment

### Frontend Deployment (Vercel)
```bash
https://tap-acadamy-task2.vercel.app/login
```

### Backend Deployment (Render)
1. Set environment variables
2. Deploy using platform's CLI or Git
3. Ensure MongoDB Atlas is configured for production

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Pictures
### Employee Homepage
<img width="1889" height="864" alt="image" src="https://github.com/user-attachments/assets/7974017f-be2a-4dcd-84b6-f378258591c6" />

### Employee calender
<img width="470" height="677" alt="image" src="https://github.com/user-attachments/assets/43674d06-5818-4187-a076-c04abced72c8" />

### Employee Profile
<img width="263" height="395" alt="image" src="https://github.com/user-attachments/assets/20acd2d5-b59f-4ee5-a21d-834d0717de75" />

### Sign Up
<img width="508" height="826" alt="image" src="https://github.com/user-attachments/assets/6390e208-dfbe-4c78-b2a1-06be0c14de5d" />

### Manager Homepage
<img width="1347" height="888" alt="image" src="https://github.com/user-attachments/assets/8cde1a50-4092-4efe-b16b-222a60ab6393" />

### Manager Homepage
<img width="1285" height="850" alt="image" src="https://github.com/user-attachments/assets/b5914f18-2822-4257-8256-15636d7b0e32" />

### Manager Department wise Stats
<img width="543" height="802" alt="image" src="https://github.com/user-attachments/assets/8bbd4d07-aa79-4b4c-9fd0-b191290de135" />

### Manager Employee wise Stats
<img width="534" height="861" alt="image" src="https://github.com/user-attachments/assets/081dcd28-4cbb-404b-a89d-ed8a57befca3" />

### Manager CSV Import Feature
<img width="675" height="518" alt="image" src="https://github.com/user-attachments/assets/1f8cb68e-cc13-4825-8d4d-824958d1d5f5" />

## License

V.V Rithesh

## Details
V.V Rithesh
ritheshvellampalli05@gmail.com

