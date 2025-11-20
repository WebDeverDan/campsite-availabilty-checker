import { useState, useEffect, useRef } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './CampsiteSearch.css'
import { searchFacilitiesAutocomplete, getCampgrounds, getPopularCampgrounds, US_STATES } from '../services/recreationApi'

function CampsiteSearch({ onSearch, loading }) {
  const [campsiteId, setCampsiteId] = useState('')
  const [campgroundName, setCampgroundName] = useState('')
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedState, setSelectedState] = useState('')
  const [loadingCampgrounds, setLoadingCampgrounds] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [popularCampgrounds, setPopularCampgrounds] = useState([])
  const searchTimeout = useRef(null)
  const justSelected = useRef(false)
  const startDateRef = useRef(null)
  const endDateRef = useRef(null)


  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    if (campgroundName.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    // Don't search if user just selected something
    if (justSelected.current) {
      return
    }

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true)
      setSearchError(null)
      try {
        const results = await searchFacilitiesAutocomplete(campgroundName)
        setSearchResults(results)
        // Only show results if user hasn't made a selection
        if (!campsiteId) {
          setShowResults(true)
        }
        if (results.length === 0) {
          setSearchError('No campgrounds found. Try a different search term.')
        }
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
        setSearchError(error.message || 'Failed to search campgrounds. Please check your API key.')
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }
    }
  }, [campgroundName, campsiteId])

  const handleStateChange = async (state) => {
    setSelectedState(state)
    if (!state) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    setLoadingCampgrounds(true)
    setSearchError(null)
    try {
      const campgrounds = await getCampgrounds({ state, limit: 50 })
      const formatted = campgrounds.map(cg => ({
        id: cg.FacilityID,
        name: cg.FacilityName,
        state: cg.AddressStateCode,
        city: cg.FacilityCity,
        type: cg.FacilityTypeDescription,
      }))
      setSearchResults(formatted)
      // Only show results if user hasn't made a selection yet
      if (!campsiteId) {
        setShowResults(true)
      }
      if (formatted.length === 0) {
        setSearchError('No campgrounds found in this state.')
      }
    } catch (error) {
      console.error('Error loading campgrounds:', error)
      setSearchError(error.message || 'Failed to load campgrounds. Please check your API key.')
    } finally {
      setLoadingCampgrounds(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    console.log('Form submitted with:', { campsiteId, startDate, endDate })

    if (!campsiteId || !startDate || !endDate) {
      alert('Please fill in all fields')
      return
    }

    if (endDate <= startDate) {
      alert('End date must be after start date')
      return
    }

    console.log('Calling onSearch with campsite:', campsiteId)
    onSearch(campsiteId, startDate, endDate)
  }

  const handleCampgroundSelect = (e) => {
    const selectedId = e.target.value
    setCampsiteId(selectedId)

    const selected = popularCampgrounds.find(cg => cg.id === selectedId)
    if (selected) {
      setCampgroundName(selected.name)
    }
  }

  const handleSearchResultSelect = (result) => {
    justSelected.current = true
    setCampsiteId(result.id.toString())
    setCampgroundName(result.name)
    setSearchResults([]) // Clear results first
    setShowResults(false)
    setSelectedState('')

    // Reset the flag after a short delay
    setTimeout(() => {
      justSelected.current = false
    }, 300)
  }

  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setCampgroundName(value)

   
    if (value !== campgroundName) {
      setCampsiteId('')
    }
  }

  const handleSearchBlur = () => {
    setTimeout(() => {
      setShowResults(false)
    }, 200)
  }

  return (
    <div className="search-container">
      <h3 class="search-header">Choose your state (optional), then campground, then desired dates to find available sites.</h3>

      <form onSubmit={handleSubmit} className="search-form">
       
        <div className="form-group">
          <label htmlFor="state-select">
            1. Browse by State (optional)
          </label>
          <select
            id="state-select"
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className="form-select"
            disabled={loading || loadingCampgrounds}
          >
            <option value="">-- Select a state --</option>
            {US_STATES.map(state => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </select>
        </div>   
        <div className="form-group search-wrapper">
          <label htmlFor="campground-search">
            2. Enter Campground Name
          </label>
          <input
            type="text"
            id="campground-search"
            value={campgroundName}
            onChange={handleSearchInputChange}
            onFocus={() => {
              if (!justSelected.current && searchResults.length > 0 && !campsiteId) {
                setShowResults(true)
              }
            }}
            onBlur={handleSearchBlur}
            placeholder="Type to search (e.g., Yosemite, Grand Canyon)..."
            className="form-input"
            disabled={loading}
          />
          {isSearching && <div className="search-spinner">Searching...</div>}
          {searchError && (
            <div className="search-error">{searchError}</div>
          )}

          {showResults && searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map(result => (
                <button
                  key={result.id}
                  type="button"
                  className="search-result-item"
                  onClick={() => handleSearchResultSelect(result)}
                >
                  <div className="result-name">{result.name}</div>
                  <div className="result-details">
                    {result.city && `${result.city}, `}
                    {result.state}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {campsiteId && (
          <div className="selected-campground">
            <strong>Selected:</strong> {campgroundName || `Campground ID: ${campsiteId}`}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="start-date">
              3. Start Date
            </label>
            <DatePicker
              ref={startDateRef}
              id="start-date"
              selected={startDate}
              onChange={(date) => {
                setStartDate(date)
                // Force close the calendar
                if (startDateRef.current) {
                  startDateRef.current.setOpen(false)
                }
              }}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              minDate={new Date()}
              placeholderText="Select start date"
              className="form-input date-picker-input"
              dateFormat="MMM d, yyyy"
              disabled={loading}
              showPopperArrow={false}
              shouldCloseOnSelect={true}
            />
          </div>

          <div className="form-group">
            <label htmlFor="end-date">
              4. End Date
            </label>
            <DatePicker
              ref={endDateRef}
              id="end-date"
              selected={endDate}
              onChange={(date) => {
                setEndDate(date)
                // Force close the calendar
                if (endDateRef.current) {
                  endDateRef.current.setOpen(false)
                }
              }}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate || new Date()}
              placeholderText="Select end date"
              className="form-input date-picker-input"
              dateFormat="MMM d, yyyy"
              disabled={loading || !startDate}
              showPopperArrow={false}
              shouldCloseOnSelect={true}
            />
          </div>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading || !campsiteId || !startDate || !endDate}
        >
          {loading ? 'Searching...' : 'Check Availability'}
        </button>

        <div className="info-note">
          <p>
            <strong>Note:</strong> Not all campgrounds have availability data. If you encounter an error,
            the campground may not be available for online reservations through Recreation.gov.
          </p>
        </div>
      </form>

    </div>
  )
}

export default CampsiteSearch
