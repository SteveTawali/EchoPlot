# EchoPlot 🌳

**Creating Ripples of Impact Through Time**

EchoPlot transforms tree planting from a simple agricultural activity into a profound act of intergenerational stewardship. Every tree you plant creates ripples that echo through generations.

## Project Overview

EchoPlot is an AI-powered tree matching platform specifically designed for Kenya, helping farmers and landowners discover the perfect tree species for their land through an intuitive swipe-based interface. The platform combines machine learning algorithms, scientific tree compatibility data, and real-time weather information to provide personalized recommendations that improve over time.

## Key Features

### 🤖 AI-Powered Recommendations
- **Machine Learning Engine**: Learns from user behavior and success patterns
- **Collaborative Filtering**: Finds trees based on similar users' preferences
- **Predictive Analytics**: Forecasts tree survival probability and success rates
- **Adaptive Learning**: Recommendations improve with more user data

### 🌍 Location-Based Matching
- **GPS Detection**: Automatic location detection for county and constituency
- **Agro-Ecological Zones**: Maps to Kenya's 6 agro-ecological zones (LH1-UH6)
- **Smart Filtering**: Only shows trees with 50%+ compatibility for your location
- **County-Specific**: Tailored recommendations for all 47 Kenyan counties

### 🌳 Comprehensive Tree Database
- **20+ Kenyan Species**: Curated selection of native and adapted trees
- **Bilingual Support**: English and Kiswahili names for all species
- **Scientific Data**: KEFRI-aligned information with scientific names
- **Pricing**: Market-based pricing in Kenyan Shillings (KSH)

### 🌦️ Weather Integration
- **Real-time Weather**: Current conditions and temperature data
- **Rainfall Estimation**: Annual rainfall patterns for tree suitability
- **Seasonal Recommendations**: Optimal planting times (Long rains: Mar-May, Short rains: Oct-Nov)

### 📱 Progressive Web App
- **Offline-First**: Works without internet connection
- **Installable**: Can be installed on mobile devices like a native app
- **Accessibility**: WCAG 2.1 Level AA compliant with screen reader support
- **Performance**: Optimized for mobile networks and low-end devices

### 🔐 AI-Enhanced Verification System
- **AI Image Recognition**: Automatically identifies tree species from photos with 85%+ accuracy
- **Health Assessment**: AI analyzes tree health and detects diseases/pests
- **Growth Stage Detection**: Determines if tree is seedling, sapling, or mature
- **Planting Validation**: Verifies proper planting location and environment
- **County-Based Moderation**: KFS officers assigned to specific counties
- **M-Pesa Integration**: Reward payments upon successful verification
- **Analytics Dashboard**: County-level performance tracking

### 💬 AI Chatbot Assistant
- **24/7 Support**: Bilingual AI assistant for tree care advice
- **Contextual Help**: Provides location and season-specific guidance
- **Troubleshooting**: Diagnoses tree problems and suggests solutions
- **Planting Advice**: Step-by-step guidance for optimal tree planting

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI/ML**: Custom machine learning algorithms for recommendations
- **Computer Vision**: AI-powered image recognition and analysis
- **Natural Language Processing**: AI chatbot with contextual understanding
- **Maps**: Leaflet + React-Leaflet
- **PWA**: Vite PWA Plugin + Service Workers
- **State Management**: TanStack Query + React Hook Form
- **Charts**: Recharts for analytics
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (for backend services)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd plant-match-love

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase URL and anon key

# Start development server
npm run dev
```

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── SwipeInterface.tsx
│   ├── TreeCard.tsx
│   └── ...
├── pages/              # Route components
│   ├── admin/          # Admin dashboard pages
│   ├── profile/        # User profile pages
│   └── ...
├── data/               # Static data and constants
│   ├── kenya.ts        # Kenyan tree species data
│   └── trees.ts        # General tree data
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── integrations/       # External service integrations
    └── supabase/       # Supabase client and types
```

## Key Components

### AI Recommendation Engine
The platform uses advanced machine learning algorithms:

- **Collaborative Filtering**: Learns from similar users' preferences and outcomes
- **Content-Based Filtering**: Matches trees based on user profile and location
- **Hybrid Approach**: Combines multiple ML techniques for optimal recommendations
- **Continuous Learning**: Model improves with each user interaction and outcome

### Tree Matching Algorithm
Enhanced with AI-powered scoring:

- **County Match (25%)**: Trees must be suitable for the user's county
- **Agro-Zone Match (20%)**: Trees must match the local agro-ecological zone  
- **Conservation Goals (15%)**: Trees must align with user's goals
- **Historical Success (20%)**: Based on actual planting outcomes in similar conditions
- **User Similarity (15%)**: Recommendations from users with similar profiles
- **Environmental Factors (5%)**: Real-time weather and seasonal conditions

### AI Image Recognition System
- **Species Identification**: Computer vision identifies tree species from photos
- **Health Assessment**: Detects diseases, pests, and health issues
- **Growth Stage Analysis**: Determines tree maturity and development stage
- **Environment Validation**: Verifies proper planting location and conditions

### AI Chatbot Assistant
- **Natural Language Processing**: Understands user queries in English and Kiswahili
- **Contextual Responses**: Provides location and season-specific advice
- **Knowledge Base**: Comprehensive tree care and planting information
- **Learning Capability**: Improves responses based on user interactions

### Success Probability Calculator
AI-enhanced prediction system that factors in:
- Location compatibility and historical success rates
- User behavior patterns and preferences
- Environmental conditions and seasonal factors
- Machine learning models trained on actual outcomes

### Offline-First Architecture
- Service worker caches essential assets
- Offline fallback pages
- Background sync for verification submissions
- Network-first strategy with cache fallback

## Deployment

### Production Build
```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Hosting Options
- **Vercel**: Connect your GitHub repo for automatic deployments
- **Netlify**: Deploy with continuous integration
- **Supabase**: Use Supabase's hosting for full-stack deployment
- **Any static hosting**: The build output can be deployed to any static hosting service

## Contributing

We welcome contributions to EchoPlot! Here's how you can help:

1. **Fork the repository** and create a feature branch
2. **Make your changes** following the existing code style
3. **Test thoroughly** especially the offline functionality
4. **Submit a pull request** with a clear description of your changes

### Development Guidelines
- Follow TypeScript best practices
- Ensure accessibility compliance (WCAG 2.1 Level AA)
- Test on mobile devices and slow networks
- Maintain bilingual support (English/Kiswahili)

## License

This project is part of a hackathon submission focused on environmental impact and sustainable agriculture in Kenya.

---

**EchoPlot** - Making the world greener, one swipe at a time 🌱
