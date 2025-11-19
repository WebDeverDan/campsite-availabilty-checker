

const USE_CORS_PROXY = true
const CORS_PROXY = 'https://corsproxy.io/?'
const RIDB_BASE_URL = USE_CORS_PROXY
  ? `${CORS_PROXY}https://ridb.recreation.gov/api/v1`
  : 'https://ridb.recreation.gov/api/v1'
const RECREATION_BASE_URL = 'https://www.recreation.gov/api'

const API_KEY = import.meta.env.VITE_RECREATION_API_KEY || ''

console.log('Recreation API initialized. API Key present:', !!API_KEY)

/**
 * Search for facilities (campgrounds) by name or location
 * @param {string} query - Search query (facility name)
 * @param {Object} options - Additional search parameters
 * @returns {Promise<Array>} Array of facilities
 */
export async function searchFacilities(query = '', options = {}) {
  if (!API_KEY) {
    console.warn('No API key found. Search will fail. Please add VITE_RECREATION_API_KEY to your .env file.')
    throw new Error('API key required for search. Please add VITE_RECREATION_API_KEY to .env file.')
  }

  const params = new URLSearchParams({
    query: query,
    limit: options.limit || 50,
    offset: options.offset || 0,
    ...(options.state && { state: options.state }),
    ...(options.activity && { activity: options.activity }),
  })

  const url = `${RIDB_BASE_URL}/facilities?${params}`
  console.log('Searching facilities:', url)

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'apikey': API_KEY,
      }
    })

    console.log('Search response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      throw new Error(`API Error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Search results:', data)
    return data.RECDATA || []
  } catch (error) {
    console.error('Error fetching facilities:', error)
    throw error
  }
}

/**
 * Get facilities by activity type (e.g., camping)
 * @param {Object} options - Search parameters
 * @returns {Promise<Array>} Array of facilities
 */
export async function getCampgrounds(options = {}) {
  const params = new URLSearchParams({
    activity: 'CAMPING',
    limit: options.limit || 100,
    offset: options.offset || 0,
    ...(options.state && { state: options.state }),
    ...(options.latitude && options.longitude && {
      latitude: options.latitude,
      longitude: options.longitude,
      radius: options.radius || 25,
    }),
  })

  try {
    const response = await fetch(`${RIDB_BASE_URL}/facilities?${params}`, {
      headers: {
        'Accept': 'application/json',
        ...(API_KEY && { 'apikey': API_KEY }),
      }
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const data = await response.json()
    return data.RECDATA || []
  } catch (error) {
    console.error('Error fetching campgrounds:', error)
    throw error
  }
}

/**
 * Get detailed information about a specific facility
 * @param {string} facilityId - The facility ID
 * @returns {Promise<Object>} Facility details
 */
export async function getFacilityDetails(facilityId) {
  try {
    const response = await fetch(`${RIDB_BASE_URL}/facilities/${facilityId}`, {
      headers: {
        'Accept': 'application/json',
        ...(API_KEY && { 'apikey': API_KEY }),
      }
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching facility details:', error)
    throw error
  }
}

/**
 * Get campsite availability for a specific campground
 * (This uses the undocumented Recreation.gov API)
 * @param {string} campgroundId - The campground ID
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Availability data
 */
export async function getCampsiteAvailability(campgroundId, startDate, endDate) {
  try {
    const url = `${RECREATION_BASE_URL}/camps/availability/campground/${campgroundId}?start_date=${startDate}&end_date=${endDate}`

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching availability:', error)
    throw error
  }
}

/**
 * Search for facilities with autocomplete-style suggestions
 * @param {string} searchTerm - The search term
 * @returns {Promise<Array>} Array of matching facilities
 */
export async function searchFacilitiesAutocomplete(searchTerm) {
  if (!searchTerm || searchTerm.length < 2) {
    return []
  }

  try {
    const facilities = await searchFacilities(searchTerm, { limit: 20 })
    console.log(`Found ${facilities.length} facilities for "${searchTerm}"`)

    // Filter to only camping facilities and format for display
    const filtered = facilities.filter(facility =>
      facility.FacilityTypeDescription === 'Campground' ||
      facility.FacilityTypeDescription === 'Camping'
    )
    console.log(`After filtering: ${filtered.length} campgrounds`)

    const formatted = filtered.map(facility => ({
      id: facility.FacilityID,
      name: facility.FacilityName,
      state: facility.AddressStateCode,
      description: facility.FacilityDescription,
      city: facility.FacilityCity,
      type: facility.FacilityTypeDescription,
    }))

    console.log('Formatted campgrounds:', formatted)
    return formatted
  } catch (error) {
    console.error('Error in autocomplete search:', error)
    throw error // Re-throw so the UI can show the error
  }
}

/**
 * @param {number} limit - Number of campgrounds to fetch
 * @returns {Promise<Array>} Array of popular campgrounds
 */
export async function getPopularCampgrounds(limit = 20) {
  if (!API_KEY) {
    console.warn('No API key found. Cannot fetch popular campgrounds.')
    throw new Error('API key required. Please add VITE_RECREATION_API_KEY to .env file.')
  }

  try {
    // want to rework this later
    const popularStates = ['CA', 'AZ', 'UT', 'WY', 'TX', 'NC', 'TN']
    const allCampgrounds = []

    for (const state of popularStates) {
      try {
        const campgrounds = await getCampgrounds({ state, limit: 10 })
        allCampgrounds.push(...campgrounds)
      } catch (error) {
        console.error(`Error fetching campgrounds for ${state}:`, error)
      }
    }

    return allCampgrounds
      .slice(0, limit)
      .map(cg => ({
        id: cg.FacilityID,
        name: cg.FacilityName,
        state: cg.AddressStateCode,
        city: cg.FacilityCity,
        type: cg.FacilityTypeDescription,
      }))
  } catch (error) {
    console.error('Error fetching popular campgrounds:', error)
    throw error
  }
}


export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
]
