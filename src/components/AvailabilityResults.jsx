import './AvailabilityResults.css'

function AvailabilityResults({ results }) {
  const { data, startDate, endDate, campsiteId } = results

  if (!data || !data.campsites) {
    return (
      <div className="results-container">
        <div className="no-data">
          <p>No availability info found. If you think this is an error, check Recreation.gov to be sure!</p>
        </div>
      </div>
    )
  }

  const campsites = Object.entries(data.campsites)

  const availableSites = campsites.filter(([_, site]) => {
    const availabilities = site.availabilities || {}
    return Object.values(availabilities).some(status => status === 'Available')
  })

  const formatDateForUrl = (dateString) => {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  const reservationUrl = `https://www.recreation.gov/camping/campgrounds/${campsiteId}?date=${formatDateForUrl(startDate)}`

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>Campsite Availability Results</h2>
        <p className="date-range">
          {new Date(startDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
          {' → '}
          {new Date(endDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
      </div>

      <div className="summary-stats">
        <div className="stat-card stat-available">
          <div className="stat-number">{availableSites.length}</div>
          <div className="stat-label">Available Sites</div>
        </div>
        <div className="stat-card stat-total">
          <div className="stat-number">{campsites.length}</div>
          <div className="stat-label">Total Sites</div>
        </div>
      </div>

      {availableSites.length > 0 ? (
        <div className="booking-section">
          <div className="availability-message success">
            <h3>Great news! Sites are available!</h3>
            <p>
              We found {availableSites.length} available {availableSites.length === 1 ? 'site' : 'sites'} for your dates.
            </p>
            <br/>
            <a
            href={reservationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="booking-button"
          >
            Book Now on Recreation.gov Before Someone Else Does!
          </a>
          </div>
          
        </div>
      ) : (
        <div className="booking-section">
          <div className="availability-message unavailable">
            <h3>No sites currently available</h3>
            <p>
              All {campsites.length} sites are reserved for your selected dates. Try different dates or check back later for cancellations.
            </p>
          </div>
          <a
            href={reservationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="booking-button secondary"
          >
            View on Recreation.gov
          </a>
        </div>
      )}

      {campsites.length === 0 && (
        <div className="no-data">
          <p>No campsites found for this date range.</p>
        </div>
      )}
    </div>
  )
}

export default AvailabilityResults
