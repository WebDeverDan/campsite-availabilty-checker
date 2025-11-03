# Campsite Availability Checker

After trying to find campsites for the summertime rush on Recreation.gov, I was sick and tired of using their mobile interface. This will allow you to search by state, name, or popular site to see if there is anything available during desired dates. **Note** Not all campgrounds will be available or up-to-date. When in doubt, check Recreation.gov.

## Technical Details

- **Framework**: React 18
- **Build Tool**: Vite
- **APIs**:
  - RIDB (Recreation Information Database) API for campground search
  - Recreation.gov API for availability data

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
