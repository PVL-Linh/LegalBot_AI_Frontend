# LegalBot AI - Frontend

## 🚀 Tech Stack
- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **State Management**: React Context API
- **Auth**: Supabase Auth
- **HTTP Client**: Axios
- **UI Components**: Lucide React (icons)
- **Notifications**: React Toastify
- **Markdown**: React Markdown + Remark GFM

## 📁 Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ErrorBoundary.jsx
│   ├── LoadingSpinner.jsx
│   ├── ProtectedRoute.jsx
│   ├── Sidebar.jsx
│   └── Skeleton.jsx
├── context/            # React Context providers
│   └── AuthContext.jsx
├── pages/              # Route pages
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Chat.jsx
│   └── Admin/
│       ├── Dashboard.jsx
│       └── Documents.jsx
├── lib/                # Utilities & clients
│   ├── api.js         # Axios instance
│   ├── supabase.js    # Supabase client
│   └── toast.js       # Toast utilities
├── App.jsx             # Main app component
├── main.jsx           # Entry point
└── index.css          # Global styles

```

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Install Dependencies
```bash
cd frontend
npm install
```

### Environment Variables
Create a `.env` file in the `frontend` directory:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

## 🧪 Manual Testing Checklist

### 1. Home Page (`/`)
- [ ] Page loads without errors
- [ ] All 3 feature cards display correctly
- [ ] "Bắt Đầu Ngay" button is visible
- [ ] Clicking button redirects to `/login` (if not authenticated) or `/chat` (if authenticated)
- [ ] Responsive on mobile devices

### 2. Authentication Flow
**Register (`/register`)**
- [ ] Form validation works (email format, password length)
- [ ] Successful registration shows success toast
- [ ] Redirects to `/login` after registration
- [ ] Error handling for duplicate emails

**Login (`/login`)**
- [ ] Form validation works
- [ ] Successful login redirects to `/` or intended page
- [ ] Error toast displays for wrong credentials
- [ ] "Chưa có tài khoản?" link navigates to `/register`

### 3. Chat Interface (`/chat`)
- [ ] Protected route - redirects to `/login` if not authenticated
- [ ] Sidebar shows conversation history
- [ ] "Chat Mới" button creates new conversation
- [ ] Message input accepts text
- [ ] WebSocket connection establishes (check console)
- [ ] Messages stream in real-time (token by token)
- [ ] Markdown rendering works for AI responses
- [ ] Conversation history loads correctly when selecting from sidebar
- [ ] Mobile responsive with proper layout

### 4. Admin Dashboard (`/admin`)
- [ ] Protected route
- [ ] Stats cards display (Users, Conversations, Documents, System Health)
- [ ] "Quản lý Văn bản" button navigates to `/admin/documents`
- [ ] "Về Trang chủ" button navigates to `/`

**Admin Documents (`/admin/documents`)**
- [ ] Document list table displays
- [ ] "Upload PDF" button opens file selector
- [ ] PDF upload shows progress/success toast
- [ ] Document list refreshes after upload
- [ ] Delete button works with confirmation
- [ ] Back button navigates to `/admin`

### 5. UI/UX Features
- [ ] Loading spinners appear during async operations
- [ ] Skeleton loaders show while fetching data
- [ ] Toast notifications styled correctly (success=green, error=red)
- [ ] Error boundary catches and displays errors gracefully
- [ ] Smooth animations on page transitions
- [ ] Custom scrollbar appears in overflowing containers
- [ ] All buttons have hover effects

### 6. Responsive Design
- [ ] Test on mobile (< 768px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Navigation remains usable on all screen sizes

## 🐛 Common Issues & Fixes

### WebSocket Connection Failed
**Error**: `Connection refused on ws://localhost:8001`
**Fix**: Ensure backend server is running on port 8001

### Supabase Auth Not Working
**Error**: `Invalid API key`
**Fix**: Check `.env` file has correct `VITE_SUPABASE_ANON_KEY`

### Hot Module Reload Not Working
**Fix**: 
```bash
# Restart dev server
npm run dev
```

### Build Fails with Tailwind Warnings
**Note**: `@tailwind`, `@apply` warnings from CSS linter are expected and can be ignored. These are valid Tailwind directives.

## 📝 Code Quality Notes

### Completed Features ✅
- Authentication system with Supabase
- Protected routes
- Real-time chat with WebSocket streaming
- Admin dashboard & document management
- Loading states & skeleton loaders
- Error boundary for error handling
- Responsive design
- Smooth animations
- Custom toast notifications

### Known Limitations
- Browser automation testing currently unavailable (environment issue)
- Some CSS linter warnings for Tailwind directives (expected, not errors)

## 🔗 API Endpoints Used
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/conversations` - List conversations
- `GET /api/v1/conversations/:id` - Get conversation detail
- `WS /api/v1/ws/chat` - WebSocket chat streaming
- `GET /api/v1/admin/stats` - Admin statistics
- `GET /api/v1/admin/documents` - List documents
- `POST /api/v1/admin/documents/upload` - Upload document
- `DELETE /api/v1/admin/documents/:id` - Delete document

## 👨‍💻 Development Notes
- Use React DevTools for debugging component state
- Check browser console for WebSocket connection logs
- Supabase Auth state is managed via `AuthContext`
- All API calls go through `lib/api.js` for centralized configuration
