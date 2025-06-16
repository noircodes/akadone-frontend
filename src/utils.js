export const getBaseUrl = () => {
  const baseUrl =
    import.meta.env?.VITE_BASE_URL || 'http://localhost:8000'
  return baseUrl
}
