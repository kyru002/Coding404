export const assetUrl = (path) => {
  const normalizedPath = String(path || '').replace(/^\/+/, '')
  return encodeURI(`${import.meta.env.BASE_URL}${normalizedPath}`)
}