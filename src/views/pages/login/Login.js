import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { getBaseUrl } from '../../../utils'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const navigate = useNavigate()
  const baseUrl = getBaseUrl()

  const handleLogin = async (e) => {
    e.preventDefault()
    console.log('Login button clicked') // Debug log

    setMessage('')
    setMessageType('')

    if (!username || !password) {
      setMessage('Please enter both username and password.')
      setMessageType('error')
      return
    }

    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)

    try {
      // Using a mock API for testing; replace with your actual backend URL
      const response = await fetch(`${baseUrl}/api/v1/akadone/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.access_token) // Store token in localStorage
        localStorage.setItem('role', data.role) // Store user role in localStorage
        setTimeout(() => {
          navigate('/dashboard')
        }, 1000)
        setMessageType('success')
        console.log('Login successful:', data)
      } else {
        const errorData = await response.json()
        setMessage(errorData.detail || 'Login failed. Please check your credentials.')
        setMessageType('error')
        console.error('Login failed:', errorData)
      }
    } catch (error) {
      setMessage('An error occurred. Please try again later.')
      setMessageType('error')
      console.error('Network or unexpected error during login:', error)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody className="text-center">
                  <CForm onSubmit={handleLogin}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>
                    {message && (
                      <CAlert color={messageType === 'success' ? 'success' : 'danger'}>
                        {message}
                      </CAlert>
                    )}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Username"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton type="submit" color="primary" className="px-4">
                          Login
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                        <CButton color="link" className="px-0">
                          Forgot password?
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login