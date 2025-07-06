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
  CFormTextarea,
} from '@coreui/react'
import moment from 'moment'
import { useDebounce } from 'use-debounce'
import { fetchWithAuth } from '../../Api'
import { useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilArrowBottom, cilArrowTop, cilPencil, cilTrash } from '@coreui/icons'
import Select from 'react-select'
import { getBaseUrl } from '../../utils'

const Department = () => {
  const [departments, setDepartments] = useState([])
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [search, setSearch] = useState('')
  const [lecturers, setLecturers] = useState([])
  const [searchCourses, setSearchCourses] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentDepartmentId, setCurrentDepartmentId] = useState(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [departmentToDelete, setDepartmentToDelete] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    headId: '',
  })
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const baseUrl = getBaseUrl()

  const navigate = useNavigate()
  const [debouncedSearch] = useDebounce(search, 500)

  const fetchDepartments = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetchWithAuth(
        `${baseUrl}/api/v1/akadone/admin/department/all?page=${page}&size=${size}&sortby=${sortBy}&order=${sortOrder}&name=${encodeURIComponent(search)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
        navigate,
      )
      if (response.ok) {
        const data = await response.json()
        setDepartments(data.items || [])
        let totalPages = Math.ceil(data.total / size)
        setTotalPages(totalPages || 0)
        setTotalElements(data.total || 0)
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

  const fetchLecturers = async () => {
    try {
      const response = await fetchWithAuth(
        `${baseUrl}/api/v1/akadone/combo/user?userType=ROLE_LECTURER&name=${encodeURIComponent(searchCourses)}`,
        {},
        navigate,
      )
      if (response.ok) {
        const data = await response.json()
        setLecturers(data || [])
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to fetch user')
      }
    } catch (err) {
      setError('Network error. Please try again later.')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [page, size, sortBy, sortOrder, debouncedSearch])

  useEffect(() => {
    fetchLecturers()
  }, [searchCourses])

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
    setPage(1)
  }

  const handleAddDepartment = () => {
    setModalVisible(true)
    setIsEditMode(false)
    setFormError('')
    setFormSuccess('')
    setFormData({
      name: '',
      code: '',
      description: '',
      headId: '',
    })
  }

  const handleEditDepartment = (department) => {
    setModalVisible(true)
    setIsEditMode(true)
    setCurrentDepartmentId(department._id)
    setFormError('')
    setFormSuccess('')
    setFormData({
      name: department.name || '',
      code: department.code || '',
      description: department.description || '',
      headId: department.headId || '',
    })
  }

  const handleDeleteDepartment = async () => {
    try {
      const response = await fetchWithAuth(
        `${baseUrl}/api/v1/akadone/admin/department/delete/${departmentToDelete}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
        navigate,
      )
      if (response.ok) {
        setFormSuccess('Department deleted successfully!')
        setDeleteModalVisible(false)
        setDepartmentToDelete(null)
        fetchDepartments()
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to delete department')
      }
    } catch (err) {
      setError('Network error. Please try again later.')
      console.error('Delete error:', err)
    }
  }

  const handleOpenDeleteModal = (userId) => {
    setDepartmentToDelete(userId)
    setDeleteModalVisible(true)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const headOptions = lecturers.map((head) => ({
    value: head._id,
    label: head.fullname,
  }));

  const selectedOption = headOptions.find(
    (option) => option.value === formData.headId
  ) || null;

  const handleHeadOptions = (selectedOption) => {
    setFormData((prevData) => ({
      ...prevData,
      headId: selectedOption.value, // Store the entire option object
    }));
  };

  const validateForm = () => {
    if (!formData.name) return 'Name is required'
    if (!formData.code) return 'Code is required'
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
      const url = isEditMode
        ? `${baseUrl}/api/v1/akadone/admin/department/update/${currentDepartmentId}`
        : `${baseUrl}/api/v1/akadone/admin/department/create`
      const method = isEditMode ? 'PUT' : 'POST'

      // Remove code from formData if empty in edit mode
      const submitData = isEditMode && !formData.code ? { ...formData, code: undefined } : formData

      const response = await fetchWithAuth(
        url,
        {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        },
        navigate,
      )
      if (response.ok) {
        const data = await response.json()
        setFormSuccess(
          data.message || isEditMode ? 'Department updated successfully!' : 'Department created successfully!',
        )
        setModalVisible(false)
        fetchDepartments()
      } else {
        const errorData = await response.json()
        setFormError(
          errorData.message || isEditMode
            ? 'Failed to update department'
            : 'Failed to create department',
        )
      }
    } catch (err) {
      if (err.message !== 'Unauthorized: Redirecting to login') {
        setFormError('Network error. Please try again later.')
        console.error('Submit error:', err)
      }
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  return (
    <CContainer className="my-4">
      <CRow>
        <CCol md={6}>
          <CFormInput
            placeholder="Search by name"
            value={search}
            onChange={handleSearchChange}
            className="mb-3"
          />
        </CCol>
        <CCol md={6} className="d-flex justify-content-end">
          <CButton color="primary" onClick={handleAddDepartment} className="mb-3">
            Add Department
          </CButton>
        </CCol>
      </CRow>
      {error && <CAlert color="danger">{error}</CAlert>}
      {formSuccess && <CAlert color="success">{formSuccess}</CAlert>}
      {loading ? (
        <CAlert color="info">Loading...</CAlert>
      ) : (
        <>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                  Name{' '}
                  {sortBy === 'name' && (
                    <CIcon icon={sortOrder === 'asc' ? cilArrowTop : cilArrowBottom} />
                  )}
                </CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSort('code')} style={{ cursor: 'pointer' }}>
                  Code{' '}
                  {sortBy === 'code' && (
                    <CIcon icon={sortOrder === 'asc' ? cilArrowTop : cilArrowBottom} />
                  )}
                </CTableHeaderCell>
                <CTableHeaderCell
                  onClick={() => handleSort('description')}
                  style={{ cursor: 'pointer' }}
                >
                  Description{' '}
                  {sortBy === 'description' && (
                    <CIcon icon={sortOrder === 'asc' ? cilArrowTop : cilArrowBottom} />
                  )}
                </CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {departments.length > 0 ? (
                departments.map((department, index) => (
                  <CTableRow key={department._id}>
                    <CTableDataCell>{index + 1 + (page - 1) * size}</CTableDataCell>
                    <CTableDataCell>{department.name}</CTableDataCell>
                    <CTableDataCell>{department.code}</CTableDataCell>
                    <CTableDataCell>{department.description}</CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditDepartment(department)}
                      >
                        <CIcon icon={cilPencil} /> Edit
                      </CButton>
                      <CButton
                        color="danger"
                        size="sm"
                        onClick={() => handleOpenDeleteModal(department._id)}
                      >
                        <CIcon icon={cilTrash} /> Delete
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan="6" className="text-center">
                    No departments found
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
          {totalPages > 1 && (
            <CPagination align="center" className="mt-3">
              <CPaginationItem disabled={page === 1} onClick={() => handlePageChange(1)}>
                First
              </CPaginationItem>
              <CPaginationItem disabled={page === 1} onClick={() => handlePageChange(page - 1)}>
                Previous
              </CPaginationItem>
              {[...Array(totalPages).keys()].map((p) => (
                <CPaginationItem
                  key={p}
                  active={p + 1 === page}
                  onClick={() => handlePageChange(p + 1)}
                >
                  {p + 1}
                </CPaginationItem>
              ))}
              <CPaginationItem
                disabled={page === totalPages || totalPages === 0}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </CPaginationItem>
              <CPaginationItem
                disabled={page === totalPages || totalPages === 0}
                onClick={() => handlePageChange(totalPages)}
              >
                Last
              </CPaginationItem>
            </CPagination>
          )}
          <p className="text-center mt-2">
            Showing {departments.length} of {totalElements} departments
          </p>
        </>
      )}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>{isEditMode ? 'Edit Department' : 'Add New Department'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleFormSubmit}>
            {formError && <CAlert color="danger">{formError}</CAlert>}
            {formSuccess && <CAlert color="success">{formSuccess}</CAlert>}
            <CRow>
              <CCol md={12}>
                <CFormLabel>Name</CFormLabel>
                <CFormInput
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleFormChange(e)}
                  required
                  className="mb-3"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={12}>
                <CFormLabel>Code</CFormLabel>
                <CFormInput
                  type="code"
                  name="code"
                  value={formData.code}
                  onChange={(e) => handleFormChange(e)}
                  required
                  className="mb-3"
                  placeholder={isEditMode ? 'Leave blank to keep unchanged' : ''}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={12}>
                <CFormLabel>Description</CFormLabel>
                <CFormTextarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => handleFormChange(e)}
                  rows={3}
                  className="mb-3"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={12}>
                <CFormLabel>Head</CFormLabel>
                <Select
                  name="headId"
                  options={headOptions}
                  value={selectedOption}
                  onChange={(e) => handleHeadOptions(e)}
                  className="mb-3"
                  placeholder="Select head..."
                >
                </Select>
              </CCol>
            </CRow>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setModalVisible(false)}>
                Cancel
              </CButton>
              <CButton color="primary" type="submit">
                {isEditMode ? 'Update' : 'Save'}
              </CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>
      <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>Are you sure you want to delete this department?</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDeleteDepartment}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default Department
