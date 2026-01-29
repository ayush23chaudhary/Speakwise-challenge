# SpeakWise Challenge - Frontend

React frontend for the SpeakWise Challenge competition platform.

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Backend server running on http://localhost:5000

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will open at http://localhost:3000

### Build for Production

```bash
npm run build
```

## 📱 Features

- **Mobile-First Design**: Optimized for smartphones and tablets
- **Responsive Layout**: Works seamlessly on all devices
- **Progress Tracking**: Visual indicators for each step
- **Audio Recording**: Browser-based recording with MediaRecorder API
- **Real-Time Feedback**: AI evaluation with detailed metrics
- **Live Leaderboard**: Competition rankings with auto-refresh
- **Judge Dashboard**: Admin panel for viewing and managing participants

## 🎨 Design System

### Colors
- Primary: Deep Indigo (#1E2A5A, #2A3A7A)
- Accent: Teal (#1FB6A6, #17A293)
- Feature: Violet (#6C63FF, #5A52E8)
- Background: Off-white (#F8FAFF, #EEF2FF)

### Components
- Custom buttons (btn-primary, btn-secondary, btn-outline)
- Input fields with focus states
- Progress indicators
- Score cards with animations
- Modal overlays

## 📂 Project Structure

```
src/
├── components/
│   ├── challenge/
│   │   ├── ChallengeRegistration.jsx
│   │   ├── RecordingStudio.jsx
│   │   ├── EvaluationSummary.jsx
│   │   ├── Leaderboard.jsx
│   │   └── JudgeDashboard.jsx
│   └── common/
│       ├── ProgressIndicator.jsx
│       └── ScoreCard.jsx
├── pages/
│   ├── ChallengeLanding.jsx
│   └── JudgeLogin.jsx
├── services/
│   └── api.js
├── App.js
├── index.js
└── index.css
```

## 🔧 Configuration

Create `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📝 Available Routes

- `/` - Landing page
- `/register` - Registration form
- `/record/:participantId` - Recording studio
- `/evaluation/:participantId` - Evaluation results
- `/leaderboard` - Public leaderboard
- `/judge/login` - Judge authentication
- `/judge/dashboard` - Judge admin panel

## 🎯 Key Features

### Recording Studio
- 30-60 second constraint
- Real-time timer
- Audio preview
- Auto-stop at 60 seconds
- Validation before submission

### Evaluation Summary
- Overall score display
- 7 detailed metrics
- AI feedback
- Strengths & improvements
- Tips for enhancement

### Leaderboard
- Real-time rankings
- Top 3 highlighted
- Responsive grid/table
- Auto-refresh capability

### Judge Dashboard
- All participants view
- Audio playback
- Score breakdown
- Filter & sort options
- CSV export

## 🧪 Testing

```bash
npm test
```

## 📦 Dependencies

- react: UI library
- react-router-dom: Routing
- axios: HTTP client
- react-icons: Icon library
- tailwindcss: Styling

## 🐛 Troubleshooting

### Microphone Access
- Ensure HTTPS or localhost
- Grant permission in browser settings
- Check browser compatibility

### Audio Recording Issues
- Use Chrome/Firefox for best support
- Check MediaRecorder API availability
- Verify audio input device

### API Connection
- Verify backend is running
- Check CORS settings
- Confirm API_URL in .env

## 📄 License

MIT License - See LICENSE file for details
