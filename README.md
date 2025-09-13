<div align="center">
  <img src="public/logo.webp" alt="Musicality Logo" width="128" height="128">
</div>

# Musicality

A beautiful, intuitive music player web app designed to help you discover and enjoy playlists from JioSaavn with a seamless experience.

<div align="center"> 
<img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React"/>
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
<img src="https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
<img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel"/>
</div>

## Features

### Personalized Music Discovery
- Explore featured playlists by language (English, Hindi, Punjabi, Haryanvi)
- Click on playlists to fetch and autoplay the first song
- Robust API integration with JioSaavn for song metadata and lyrics

### Smart Player Controls
- **Persistent Player**: Sticky footer player that stays across pages
- **Mobile Bottom Sheet**: Draggable bottom sheet on mobile with collapse/expand states
- **Full Controls**: Play/pause, next/previous, seek, volume, and progress tracking
- **Auto-Next**: Automatically plays the next song in the album

### Intuitive User Interface
- **Responsive Design**: Works beautifully on desktop and mobile
- **Monochrome Controls**: Clean, white/grey progress and volume bars
- **Visual Feedback**: Album art display and song details
- **Queue Management**: Up-next queue with song selection

### Seamless Playback
- **High-Quality Audio**: Prefers 320kbps downloads when available
- **Lyrics Integration**: Fetch and display lyrics for songs
- **Song Search**: Search for songs and play from results
- **Duration Display**: Shows song duration and progress

### Mobile-First Experience
- **Bottom Sheet Interactions**: Tap to collapse, swipe to close
- **Overlay Close**: Tap outside the sheet to close on mobile
- **Touch Gestures**: Smooth drag and tap interactions

## Getting Started

### Prerequisites
- Node.js (version 18.x or higher)
- pnpm (recommended) or npm

### Installation
1. Clone the repository:
   ```bash
   git clone [Link to Repository]
   cd Musicality
   ```

2. Install dependencies:
   ```bash
   pnpm install
   # or
   npm install
   ```

3. Start the development server:
   ```bash
   pnpm run dev
   # or
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production
```bash
pnpm run build
# or
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## User Experience Highlights

### Seamless Navigation
- **Persistent Footer**: Desktop player remains visible across pages
- **Mobile Sheet**: Expandable bottom sheet for mobile controls
- **Page Transitions**: Smooth routing between Home, Player, and other pages

### Visual Design
- **Modern UI**: Clean interface with Tailwind CSS styling
- **Album Art**: High-quality cover images with rounded corners
- **Progress Indicators**: Dynamic progress bars that reflect current playback
- **Typography**: Clear, readable text with appropriate hierarchy

### Accessibility
- **Keyboard Navigation**: Full keyboard support for controls
- **Screen Reader Friendly**: Proper ARIA labels and semantic HTML
- **High Contrast**: Sufficient color contrast for readability
- **Touch Targets**: Adequate size for mobile interactions

## Technical Implementation

### Architecture
- Built with React for declarative UI components
- Vite for fast development and optimized builds
- Tailwind CSS for utility-first styling
- React Router for client-side routing
- Context API for global player state management

### Key Components
- **PlayerContext**: Centralized state for song playback and metadata
- **Footer**: Desktop persistent player with global audio element
- **MobileBottomSheet**: Mobile-specific player interface
- **Home**: Playlist discovery and selection
- **VisualizerSection**: Album art and lyrics display

### API Integration
- JioSaavn API via saavn.dev for song data
- Robust URL substitution and fallback handling
- Local storage caching for playlists
- Lyrics fetching from lrclib.net

### Deployment
- Optimized for Vercel deployment
- Static site generation with Vite
- Optional serverless functions for API proxying

## Screens

1. **Home**: Featured playlists by language
2. **Player View**: Full-screen player with queue and lyrics
3. **Queue and Lyrics**: Up-next songs and synchronized lyrics
4. **Search Results**: Song search with artist and album info

## Target Audience

Musicality is designed for:
- **Music Lovers** seeking a modern web player experience
- **Developers** exploring React and API integrations
- **Users** who prefer high-quality audio and seamless playback
- **Anyone** looking for a beautiful, functional music app

## Future Enhancements

While Musicality is already a powerful music player, future updates may include:
- Offline playback and download support
- Advanced playlist management and creation
- Social features and sharing
- Integration with more music services
- Enhanced audio visualizations
- Dark mode and theme customization

## Built With

- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [React Router](https://reactrouter.com/) - Declarative routing for React
- [Axios](https://axios-http.com/) - Promise based HTTP client
- [Lucide React](https://lucide.dev/) - Beautiful & consistent icon toolkit

*Musicality - Making music discovery beautiful and intuitive*
