import { useState } from 'react'
import CampsiteSearch from './components/CampsiteSearch'
import AvailabilityResults from './components/AvailabilityResults'
import './App.css'

function App() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (campsiteId, startDate, endDate) => {
    console.log('handleSearch called with:', { campsiteId, startDate, endDate })

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const start = startDate.toISOString().split('T')[0]
      const end = endDate.toISOString().split('T')[0]

      const monthsToFetch = new Set()
      const currentDate = new Date(startDate)
      const finalDate = new Date(endDate)

      while (currentDate <= finalDate) {
        const monthStart = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01T00:00:00.000Z`
        monthsToFetch.add(monthStart)
        currentDate.setMonth(currentDate.getMonth() + 1)
      }

      console.log('Fetching months:', Array.from(monthsToFetch))

      const allData = { campsites: {} }

      for (const monthStart of monthsToFetch) {
        const url = `https://www.recreation.gov/api/camps/availability/campground/${campsiteId}/month?start_date=${encodeURIComponent(monthStart)}`

        console.log('Fetching from URL:', url)

        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
          }
        })

        console.log('Response status:', response.status)

        if (!response.ok) {
          let errorMessage = `Failed to fetch availability (HTTP ${response.status})`

          if (response.status === 404) {
            errorMessage = `Campground not found (ID: ${campsiteId}). This campground may not exist or may not be available for online reservations.`
          } else if (response.status === 500) {
            errorMessage = 'Recreation.gov server error. Please try again later.'
          } else if (response.status === 429) {
            errorMessage = 'Too many requests. Please wait a moment and try again.'
          }

          throw new Error(errorMessage)
        }

        const monthData = await response.json()

        Object.keys(monthData.campsites || {}).forEach(campsiteId => {
          if (!allData.campsites[campsiteId]) {
            allData.campsites[campsiteId] = monthData.campsites[campsiteId]
          } else {
            allData.campsites[campsiteId].availabilities = {
              ...allData.campsites[campsiteId].availabilities,
              ...monthData.campsites[campsiteId].availabilities
            }
          }
        })
      }

      console.log('Received data:', allData)

      setResults({
        campsiteId,
        startDate: start,
        endDate: end,
        data: allData
      })
    } catch (err) {
      console.error('Error in handleSearch:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Campsite Availability Checker</h1>
          <p>Sick of trying to navigate the Recreation.gov website to find an available campsite?</p>
          <p>Try here first, for a better experience!</p>
        </div>
      </header>

      <main className="app-main">
        <CampsiteSearch onSearch={handleSearch} loading={loading} />

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && (
          <div className="loading-message">
            <div className="spinner"></div>
            <p>Checking availability...</p>
          </div>
        )}

        {results && !loading && (
          <AvailabilityResults results={results} />
        )}
      </main>

      <footer className="app-footer">
        <p>Data from Recreation.gov API</p>
      </footer>
    </div>
  )
}

export default App
