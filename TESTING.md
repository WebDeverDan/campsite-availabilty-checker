# Testing the Campsite Availability Checker

## Setup Complete ✓

Your application is now fully configured with:
- ✓ API key added to `.env` file
- ✓ All 50 US states available in dropdown
- ✓ Interactive calendar date picker
- ✓ Debug logging enabled

## How to Test

### 1. Start the Development Server

```bash
npm run dev
```

Then open your browser to `http://localhost:5173`

### 2. Test the Quick Select Feature (No API Key Required)

1. **Select a campground** from the "Quick Select" dropdown
   - Choose "Upper Pines (Yosemite)" for example
   - You should see: "Selected: Upper Pines (Yosemite)"

2. **Pick dates** using the calendar
   - Click "Start Date" → calendar opens
   - Click a date (today or later)
   - Click "End Date" → calendar opens
   - Click a date after your start date

3. **Click "Check Availability"**
   - Button should now be enabled (not grayed out)
   - You'll see "Checking availability..." spinner
   - Results will appear below showing available campsites

### 3. Test the Search Feature (Requires API Key)

1. **Search by name**:
   - Type "Yosemite" in the search box
   - Wait for autocomplete results
   - Click on a campground from the list

2. **Browse by state**:
   - Select "California" from the state dropdown
   - Wait for campgrounds to load
   - Click on one to select it

### 4. Check the Console

Open your browser's Developer Tools (F12 or Cmd+Option+I) and look at the Console tab. You should see:

```
Form submitted with: { campsiteId: "232447", startDate: ..., endDate: ... }
Calling onSearch with campsite: 232447
handleSearch called with: { campsiteId: "232447", startDate: ..., endDate: ... }
Fetching from URL: https://www.recreation.gov/api/camps/availability/campground/232447?start_date=...
Response status: 200
Received data: { campsites: {...} }
```

## Troubleshooting

### Button is Grayed Out

The "Check Availability" button will be disabled until ALL of these are filled:
- ✓ Campground selected (you'll see "Selected: ..." box)
- ✓ Start date picked
- ✓ End date picked

### Search Not Working

If the name search or state browse doesn't work, check the browser console (F12) for these messages:

**Check if API key is loaded:**
Look for: `Recreation API initialized. API Key present: true`
- If it says `false`, your `.env` file isn't being read

**Common Issues:**

1. **API key not loaded:**
   - Make sure `.env` file exists in the project root
   - Check that it contains: `VITE_RECREATION_API_KEY=your_key_here`
   - Restart the dev server (Ctrl+C, then `npm run dev`)

2. **Invalid API key:**
   - Console will show: `API Error: 401` or `API Error: 403`
   - Get a new key from https://ridb.recreation.gov/
   - Update your `.env` file
   - Restart dev server

3. **No results found:**
   - You'll see a red error box saying "No campgrounds found"
   - Try a different search term (e.g., "Yosemite", "Grand Canyon")
   - Try selecting a different state

4. **Network/CORS errors:**
   - Some browsers may block the API
   - Try using the Quick Select dropdown instead (doesn't need API)

### CORS Errors

If you see CORS errors in the console:
- This is normal for the Recreation.gov API in development
- The API calls should still work
- In production, CORS is typically not an issue

### No Results Showing

If the button works but no results appear:
1. Check the console for error messages
2. Try a different campground
3. Try different dates (some campgrounds are seasonal)

## Example Test Case

**Test Upper Pines (Yosemite):**
1. Select "Upper Pines (Yosemite)" from dropdown
2. Pick start date: Tomorrow
3. Pick end date: 3 days from tomorrow
4. Click "Check Availability"
5. You should see a list of campsites with availability

## Need Help?

If the button still doesn't work:
1. Check the browser console for errors
2. Make sure you completed all 3 steps (campground, start date, end date)
3. Try refreshing the page and starting over
