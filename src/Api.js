import { useNavigate } from 'react-router-dom'

// Since useNavigate must be used within a component, we pass navigate as a parameter
export const fetchWithAuth = async (url, options = {}, navigate) => {
  const token = localStorage.getItem('token')
  const headers = {
    ...options.headers,
    'Authorization': token ? `Bearer ${token}` : '',
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login', { replace: true })
      throw new Error('Unauthorized: Redirecting to login')
    }

    return response
  } catch (error) {
    if (error.message !== 'Unauthorized: Redirecting to login') {
      throw error // Re-throw other errors
    }
    return null // Return null for 401 to prevent further processing
  }
}