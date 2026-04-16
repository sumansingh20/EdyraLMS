# Online Exam System

A simple and secure online exam platform that helps schools and colleges conduct exams online. It has features to watch students during the exam and keep everything secure.

## Try It Out

You can try the demo right now:

- **Admin**: admin@proctoredexam.com / Admin@123
- **Teacher**: teacher@proctoredexam.com / Teacher@123  
- **Student**: STU001 / 01012000 (use date of birth as DDMMYYYY)

These demo accounts reset automatically.

## What's Used

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **Real-time**: Socket.IO for live updates
- **Security**: JWT authentication, browser security
- **Hosting**: Can run on any server or cloud

## Key Features

### Security & Proctoring
- **Camera Monitoring** - Keep an eye on students during the exam with a live webcam feed
- **Screen Lock** - Forces full screen mode (cheating is caught if they switch tabs)
- **Question Bank** - Create many different types of questions (multiple choice, true/false, short answer, etc.)
- **Offline Detection** - Tracks when students go away from the exam
- **Time Management** - Automatic timer that saves answers regularly
- **Detailed Logs** - Records everything for review later

### For Students
- Login using Student ID and Date of Birth
- See all your available exams in one place
- Flag questions to review later
- Calculator available during exams
- See your results and scores immediately after

### For Teachers
- Create and manage exams easily
- Import questions and students from CSV files
- Watch all students taking the exam in real-time
- See violations and security issues happening
- Get reports on student performance
- Organize questions by subject/topic

### For Admins
- Do everything teachers can do, plus:
- Manage all users and accounts
- View system-wide reports
- Check security logs and violations
- System-wide monitoring tools



## Getting Started

What you need:
- Node.js (version 18 or newer)
- MongoDB (you can use MongoDB Atlas free version)

### Quick Setup

1. Download the code:
```bash
git clone https://github.com/AshishKr001/ProctorExam.git
cd ProctorExam
```

2. Setup the Backend:
```bash
cd backend
npm install
```

Create a file `backend/.env`:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/proctorexam
JWT_ACCESS_SECRET=any-random-secret-here
JWT_REFRESH_SECRET=any-random-secret-here
CORS_ORIGIN=http://localhost:3000
```

Start it:
```bash
npm run dev
```

The backend runs at: http://localhost:5000

3. Setup the Frontend:
```bash
cd frontend
npm install
```

Create a file `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=/api
BACKEND_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Start it:
```bash
npm run dev
```

Open: http://localhost:3000

That's it! Use the demo accounts above to test.

## File Structure

```
ProctorExam/
├── frontend/          # Student, teacher, and admin interfaces (Next.js)
├── backend/           # API server (Node.js + Express)
├── docker/            # Docker setup files
└── nginx/             # Web server config
```

## Run Full Moodle Stack

If you want a full Moodle portal (separate from this custom exam app), this repo now includes a dedicated Moodle setup.

1. Copy `.env.moodle.example` to `.env.moodle`
2. Update all default passwords in `.env.moodle`
3. Deploy with `./scripts/deploy-moodle-production.ps1` (or run compose manually)
4. Configure reverse proxy with `nginx/moodle-site.conf.example`
5. Open `https://cet.iitp.ac.in/moodle`

Detailed guide: see `MOODLE_SETUP.md`.

## Security Features

- Secure login with passwords or student ID + date of birth
- Only the person using the account can take the exam (device/browser locked)
- Prevents cheating by blocking copy-paste and tab switching
- Detects if students open developer tools
- Records everything for review later
- Prevents unauthorized access with role-based permissions
## License

This project is open source and available under the MIT License.

## Questions?

If you need help or have questions, feel free to open an issue on GitHub.
