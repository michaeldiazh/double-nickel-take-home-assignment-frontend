# Double Nickel Take Home Challenge - Frontend

A React + TypeScript frontend application for job application screening and chat functionality.

## Features

- 🔐 **User Authentication**
  - User signup with account and personal information
  - User login for existing applicants
  - Protected routes with authentication context

- 💼 **Job Management**
  - Browse available jobs
  - View job details (name, description, location)
  - Track job applications and their status

- 💬 **Real-time Chat**
  - WebSocket-based chat interface
  - Interactive job application screening
  - Real-time conversation with AI assistant

- 📊 **Dashboard**
  - View all available jobs
  - Track applied jobs and their screening decisions
  - Navigate to job summaries

- 📄 **Application Summary**
  - View screening decisions (Approved/Denied/Pending)
  - Read overall summary of application
  - Download conversation messages as text file

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router DOM** - Client-side routing
- **Vite** - Build tool and dev server
- **Reconnecting WebSocket** - WebSocket connection management

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in terminal).

### Build

Build for production:
```bash
npm run build
```

### Preview Production Build

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable React components
│   └── Chat/           # Chat-related components
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── hooks/              # Custom React hooks
│   ├── useChat.ts      # Chat functionality hook
│   ├── useChatWithParams.ts # Chat with URL params
│   └── useError.ts     # Error handling hook
├── pages/              # Page components
│   ├── HomePage.tsx    # Landing page
│   ├── LoginPage.tsx   # Login page
│   ├── SignupPage.tsx  # Signup page
│   ├── DashboardPage.tsx # Dashboard with jobs
│   ├── ChatPage.tsx    # Chat interface
│   └── SummaryPage.tsx # Application summary
├── services/           # API services
│   └── api.ts          # API functions
├── types/              # TypeScript type definitions
│   └── index.ts        # All type definitions
├── utils/              # Utility functions
│   ├── constants.ts    # App constants
│   └── id.ts           # ID generation utilities
├── App.tsx             # Main app component with routing
├── App.css             # Global styles
├── main.tsx            # Entry point
└── index.css           # Base styles
```

## Routes

- `/` - Home page (landing page)
- `/login` - Login page
- `/sign-up` - Signup page
- `/dashboard` - Dashboard (protected, requires auth)
- `/chat` - Chat interface
- `/chat?jobId=<id>` - Chat for specific job
- `/summary` - Application summary page

## API Integration

The frontend communicates with a backend API. See `API_DOCUMENTATION.md` for complete API details.

### Key Endpoints Used

- `POST /user` - Create new user (signup)
- `POST /user/login` - User login
- `GET /user/:userId` - Get user data
- `GET /jobs` - Get all available jobs
- `GET /applications/:applicationId/conversation` - Get conversation summary
- `GET /conversation-summary/:applicationId/messages` - Download messages
- `DELETE /application/:applicationId` - Delete application

### API Base URL

Configured in `src/utils/constants.ts`:
```typescript
export const API_BASE_URL = 'http://localhost:3000';
```

## Environment Setup

### Backend Connection

Ensure the backend server is running on `http://localhost:3000` (or update `API_BASE_URL` in `src/utils/constants.ts`).

### WebSocket Connection

WebSocket URL is configured in `src/utils/constants.ts`:
```typescript
export const WS_URL = 'ws://localhost:3000';
```

## User Flows

### New User Signup

1. Navigate to homepage
2. Click "New Applicant?" button
3. Fill out signup form:
   - Email and Password
   - First Name, Last Name
   - Address, Apt. Num (optional), State, Zip Code
4. Submit form
5. Automatically redirected to dashboard

### Existing User Login

1. Navigate to homepage
2. Click "Existing Applicant?" button
3. Enter email and password
4. Submit form
5. Redirected to dashboard

### Job Application Flow

1. From dashboard, view available jobs
2. Click on a job to start application
3. Chat with AI assistant for screening
4. Complete screening process
5. View summary with decision
6. Download conversation messages if needed

### View Application Summary

1. From dashboard, switch to "Applied Jobs" tab
2. Click on any applied job
3. View summary page with:
   - Screening decision (Approved/Denied/Pending)
   - Overall summary text
   - Download messages button

## Features in Detail

### Signup Page

- Comprehensive form with validation
- Real-time error handling
- Links to login page
- Automatic redirect to dashboard on success

### Dashboard

- Two tabs: "New Jobs" and "Applied Jobs"
- Click new jobs to start application
- Click applied jobs to view summary
- Logout functionality

### Chat Interface

- Real-time WebSocket communication
- Message streaming support
- Connection status indicator
- Back button to return to dashboard

### Summary Page

- Displays screening decision
- Shows overall summary
- Download conversation as text file
- Navigate back to dashboard

## Error Handling

- Form validation for required fields
- API error messages displayed to users
- Network error handling
- WebSocket connection error handling

## Styling

- Modern, clean UI design
- Responsive layout
- Consistent color scheme
- Smooth transitions and hover effects
- Accessible form inputs and buttons

## TypeScript

The project uses TypeScript for type safety:
- Strict type checking enabled
- All components properly typed
- API responses typed
- No `any` types used

## Development Notes

- Uses React Router v6 for routing
- Context API for authentication state
- Custom hooks for reusable logic
- Component-based architecture
- Separation of concerns (pages, components, services, utils)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Dependencies

### Production

- `react` - React library
- `react-dom` - React DOM renderer
- `react-router-dom` - Routing
- `reconnecting-websocket` - WebSocket management

### Development

- `typescript` - TypeScript compiler
- `vite` - Build tool
- `@vitejs/plugin-react` - Vite React plugin
- `@types/react` - React TypeScript types
- `@types/react-dom` - React DOM TypeScript types

## Browser Support

Modern browsers with ES6+ support:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow TypeScript best practices
2. Maintain component structure
3. Add proper error handling
4. Update types when adding new features
5. Follow existing code style

## License

ISC
