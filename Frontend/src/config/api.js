const explicitApiUrl = (import.meta.env.VITE_API_URL || '').trim()

const getDefaultApiUrl = () => {
  // By default, keep API calls in same-origin (/api) so mobile devices only
  // need to reach the frontend port; Vite proxy forwards to backend:5000.
  return ''
}

const isLocalhostHost = (host = '') => {
  const value = String(host || '').toLowerCase()
  return value === 'localhost' || value === '127.0.0.1' || value === '::1'
}

const shouldUseExplicitApiUrl = () => {
  if (!explicitApiUrl) return false
  if (typeof window === 'undefined') return true

  try {
    const explicitUrl = new URL(explicitApiUrl, window.location.origin)
    const explicitHost = explicitUrl.hostname
    const currentHost = window.location.hostname

    // If the configured API uses localhost but the app is opened from another
    // device/host, prefer same-origin proxy to avoid unreachable API calls.
    if (isLocalhostHost(explicitHost) && !isLocalhostHost(currentHost)) {
      return false
    }

    return true
  } catch (_error) {
    return false
  }
}

export const API_BASE_URL = shouldUseExplicitApiUrl() ? explicitApiUrl : getDefaultApiUrl()
