# Campsite Availability Checker

A modern, user-friendly React application for checking campsite availability on Recreation.gov.

## Features

- 🏕️ Check availability for any Recreation.gov campground
- 🔍 Search campgrounds by name or browse by state (with API key)
- 📅 Visual calendar showing available and reserved dates
- 🎨 Modern, responsive design with glassmorphism effects
- 🚀 Fast and lightweight using Vite
- 📱 Mobile-friendly interface
- ⭐ Pre-loaded with popular national park campgrounds
- 🔄 Real-time autocomplete search

## Getting Started

### Installation

```bash
npm install
```

### API Key Setup (Optional but Recommended)

To use the campground search and browse-by-state features, you need a free API key:

1. Visit [RIDB Recreation.gov](https://ridb.recreation.gov/) and create an account
2. Generate a free API key
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Add your API key to the `.env` file:
   ```
   VITE_RECREATION_API_KEY=your_api_key_here
   ```

**Note:** The app works without an API key using the pre-loaded popular campgrounds list, but search and browse features require an API key.

### Development

```bash
npm run dev
```

Open your browser to the URL shown in the terminal (typically `http://localhost:5173`).

### Build for Production

```bash
npm run build
```

## How to Use

### Three Ways to Find Campgrounds:

1. **Quick Select**: Choose from popular campgrounds in the dropdown
2. **Search by Name**: Type a campground name (e.g., "Yosemite") to see autocomplete suggestions (requires API key)
3. **Browse by State**: Select a state to see campgrounds in that area (requires API key)

### Check Availability:

1. Select or search for a campground
2. Choose your start and end dates
3. Click "Check Availability"
4. View results with available sites highlighted in green

## Technical Details

- **Framework**: React 18
- **Build Tool**: Vite
- **APIs**:
  - RIDB (Recreation Information Database) API for campground search
  - Recreation.gov API for availability data
- **Styling**: Pure CSS with modern gradients and glassmorphism effects

## API Information

### RIDB API (for search/browse features)
- **Endpoint**: https://ridb.recreation.gov/api/v1
- **Authentication**: API key required (free)
- **Get a key**: https://ridb.recreation.gov/
- **Features**: Search campgrounds by name, browse by state, get facility details

### Recreation.gov Availability API
- **Endpoint**: https://www.recreation.gov/api
- **Authentication**: None required
- **Features**: Get real-time campsite availability data

## Notes

- The app works without an API key using pre-loaded campgrounds
- API key is only needed for search and browse-by-state features
- Availability checking works for any valid campground ID
- Data is fetched in real-time from Recreation.gov

## License

MIT
