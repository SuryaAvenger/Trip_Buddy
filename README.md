# TripBuddy - AI-Powered Travel Planner

## 🚀 Recent Updates (v2.0)

### ⚡ Performance Optimization - 50% Reduction in API Calls
- **Optimized Gemini API Integration**: Reduced from 2 API calls to 1 per itinerary generation
- **Combined Prompt Architecture**: Single comprehensive prompt handles both preference parsing and itinerary generation
- **Improved Response Time**: Eliminated sequential API call waiting
- **Better RPM Efficiency**: Effectively doubles throughput capacity with same rate limits

### 🐛 Bug Fixes
- Fixed Content Security Policy to allow Places API requests
- Added intelligent type mapping for Google Places API (e.g., "shopping" → "shopping_mall")
- Improved error handling and null checks throughout the application

An intelligent, conversational travel planning assistant powered by Google Gemini AI and Google Maps Platform. TripBuddy creates personalized, optimized itineraries based on your preferences, budget, and interests, with real-time refinement through natural language chat.

## 🌟 Features

### Core Functionality
- **AI-Powered Itinerary Generation**: Uses Google Gemini Pro to create detailed, day-by-day travel plans
- **Conversational Refinement**: Chat with the AI to modify your itinerary in real-time
- **Smart Route Optimization**: Automatically clusters activities by geography to minimize travel time
- **Budget Management**: Tracks expenses across accommodation, food, activities, and transport
- **Interactive Map Visualization**: See your entire trip on an interactive Google Map with color-coded routes
- **Google Calendar Integration**: Export your itinerary directly to Google Calendar
- **Google Sheets Export**: Generate detailed budget spreadsheets with visual breakdowns

### User Experience
- **Multi-Step Onboarding**: Intuitive 5-step wizard to capture all preferences
- **Real-Time Streaming**: Watch your itinerary generate token-by-token
- **Drag-and-Drop Reordering**: Rearrange activities with automatic route recalculation
- **Accessibility First**: WCAG 2.1 AA compliant with full keyboard navigation and screen reader support
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (utility-first approach)
- **AI**: Google Gemini Pro API (streaming responses)
- **Maps**: Google Maps JavaScript API, Places API, Directions API, Geocoding API
- **Integration**: Google Calendar API, Google Sheets API (OAuth 2.0)
- **Testing**: Vitest + React Testing Library
- **Icons**: Lucide React

### Project Structure
```
tripbuddy/
├── src/
│   ├── types/           # TypeScript type definitions
│   │   ├── trip.ts      # Domain types (Itinerary, Activity, etc.)
│   │   ├── google.ts    # Google API response types
│   │   └── gemini.ts    # Gemini AI types and prompts
│   ├── utils/           # Utility functions
│   │   ├── sanitizer.ts # Content sanitization and JSON parsing
│   │   ├── validators.ts # Input validation
│   │   ├── rateLimiter.ts # API rate limiting
│   │   └── formatters.ts # Data formatting utilities
│   ├── services/        # API integration services
│   │   ├── geminiService.ts # Gemini AI integration
│   │   ├── mapsService.ts # Google Maps integration
│   │   ├── placesService.ts # Places API integration
│   │   ├── geocodingService.ts # Geocoding API
│   │   ├── directionsService.ts # Directions API
│   │   ├── calendarService.ts # Calendar API (OAuth)
│   │   └── sheetsService.ts # Sheets API (OAuth)
│   ├── hooks/           # Custom React hooks
│   │   ├── useGemini.ts # Gemini AI hook with streaming
│   │   ├── useMaps.ts   # Google Maps hook
│   │   ├── usePlaces.ts # Places search hook
│   │   ├── useDirections.ts # Route optimization hook
│   │   ├── useCalendar.ts # Calendar integration hook
│   │   ├── useSheets.ts # Sheets integration hook
│   │   └── useSecureStorage.ts # Secure token storage
│   ├── contexts/        # React Context providers
│   │   ├── TripContext.tsx # Itinerary state management
│   │   ├── ChatContext.tsx # Conversation history
│   │   ├── MapContext.tsx # Map state and markers
│   │   └── AuthContext.tsx # OAuth token management
│   ├── components/      # React components
│   │   ├── layout/      # App shell, sidebar, header
│   │   ├── onboarding/  # Multi-step preference form
│   │   ├── chat/        # Chat interface with streaming
│   │   ├── itinerary/   # Itinerary display and editing
│   │   ├── map/         # Interactive map with routes
│   │   └── export/      # Calendar and Sheets export
│   └── tests/           # Unit and integration tests
└── ...
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Google Cloud Platform account with billing enabled
- API keys for the following services:
  - Google Gemini AI
  - Google Maps Platform (Maps JavaScript API, Places API, Directions API, Geocoding API)
  - Google Calendar API (OAuth 2.0 Client ID)
  - Google Sheets API (OAuth 2.0 Client ID)

### API Setup

#### 1. Google Gemini AI
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key for use in `.env`

#### 2. Google Maps Platform
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API (New)
   - Directions API
   - Geocoding API
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Restrict the key to the enabled APIs
6. Copy the key for use in `.env`

#### 3. Google Calendar API (OAuth)
1. In Google Cloud Console, enable **Google Calendar API**
2. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
3. Configure OAuth consent screen (External, add test users)
4. Application type: **Web application**
5. Add authorized JavaScript origins: `http://localhost:5173`
6. Add authorized redirect URIs: `http://localhost:5173`
7. Copy the **Client ID** for use in `.env`

