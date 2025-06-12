import React, { useState, useEffect } from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormInput,
  CContainer,
  CRow,
  CCol,
  CPagination,
  CPaginationItem,
  CAlert,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CForm,
  CFormLabel,
  CFormSelect,
  CModalFooter,
} from '@coreui/react'
import FormSelect from '../../../components/FormSelect'
import moment from 'moment'
import { useDebounce } from 'use-debounce'
import { fetchWithAuth } from '../../../Api'
import { useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilArrowBottom, cilArrowTop } from '@coreui/icons'
import Select from 'react-select'

const Admin = () => {
  const [users, setUsers] = useState([])
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [sortBy, setSortBy] = useState('username')
  const [sortOrder, setSortOrder] = useState('asc')
  const [search, setSearch] = useState('')
  const [departments, setDepartments] = useState([])
  const [searchDepartment, setSearchDepartment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullname: '',
    photoUrl: '',
    email: '',
    phone: '',
    noId: '',
    gender: '',
    permissions: [],
    role: '',
    managedDepartments: [],
  })
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const navigate = useNavigate()

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetchWithAuth(
        `http://localhost:8000/api/v1/akadone/admin/admin/all?page=${page}&size=${size}&sortby=${sortBy}&order=${sortOrder}&name=${encodeURIComponent(search)}`,
        {
          headers: {
            // Add Authorization header if needed (e.g., from localStorage)
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        },
        navigate
      )
      if (response.ok) {
        const data = await response.json()
        setUsers(data.items || [])
        console.log(data.items)
        let totalPages = Math.ceil(data.total / size)
        setTotalPages(totalPages || 0)
        setTotalElements(data.total || 0)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to fetch users')
      }
    } catch (err) {
      setError('Network error. Please try again later.')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:8000/api/v1/akadone/combo/department?name=${encodeURIComponent(searchDepartment)}`,
        {},
        navigate
      )
      if (response.ok) {
        const data = await response.json()
        setDepartments(data || [])
        console.log(data)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to fetch departments')
      }
    } catch (err) {
      setError('Network error. Please try again later.')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const [debouncedSearch] = useDebounce(search, 500)

  useEffect(() => {
    fetchUsers()
  }, [page, size, sortBy, sortOrder, debouncedSearch])

  useEffect(() => {
    fetchDepartments()
  }, [searchDepartment])

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
    setPage(1)
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPage(1) // Reset to first page on filter change
  }

  const handleAddUser = () => {
    setModalVisible(true)
    setFormError('')
    setFormSuccess('')
    setFormData({
      username: '',
      password: '',
      fullname: '',
      photoUrl: '',
      email: '',
      phone: '',
      noId: '',
      gender: '',
      permissions: [],
      role: '',
      managedDepartments: [],
    })
  }

  const handleFormChange = (e) => {
    const { name, value, options } = e.target
    if (name === 'permissions' || name === 'managedDepartments') {
      const selected = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value)
      setFormData({ ...formData, [name]: selected })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const validateForm = () => {
    if (!formData.username) return 'Username is required'
    if (!formData.password) return 'Password is required'
    if (!formData.email) return 'Email is required'
    if (!formData.role) return 'Role is required'
    return ''
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    const validationError = validateForm()
    if (validationError) {
      setFormError(validationError)
      return
    }

    try {
      const response = await fetchWithAuth(
        'http://localhost:8000/api/v1/akadone/admin/admin/create',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        },
        navigate
      )
      if (response) {
        if (response.ok) {
          const data = await response.json()
          setFormSuccess(data.message || 'User created successfully!')
          setModalVisible(false)
          fetchUsers() // Refresh table
        } else {
          const errorData = await response.json()
          setFormError(errorData.message || 'Failed to create user')
        }
      }
    } catch (err) {
      if (err.message !== 'Unauthorized: Redirecting to login') {
        setFormError('Network error. Please try again later.')
        console.error('Submit error:', err)
      }
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage < totalPages) {
      setPage(newPage)
    }
  }

  return (
    <CContainer className="my-4">
      <CRow>
        <CCol md={6}>
          <CFormInput
            placeholder="Search by username"
            value={search}
            onChange={handleSearchChange}
            className="mb-3"
          />
        </CCol>
        <CCol md={6} className="d-flex justify-content-end">
          <CButton color="primary" onClick={handleAddUser} className="mb-3">
            Add User
          </CButton>
        </CCol>
      </CRow>
      {error && <CAlert color="danger">{error}</CAlert>}
      {loading ? (
        <CAlert color="info">Loading...</CAlert>
      ) : (
        <>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>
                  ID
                </CTableHeaderCell>
                <CTableHeaderCell
                  onClick={() => handleSort('username')}
                  style={{ cursor: 'pointer' }}
                >
                  Username {sortBy === 'username' && (
                    <CIcon icon={sortOrder === 'asc' ? cilArrowTop : cilArrowBottom} />
                  )}
                </CTableHeaderCell>
                <CTableHeaderCell
                  onClick={() => handleSort('email')}
                  style={{ cursor: 'pointer' }}
                >
                  Email {sortBy === 'email' && (
                    <CIcon icon={sortOrder === 'asc' ? cilArrowTop : cilArrowBottom} />
                  )}
                </CTableHeaderCell>
                <CTableHeaderCell
                  onClick={() => handleSort('lastLogin')}
                  style={{ cursor: 'pointer' }}
                >
                  Last Login {sortBy === 'lastLogin' && (
                    <CIcon icon={sortOrder === 'asc' ? cilArrowTop : cilArrowBottom} />
                  )}
                </CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {users.length > 0 ? (
                users.map((user, index) => 
                  <CTableRow key={user._id}>
                    <CTableDataCell>{index + 1 + (page - 1) * size}</CTableDataCell>
                    <CTableDataCell>{user.username}</CTableDataCell>
                    <CTableDataCell>{user.email}</CTableDataCell>
                    <CTableDataCell>{moment(user.lastLogin).utcOffset(14).format("dddd, MMMM Do YYYY, h:mm:ss a")}</CTableDataCell>
                  </CTableRow>
                )
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan="3" className="text-center">
                    No users found
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
          {totalPages > 1 ? (
            <CPagination align="center" className="mt-3">
                <CPaginationItem
                disabled={page === 1}
                onClick={() => handlePageChange(1)}
                >
                First
                </CPaginationItem>
                <CPaginationItem
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                >
                Previous
                </CPaginationItem>
                {[...Array(totalPages).keys()].map((p) => (
                <CPaginationItem
                    key={p}
                    active={p === page}
                    onClick={() => handlePageChange(p)}
                >
                    {p + 1}
                </CPaginationItem>
                ))}
                <CPaginationItem
                disabled={page === totalPages - 1 || totalPages === 0}
                onClick={() => handlePageChange(page + 1)}
                >
                Next
                </CPaginationItem>
                <CPaginationItem
                disabled={page === totalPages - 1 || totalPages === 0}
                onClick={() => handlePageChange(totalPages - 1)}
                >
                Last
                </CPaginationItem>
            </CPagination>
            ) : null
          }
          <p className="text-center mt-2">
            Showing {users.length} of {totalElements} users
          </p>
        </>
      )}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Add New User</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleFormSubmit}>
            {formError && <CAlert color="danger">{formError}</CAlert>}
            {formSuccess && <CAlert color="success">{formSuccess}</CAlert>}
            <CRow>
              <CCol md={12}>
                <CFormLabel>Username</CFormLabel>
                <CFormInput
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  required
                  className="mb-3"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={12}>
                <CFormLabel>Password</CFormLabel>
                <CFormInput
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  required
                  className="mb-3"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={12}>
                <CFormLabel>Full Name</CFormLabel>
                <CFormInput
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleFormChange}
                  className="mb-3"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={12}>
                <CFormLabel>Photo URL</CFormLabel>
                <CFormInput
                  name="photoUrl"
                  value={formData.photoUrl}
                  onChange={handleFormChange}
                  className="mb-3"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={6}>
                <CFormLabel>Email</CFormLabel>
                <CFormInput
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                  className="mb-3"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Phone</CFormLabel>
                <CFormInput
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="mb-3"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={6}>
                <CFormLabel>ID Number</CFormLabel>
                <CFormInput
                  name="noId"
                  value={formData.noId}
                  onChange={handleFormChange}
                  className="mb-3"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Gender</CFormLabel>
                <CFormSelect
                  name="gender"
                  value={formData.gender}
                  onChange={handleFormChange}
                  className="mb-3"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </CFormSelect>
              </CCol>
            </CRow>
            <CRow>
              <CCol md={6}>
                <CFormLabel>Permissions</CFormLabel>
                <CFormSelect
                  name="permissions"
                  multiple
                  value={formData.permissions}
                  onChange={handleFormChange}
                  className="mb-3"
                >
                  <option value="read">Read</option>
                  <option value="write">Write</option>
                  <option value="admin">Admin</option>
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>Role</CFormLabel>
                <CFormSelect
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  required
                  className="mb-3"
                >
                  <option value="">Select Role</option>
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                </CFormSelect>
              </CCol>
            </CRow>
            <CRow>
              <CCol md={12}>
                <CFormLabel>Managed Departments</CFormLabel>
                <Select
                  name="managedDepartments"
                  multiple
                  value={formData.managedDepartments}
                  onChange={handleFormChange}
                  className="mb-3 bg-transparent"
                  defaultMenuIsOpen
                  options={departments.map(department => ({
                    value: department._id,
                    label: department.name,
                  }))}
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      backgroundColor: 'transparent',
                    }),
                    menu: (baseStyles, state) => ({
                      ...baseStyles,
                      backgroundColor: 'transparent'
                    }),
                    menuOpen: (baseStyles, state) => ({
                      ...baseStyles,
                      backgroundColor: 'transparent'
                    })
                  }}
                />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleFormSubmit}>
            Save
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default Admin