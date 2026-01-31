# 🐛 Professional Bug Tracker

A modern, feature-rich bug tracking application built with React, Vite, and Firebase. Designed for teams to collaborate on issue tracking with beautiful UI and powerful features.

## ✨ Features

### Core Features
- 🎯 **Multi-View Dashboard**: Overview, Kanban, Priority Matrix, Timeline
- 📝 **Bug Management**: Create, edit, delete, filter, and search bugs
- 💬 **Comments & Collaboration**: Real-time comments and activity tracking
- 📊 **Analytics**: Detailed reports, statistics, and metrics
- 👥 **Team Management**: User roles and team member tracking
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile

### Advanced Features
- 🎬 **Kanban Board**: Drag-and-drop bug status updates
- 📈 **Gantt Chart**: Timeline visualization of bugs
- 🎪 **Priority Matrix**: Urgency vs. Importance analysis
- 🔔 **Notifications**: Real-time toast notifications
- 🔍 **Advanced Filtering**: Filter by status, severity, assignee, date range
- ⚡ **Bulk Operations**: Update or delete multiple bugs at once
- 📥 **Export**: Download bug data in CSV format
- 🌙 **Light Theme**: Beautiful, modern light interface

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase account with Firestore setup
- Modern web browser

### Installation

1. Clone the repository
```bash
cd "Test tracking"
npm install
```

2. Configure Firebase
- Update `src/firebaseConfig.jsx` with your Firebase credentials

3. Start development server
```bash
npm run dev
```

4. Build for production
```bash
npm run build
```

## 📁 Project Structure

```
src/
├── Components/          # React components
│   ├── Advanced/       # Advanced UI components
│   └── *.jsx           # Reusable components
├── contexts/           # Global state management
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # Firebase service layer
├── utils/              # Utility functions
├── constants/          # Constants and enums
├── types/              # Type definitions
├── App.jsx             # Main app component
└── main.jsx            # Entry point
```

## 🎨 Design System

### Color Palette
- **Primary**: Indigo (#4F46E5)
- **Success**: Emerald (#10B981)
- **Warning**: Amber (#F59E0B)
- **Danger**: Rose (#F43F5E)
- **Neutral**: Slate (#64748B)

### Components
- **Buttons**: Primary, secondary, ghost variants
- **Cards**: Stats, action, info cards
- **Badges**: Color-coded status and severity badges
- **Tables**: Sortable, filterable data tables
- **Forms**: Input fields with validation

## 🔐 Authentication

The app uses Firebase Authentication with:
- Email/password signup and login
- Session management
- Role-based access control (Admin, User, Team Lead, Viewer)

## 📊 Data Models

### Bug
- `id`: Unique identifier
- `bugId`: Human-readable bug number
- `title`: Bug title
- `description`: Detailed description
- `status`: Open, In Progress, Resolved, Closed, On Hold
- `severity`: Low, Medium, High, Critical
- `assignedTo`: User ID of assigned person
- `createdBy`: User ID of creator
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp
- `tags`: Array of tags
- `watchers`: Array of user IDs
- `dueDate`: Target completion date
- `screenshotURL`: Bug screenshot URL

### User
- `id`: User ID (from Firebase)
- `email`: User email
- `username`: Display name
- `role`: User role
- `profilePic`: Profile picture URL
- `createdAt`: Account creation date

## 🔄 State Management

Uses React Context API for:
- **BugContext**: Bug data and filtering
- **UIContext**: UI state (sidebar, theme, notifications)
- **UserContext**: Current user profile

## 📈 Performance

- Build Size: ~967 KB (minified)
- CSS Size: ~45 KB (minified)
- Modules: 1,776+ transformed
- Fast loading with Vite
- Optimized re-renders with useMemo
- Real-time updates with Firebase subscriptions

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

### Technologies Used

- **React 19**: UI library
- **Vite 7**: Build tool
- **Tailwind CSS 4**: Styling
- **Firebase 12**: Backend & Auth
- **React Router 7**: Navigation
- **React Icons 5**: Icon library
- **Firestore**: Database

## 📚 Documentation

- **Features**: See `FEATURES.md` for complete feature list
- **API**: Services are in `src/services/`
- **Utilities**: Helpers in `src/utils/`
- **Components**: Custom components in `src/Components/`

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - feel free to use this for personal or commercial projects

## 🙌 Support

For issues or questions:
1. Check the FEATURES.md for feature details
2. Review the code comments
3. Check Firebase documentation

## 🎯 Roadmap

Potential future enhancements:
- Dark mode theme
- Custom fields for bugs
- Automated workflows
- Webhook integrations
- API for third-party apps
- Mobile app (React Native)
- Sprint/Release management
- Time tracking
- SLA monitoring
- Advanced reporting

## 📊 Stats

- **Components**: 30+
- **Custom Hooks**: 4+
- **Service Modules**: 3
- **Utility Functions**: 15+
- **Total Lines of Code**: 5000+

---

**Made with ❤️ for better bug tracking**

Last Updated: November 27, 2025