#### 4. Google Sheets API (OAuth)
1. In Google Cloud Console, enable **Google Sheets API**
2. Use the same OAuth 2.0 Client ID from step 3
3. Add the Sheets API scope to your consent screen

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd tripbuddy

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env and add your API keys
# VITE_GEMINI_API_KEY=your_gemini_api_key
# VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key
# VITE_GOOGLE_CALENDAR_CLIENT_ID=your_calendar_client_id
# VITE_GOOGLE_SHEETS_CLIENT_ID=your_sheets_client_id
# VITE_GOOGLE_API_SCOPE=https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/spreadsheets

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## 🎯 How It Works

### 1. Onboarding Flow
Users complete a 5-step wizard:
- **Step 1**: Destination (with autocomplete), dates, number of travelers
- **Step 2**: Budget level (Budget/Mid-range/Luxury) and specific amount
- **Step 3**: Interests (Culture, Food, Nature, Adventure, etc.)
- **Step 4**: Dietary restrictions, accommodation preferences, transport modes, trip pace
- **Step 5**: Review and generate

### 2. AI Itinerary Generation
The system uses two optimized Gemini AI prompt pipelines:

**Pipeline 1: Generate Itinerary (Optimized - Single API Call)**
- Takes raw user preferences + nearby places from Google Places API
- Internally processes and structures the preferences
- Calculates budget per day, activities per day based on pace
- Optimizes for:
  - Geographic clustering (minimize travel time)
  - Meal times (breakfast 7-9am, lunch 12-2pm, dinner 6-9pm)
  - Budget constraints
  - Realistic time estimates
- Streams response token-by-token for real-time UI updates
- Returns complete multi-day itinerary with activities, meals, accommodation
- **Performance**: 50% fewer API calls compared to previous two-step approach

**Pipeline 2: Refine with Chat**
- Understands natural language modification requests
- Makes minimal necessary changes
- Returns both friendly response and JSON mutations
- Maintains logical flow and timing

### 3. Route Optimization
- Uses Google Directions API with `optimizeWaypoints: true`
- Reorders activities for optimal travel sequence
- Calculates total travel time per day
- Caches routes by waypoint hash to avoid redundant API calls

### 4. Interactive Features
- **Drag-and-Drop**: Reorder activities within a day
- **Real-Time Recalculation**: Routes update automatically on reorder
- **Map Visualization**: Color-coded markers and polylines per day
- **Chat Refinement**: Natural language modifications

### 5. Export & Integration
- **Google Calendar**: Creates one event per activity/meal with location and description
- **Google Sheets**: Generates formatted spreadsheet with budget breakdown and charts
- **OAuth Flow**: Secure popup-based authentication

## 🔒 Security

### Implemented Security Measures
- ✅ API keys stored in environment variables only
- ✅ All Gemini output sanitized before rendering
- ✅ OAuth tokens stored in sessionStorage (cleared on close)
- ✅ Content Security Policy meta tag
- ✅ No `eval()` or `innerHTML` with unsanitized content
- ✅ Rate limiting on all external API calls
- ✅ Input validation before every API call
- ✅ XSS protection through HTML entity escaping

## ♿ Accessibility

### WCAG 2.1 AA Compliance
- ✅ All images have alt text
- ✅ All form inputs have associated labels
- ✅ Error messages linked via `aria-describedby`
- ✅ Loading states announced via `aria-live="polite"`
- ✅ Modal focus trapping
- ✅ Color contrast ratio ≥ 4.5:1
- ✅ No information conveyed by color alone
- ✅ Skip-to-main-content link
- ✅ Logical tab order
- ✅ Custom interactive elements have proper ARIA roles

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
- Unit tests for validators (10+ test cases)
- Unit tests for rate limiter (token exhaustion, refill, retry logic)
- Integration tests for useGemini hook (streaming, error handling, cancellation)
- Integration tests for geminiService (all three pipelines)

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

## 📊 Performance Optimizations

- **Code Splitting**: Lazy loading of heavy components (Map, Export)
- **Memoization**: Expensive calculations cached with `useMemo`
- **Debouncing**: Route recalculation debounced by 500ms
- **Route Caching**: Routes cached by waypoint hash
- **Message Virtualization**: Chat messages virtualized for 50+ items

## 🤝 Contributing

This project was built for a hackathon. Contributions, issues, and feature requests are welcome!

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Google Gemini AI for intelligent itinerary generation
- Google Maps Platform for location services
- Google Workspace APIs for seamless integration
- React and TypeScript communities for excellent tooling

## 📧 Contact

For questions or feedback about this project, please open an issue on GitHub.

---

**Built with ❤️ for the Google AI Hackathon**