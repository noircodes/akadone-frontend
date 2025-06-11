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
} from '@coreui/react'
import FormSelect from '../../../components/FormSelect'

const Admin = () => {
  const [users, setUsers] = useState([])
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [sortBy, setSortBy] = useState('username')
  const [sortOrder, setSortOrder] = useState('asc')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/akadone/admin/admin/all?page=${page}&size=${size}&sortby=${sortBy}&order=${sortOrder}&name=${encodeURIComponent(search)}`,
        {
          headers: {
            // Add Authorization header if needed (e.g., from localStorage)
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setUsers(data.items || [])
        console.log(data.items)
        setTotalPages(data.totalPages || 0)
        setTotalElements(data.totalElements || 0)
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

  useEffect(() => {
    fetchUsers()
  }, [page, size, sortBy, sortOrder, search])

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value)
    setPage(1) // Reset to first page on sort change
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPage(1) // Reset to first page on filter change
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
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
        <CCol md={3}>
          <FormSelect
            options={[
              { label: 'Sort Ascending', value: 'asc' },
              { label: 'Sort Descending', value: 'desc' },
            ]}
            ariaLabel="Sort order select"
            defaultValue="asc"
            onChange={handleSortOrderChange}
            className="mb-3"
          />
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
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Username</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {users.length > 0 ? (
                users.map((user) => 
                  <CTableRow key={user._id}>
                    <CTableDataCell>{user._id}</CTableDataCell>
                    <CTableDataCell>{user.username}</CTableDataCell>
                    <CTableDataCell>{user.email}</CTableDataCell>
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
          <CPagination align="center" className="mt-3">
            <CPaginationItem
              disabled={page === 1}
              onClick={() => handlePageChange(0)}
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
          <p className="text-center mt-2">
            Showing {users.length} of {totalElements} users
          </p>
        </>
      )}
    </CContainer>
  )
}

export default Admin