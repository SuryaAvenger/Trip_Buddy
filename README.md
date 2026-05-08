# 🌍 TripBuddy - AI-Powered Travel Planner

> An intelligent, conversational travel planning assistant powered by Google Gemini AI and Google Maps Platform. TripBuddy creates personalized, optimized itineraries based on your preferences, budget, and interests, with real-time refinement through natural language chat.

[![Deploy to Cloud Run](https://img.shields.io/badge/Deploy%20to-Cloud%20Run-blue?logo=google-cloud)](CLOUD_RUN_DEPLOYMENT.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)

![TripBuddy Banner](https://via.placeholder.com/1200x400/4F46E5/FFFFFF?text=TripBuddy+-+AI+Travel+Planner)

---

## 🚀 Recent Updates (v2.1 - Production Ready)

### ✅ Critical Bug Fixes
- **Fixed Default Form Values**: Resolved travelers and currency validation errors
- **Gemini API Integration**: Updated to `gemini-2.5-flash` model with proper configuration
- **JSON Parsing**: Fixed response parsing with markdown code block handling
- **Token Limits**: Increased to 32,768 tokens to prevent truncation
- **Error Handling**: Added user-friendly messages for 503 service unavailable errors
- **Google Places API**: Added type mapping for unsupported categories (wellness → spa)
- **Budget Display**: Added null checks and fallback values to prevent crashes
- **Route Optimization**: Removed client-side CORS-failing optimization step

### 🐳 Cloud Deployment Ready
- **Docker Support**: Multi-stage build with nginx for production
- **Google Cloud Run**: Complete deployment configuration with Cloud Build
- **Environment Variables**: Proper handling of build-time API keys
- **One-Command Deploy**: Automated deployment script included
- **Production Optimized**: Compressed assets, health checks, and auto-scaling

### ⚡ Performance Optimization (v2.0)
- **50% Reduction in API Calls**: Optimized from 2 to 1 Gemini API call per itinerary
- **Combined Prompt Architecture**: Single comprehensive prompt for generation
- **Improved Response Time**: Eliminated sequential API call waiting
- **Better RPM Efficiency**: Effectively doubles throughput capacity

---

## 🌟 Features

### 🤖 AI-Powered Intelligence
- **Smart Itinerary Generation**: Google Gemini 2.5 Flash creates detailed, day-by-day travel plans
- **Conversational Refinement**: Chat with AI to modify your itinerary in real-time
- **Context-Aware Suggestions**: AI understands your preferences and budget constraints
- **Streaming Responses**: Watch your itinerary generate token-by-token

### 🗺️ Maps & Navigation
- **Interactive Map Visualization**: See your entire trip on Google Maps with color-coded routes
- **Smart Route Optimization**: Automatically clusters activities by geography to minimize travel time
- **Real-Time Directions**: Get walking, driving, or transit directions between activities
- **Place Discovery**: Powered by Google Places API with 100M+ locations

### 💰 Budget Management
- **Intelligent Budget Tracking**: Tracks expenses across accommodation, food, activities, and transport
- **Currency Support**: Multiple currencies with real-time conversion
- **Budget Breakdown**: Visual charts showing spending by category
- **Cost Optimization**: AI suggests alternatives to fit your budget

### 📅 Seamless Integration
- **Google Calendar Export**: One-click export to your calendar with all details
- **Google Sheets Export**: Generate detailed budget spreadsheets with charts
- **OAuth 2.0 Security**: Secure authentication for Google services
- **Cross-Platform Sync**: Access your itinerary anywhere

### 🎨 User Experience
- **Multi-Step Onboarding**: Intuitive 5-step wizard to capture preferences
- **Drag-and-Drop Reordering**: Rearrange activities with automatic route recalculation
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Accessibility First**: WCAG 2.1 AA compliant with full keyboard navigation
- **Dark Mode Ready**: Eye-friendly interface for all lighting conditions

---

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks and concurrent features
- **TypeScript 5.5** - Type-safe development with advanced features
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful, consistent icons

### AI & APIs
- **Google Gemini AI** - Advanced language model for itinerary generation
- **Google Maps JavaScript API** - Interactive maps and markers
- **Google Places API (New)** - Location search and details
- **Google Directions API** - Route optimization and navigation
- **Google Geocoding API** - Address to coordinates conversion
- **Google Calendar API** - Calendar integration with OAuth
- **Google Sheets API** - Spreadsheet generation with OAuth

### DevOps & Deployment
- **Docker** - Containerization with multi-stage builds
- **Google Cloud Run** - Serverless container deployment
- **Google Cloud Build** - CI/CD pipeline
- **Nginx** - Production web server
- **GitHub Actions Ready** - CI/CD automation support

### Testing & Quality
- **Vitest** - Fast unit testing framework
- **React Testing Library** - Component testing
- **TypeScript ESLint** - Code quality and consistency
- **Prettier** - Code formatting

---

## 📁 Project Structure

```
tripbuddy/
├── src/
│   ├── components/          # React components
│   │   ├── layout/          # App shell, sidebar, header
│   │   ├── onboarding/      # Multi-step preference form
│   │   ├── chat/            # Chat interface with streaming
│   │   ├── itinerary/       # Itinerary display and editing
│   │   ├── map/             # Interactive map with routes
│   │   └── export/          # Calendar and Sheets export
│   ├── contexts/            # React Context providers
│   │   ├── TripContext.tsx  # Itinerary state management
│   │   ├── ChatContext.tsx  # Conversation history
│   │   ├── MapContext.tsx   # Map state and markers
│   │   └── AuthContext.tsx  # OAuth token management
│   ├── hooks/               # Custom React hooks
│   │   ├── useGemini.ts     # Gemini AI with streaming
│   │   ├── useMaps.ts       # Google Maps integration
│   │   ├── usePlaces.ts     # Places search
│   │   ├── useDirections.ts # Route optimization
│   │   ├── useCalendar.ts   # Calendar integration
│   │   ├── useSheets.ts     # Sheets integration
│   │   └── useSecureStorage.ts # Secure token storage
│   ├── services/            # API integration services
│   │   ├── geminiService.ts # Gemini AI integration
│   │   ├── mapsService.ts   # Google Maps
│   │   ├── placesService.ts # Places API
│   │   ├── geocodingService.ts # Geocoding
│   │   ├── directionsService.ts # Directions
│   │   ├── calendarService.ts # Calendar (OAuth)
│   │   └── sheetsService.ts # Sheets (OAuth)
│   ├── types/               # TypeScript definitions
│   │   ├── trip.ts          # Domain types
│   │   ├── google.ts        # Google API types
│   │   └── gemini.ts        # Gemini AI types
│   ├── utils/               # Utility functions
│   │   ├── sanitizer.ts     # Content sanitization
│   │   ├── validators.ts    # Input validation
│   │   ├── rateLimiter.ts   # API rate limiting
│   │   └── formatters.ts    # Data formatting
│   └── tests/               # Unit & integration tests
├── Dockerfile               # Production container
├── cloudbuild.yaml          # Cloud Build config
├── deploy.sh                # Deployment script
├── nginx.conf               # Nginx configuration
└── CLOUD_RUN_DEPLOYMENT.md  # Deployment guide
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **Google Cloud Platform** account with billing enabled
- **API Keys** for:
  - Google Gemini AI
  - Google Maps Platform
  - Google Calendar API (OAuth 2.0)
  - Google Sheets API (OAuth 2.0)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/tripbuddy.git
cd tripbuddy
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up API Keys

#### Google Gemini AI
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key

#### Google Maps Platform
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps JavaScript API
   - Places API (New)
   - Directions API
   - Geocoding API
4. Create an API key and restrict it to these APIs

#### Google Calendar & Sheets (OAuth)
1. Enable **Google Calendar API** and **Google Sheets API**
2. Create **OAuth 2.0 Client ID** (Web application)
3. Configure OAuth consent screen
4. Add authorized origins: `http://localhost:5173`
5. Copy the Client ID

### 4. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your keys
nano .env
```

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key_here
VITE_GOOGLE_CALENDAR_CLIENT_ID=your_calendar_client_id_here
VITE_GOOGLE_SHEETS_CLIENT_ID=your_sheets_client_id_here
VITE_GOOGLE_API_SCOPE=https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/spreadsheets
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🐳 Docker Deployment

### Local Docker Build

```bash
# Build the image
docker build \
  --build-arg VITE_GEMINI_API_KEY=your_key \
  --build-arg VITE_GOOGLE_MAPS_API_KEY=your_key \
  --build-arg VITE_GOOGLE_CALENDAR_CLIENT_ID=your_id \
  --build-arg VITE_GOOGLE_SHEETS_CLIENT_ID=your_id \
  -t tripbuddy .

# Run the container
docker run -p 8080:80 tripbuddy
```

### Google Cloud Run Deployment

See [CLOUD_RUN_DEPLOYMENT.md](CLOUD_RUN_DEPLOYMENT.md) for complete deployment guide.

**Quick Deploy:**

```bash
# Make deploy script executable
chmod +x deploy.sh

# Deploy to Cloud Run
./deploy.sh
```

---

## 🎯 How It Works

### 1. Onboarding Flow

Users complete a 5-step wizard:

1. **Destination & Dates**: Where and when (with autocomplete)
2. **Budget**: Budget level and specific amount with currency
3. **Interests**: Culture, Food, Nature, Adventure, Shopping, etc.
4. **Preferences**: Dietary restrictions, accommodation, transport, pace
5. **Review**: Confirm and generate itinerary

### 2. AI Itinerary Generation

**Single Optimized Pipeline:**
- Takes user preferences + nearby places from Google Places API
- Internally processes and structures preferences
- Calculates budget per day, activities per day based on pace
- Optimizes for:
  - Geographic clustering (minimize travel time)
  - Meal times (breakfast 7-9am, lunch 12-2pm, dinner 6-9pm)
  - Budget constraints
  - Realistic time estimates
- Streams response token-by-token for real-time UI
- Returns complete multi-day itinerary

**Chat Refinement:**
- Natural language modification requests
- Makes minimal necessary changes
- Returns friendly response + JSON mutations
- Maintains logical flow and timing

### 3. Route Optimization

- Uses Google Directions API with `optimizeWaypoints: true`
- Reorders activities for optimal travel sequence
- Calculates total travel time per day
- Caches routes to avoid redundant API calls

### 4. Interactive Features

- **Drag-and-Drop**: Reorder activities within a day
- **Real-Time Updates**: Routes recalculate automatically
- **Map Visualization**: Color-coded markers and polylines
- **Chat Refinement**: Natural language modifications

### 5. Export & Integration

- **Google Calendar**: Creates events with location and description
- **Google Sheets**: Generates formatted spreadsheet with charts
- **OAuth Flow**: Secure popup-based authentication

---

## 🔒 Security

### Implemented Security Measures

- ✅ API keys in environment variables only (never committed)
- ✅ All Gemini output sanitized before rendering
- ✅ OAuth tokens in sessionStorage (cleared on close)
- ✅ Content Security Policy meta tag
- ✅ No `eval()` or `innerHTML` with unsanitized content
- ✅ Rate limiting on all external API calls
- ✅ Input validation before every API call
- ✅ XSS protection through HTML entity escaping
- ✅ HTTPS enforced in production
- ✅ Secure headers in nginx configuration

---

## ♿ Accessibility

### WCAG 2.1 AA Compliance

- ✅ All images have descriptive alt text
- ✅ All form inputs have associated labels
- ✅ Error messages linked via `aria-describedby`
- ✅ Loading states announced via `aria-live="polite"`
- ✅ Modal focus trapping
- ✅ Color contrast ratio ≥ 4.5:1
- ✅ No information conveyed by color alone
- ✅ Skip-to-main-content link
- ✅ Logical tab order
- ✅ Keyboard navigation for all interactive elements
- ✅ Screen reader friendly

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

- ✅ Unit tests for validators (10+ test cases)
- ✅ Unit tests for rate limiter (token exhaustion, refill, retry)
- ✅ Integration tests for useGemini hook (streaming, errors, cancellation)
- ✅ Integration tests for geminiService (all pipelines)
- ✅ Component tests for critical UI elements

---

## 📊 Performance Optimizations

- **Code Splitting**: Lazy loading of heavy components (Map, Export)
- **Memoization**: Expensive calculations cached with `useMemo`
- **Debouncing**: Route recalculation debounced by 500ms
- **Route Caching**: Routes cached by waypoint hash
- **Message Virtualization**: Chat messages virtualized for 50+ items
- **Image Optimization**: Lazy loading and responsive images
- **Bundle Size**: Tree-shaking and minification in production
- **API Efficiency**: 50% fewer Gemini API calls

---

## 🎨 Design System

### Color Palette

- **Primary**: Indigo (600/700) - Buttons, active states
- **Secondary**: Violet (500) - Accents, streaming indicator
- **Background**: Gray (50) - App background
- **Surface**: White - Cards, panels
- **Text**: Gray (900/500) - Primary/secondary text
- **Success**: Emerald (500)
- **Error**: Red (500)
- **Warning**: Amber (500)

### Typography

- **Headings**: font-semibold tracking-tight
- **Body**: font-normal leading-relaxed
- **Monospace**: font-mono text-xs (timestamps, IDs)

### Components

- Border radius: `rounded-xl` (cards), `rounded-lg` (inputs)
- Shadows: `shadow-sm` (cards), `shadow-md` (modals)
- Focus states: `ring-2 ring-indigo-500`
- Transitions: `transition-all duration-200`

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** for intelligent itinerary generation
- **Google Maps Platform** for comprehensive location services
- **Google Workspace APIs** for seamless integration
- **React & TypeScript** communities for excellent tooling
- **Open Source Community** for inspiration and support

---

## 📧 Support

For questions, issues, or feedback:

- 📫 Open an issue on [GitHub Issues](https://github.com/yourusername/tripbuddy/issues)
- 💬 Start a discussion on [GitHub Discussions](https://github.com/yourusername/tripbuddy/discussions)
- 📧 Email: your.email@example.com

---

## 🗺️ Roadmap

### Upcoming Features

- [ ] Multi-language support (i18n)
- [ ] Offline mode with service workers
- [ ] Social sharing of itineraries
- [ ] Collaborative trip planning
- [ ] Mobile app (React Native)
- [ ] AI-powered photo recommendations
- [ ] Weather integration
- [ ] Flight and hotel booking integration
- [ ] User accounts and saved trips
- [ ] Community itinerary templates

---

## 📸 Screenshots

### Onboarding Flow
![Onboarding](https://via.placeholder.com/800x500/4F46E5/FFFFFF?text=Onboarding+Flow)

### Itinerary View
![Itinerary](https://via.placeholder.com/800x500/4F46E5/FFFFFF?text=Itinerary+View)

### Interactive Map
![Map](https://via.placeholder.com/800x500/4F46E5/FFFFFF?text=Interactive+Map)

### Chat Interface
![Chat](https://via.placeholder.com/800x500/4F46E5/FFFFFF?text=Chat+Interface)

---

<div align="center">

**Built with ❤️ for travelers worldwide**

[⭐ Star this repo](https://github.com/yourusername/tripbuddy) | [🐛 Report Bug](https://github.com/yourusername/tripbuddy/issues) | [✨ Request Feature](https://github.com/yourusername/tripbuddy/issues)

</div>