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

const Course = () => {
  const [courses, setCourses] = useState([])
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [search, setSearch] = useState('')
  const [lecturers, setLecturers] = useState([])
  const [departments, setDepartments] = useState([])
  const [searchComboCourses, setSearchComboCourses] = useState('')
  const [searchLecturers, setSearchLecturers] = useState('')
  const [searchDepartments, setSearchDepartment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentDepartmentId, setCurrentDepartmentId] = useState(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    departmentId: '',
    prequisitesId: [],
    lecturerId: '',
    semester: '',
    academicYear: 0,
    schedule: '',
    roomLocation: '',
  })
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const baseUrl = getBaseUrl()

  const navigate = useNavigate()
  const [debouncedSearch] = useDebounce(search, 500)

  const fetchCourses = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetchWithAuth(
        `${baseUrl}/api/v1/akadone/admin/course/all?page=${page}&size=${size}&sortby=${sortBy}&order=${sortOrder}&title=${encodeURIComponent(search)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
        navigate,
      )
      if (response.ok) {
        const data = await response.json()
        setCourses(data.items || [])
        let totalPages = Math.ceil(data.total / size)
        setTotalPages(totalPages || 0)
        setTotalElements(data.total || 0)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to fetch courses')
      }
    } catch (err) {
      setError('Network error. Please try again later.')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchComboCourses = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetchWithAuth(
        `${baseUrl}/api/v1/akadone/combo/course?name=${encodeURIComponent(searchComboCourses)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
        navigate,
      )
      if (response.ok) {
        const data = await response.json()
        setCourses(data.items || [])
        let totalPages = Math.ceil(data.total / size)
        setTotalPages(totalPages || 0)
        setTotalElements(data.total || 0)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to fetch courses')
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
        `${baseUrl}/api/v1/akadone/combo/user?userType=ROLE_LECTURER&name=${encodeURIComponent(searchLecturers)}`,
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

  const fetchDepartments = async () => {
    try {
      const response = await fetchWithAuth(
        `${baseUrl}/api/v1/akadone/combo/department?name=${encodeURIComponent(searchDepartments)}`,
        {},
        navigate,
      )
      if (response.ok) {
        const data = await response.json()
        setDepartments(data || [])
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to fetch department')
      }
    } catch (err) {
      setError('Network error. Please try again later.')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [page, size, sortBy, sortOrder, debouncedSearch])

  useEffect(() => {
    fetchComboCourses()
  }, [searchComboCourses])

  useEffect(() => {
    fetchLecturers()
  }, [searchLecturers])

  useEffect(() => {
    fetchDepartments()
  }, [searchDepartments])

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

  const handleAddCourse = () => {
    setModalVisible(true)
    setIsEditMode(false)
    setFormError('')
    setFormSuccess('')
    setFormData({
      title: '',
      code: '',
      description: '',
      departmentId: '',
      prequisitesId: [],
      lecturerId: '',
      semester: '',
      academicYear: 0,
      schedule: '',
      roomLocation: '',
    })
  }

  const handleEditCourse = (course) => {
    setModalVisible(true)
    setIsEditMode(true)
    setCurrentDepartmentId(course._id)
    setFormError('')
    setFormSuccess('')
    setFormData({
      title: course.title || '',
      code: course.code || '',
      description: course.description || '',
      departmentId: course.departmentId || '',
      prequisitesId: course.prequisitesId || [],
      lecturerId: course.lecturerId || '',
      semester: course.semester || '',
      academicYear: course.academicYear || 0,
      schedule: course.schedule || '',
      roomLocation: course.roomLocation || '',
    })
  }

  const handlleDeleteCourse = async () => {
    try {
      const response = await fetchWithAuth(
        `${baseUrl}/api/v1/akadone/admin/course/delete/${courseToDelete}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
        navigate,
      )
      if (response.ok) {
        setFormSuccess('Course deleted successfully!')
        setDeleteModalVisible(false)
        setCourseToDelete(null)
        fetchCourses()
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to delete course')
      }
    } catch (err) {
      setError('Network error. Please try again later.')
      console.error('Delete error:', err)
    }
  }

  const handleOpenDeleteModal = (userId) => {
    setCourseToDelete(userId)
    setDeleteModalVisible(true)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const lecturerOptions = lecturers.map((lecturer) => ({
    value: lecturer._id,
    label: lecturer.fullname,
  }))

  const selectedLecturerOption =
    lecturerOptions.find((option) => option.value === formData.lecturerId) || null

  const handleLecturerOptions = (selectedLecturerOption) => {
    setFormData((prevData) => ({
      ...prevData,
      lecturerId: selectedLecturerOption.value,
    }))
  }

  const departmentOptions = departments.map((department) => ({
    value: department._id,
    label: department.name,
  }))

  const selectedDepartmentOption =
    departmentOptions.find((option) => option.value === formData.departmentId) || null

  const handleDepartmentOptions = (selectedDepartmentOption) => {
    setFormData((prevData) => ({
      ...prevData,
      departmentId: selectedDepartmentOption.value,
    }))
  }

  const handleCourseChange = (selectedOptions) => {
    const newCourses = selectedOptions ? selectedOptions.map((option) => option.value) : []
    setFormData((prev) => ({
      ...prev,
      prequisitesId: newCourses,
    }))
  }

  const courseOptions = courses.map((course) => ({
    value: course._id,
    label: course.title,
  }))

  const selectedCourses = formData.prequisitesId.map(
    (id) =>
      courseOptions.find((option) => option.value === id) || {
        value: id,
        label: id,
      },
  )

  const validateForm = () => {
    if (!formData.title) return 'Title is required'
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
        ? `${baseUrl}/api/v1/akadone/admin/course/update/${currentDepartmentId}`
        : `${baseUrl}/api/v1/akadone/admin/course/create`
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
          data.message || isEditMode
            ? 'Course updated successfully!'
            : 'Course created successfully!',
        )
        setModalVisible(false)
        fetchCourses()
      } else {
        const errorData = await response.json()
        setFormError(
          errorData.message || isEditMode ? 'Failed to update course' : 'Failed to create course',
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
          <CButton color="primary" onClick={handleAddCourse} className="mb-3">
            Add Course
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
                <CTableHeaderCell onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
                  Name{' '}
                  {sortBy === 'title' && (
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
                <CTableHeaderCell
                  onClick={() => handleSort('credits')}
                  style={{ cursor: 'pointer' }}
                >
                  SKS{' '}
                  {sortBy === 'credits' && (
                    <CIcon icon={sortOrder === 'asc' ? cilArrowTop : cilArrowBottom} />
                  )}
                </CTableHeaderCell>
                <CTableHeaderCell
                  onClick={() => handleSort('roomLocation')}
                  style={{ cursor: 'pointer' }}
                >
                  Room{' '}
                  {sortBy === 'roomLocation' && (
                    <CIcon icon={sortOrder === 'asc' ? cilArrowTop : cilArrowBottom} />
                  )}
                </CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {courses.length > 0 ? (
                courses.map((course, index) => (
                  <CTableRow key={course._id}>
                    <CTableDataCell>{index + 1 + (page - 1) * size}</CTableDataCell>
                    <CTableDataCell>{course.title}</CTableDataCell>
                    <CTableDataCell>{course.code}</CTableDataCell>
                    <CTableDataCell>{course.description}</CTableDataCell>
                    <CTableDataCell>{course.credits}</CTableDataCell>
                    <CTableDataCell>{course.roomLocation}</CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditCourse(course)}
                      >
                        <CIcon icon={cilPencil} /> Edit
                      </CButton>
                      <CButton
                        color="danger"
                        size="sm"
                        onClick={() => handleOpenDeleteModal(course._id)}
                      >
                        <CIcon icon={cilTrash} /> Delete
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan="6" className="text-center">
                    No courses found
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
            Showing {courses.length} of {totalElements} courses
          </p>
        </>
      )}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>{isEditMode ? 'Edit Course' : 'Add New Course'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleFormSubmit}>
            {formError && <CAlert color="danger">{formError}</CAlert>}
            {formSuccess && <CAlert color="success">{formSuccess}</CAlert>}
            <CRow>
              <CCol md={12}>
                <CFormLabel>Name</CFormLabel>
                <CFormInput
                  name="title"
                  value={formData.title}
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
                <CFormLabel>SKS</CFormLabel>
                <CFormInput
                  type="number"
                  name="credits"
                  value={formData.credits}
                  onChange={(e) => handleFormChange(e)}
                  required
                  className="mb-3"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={12}>
                <CFormLabel>Department</CFormLabel>
                <Select
                  name="departmentId"
                  options={departmentOptions}
                  value={selectedDepartmentOption}
                  onChange={(e) => handleDepartmentOptions(e)}
                  className="mb-3"
                  placeholder="Select department..."
                ></Select>
              </CCol>
            </CRow>
            <CRow>
              <CCol md={12}>
                <CFormLabel>Lecturer</CFormLabel>
                <Select
                  name="lecturerId"
                  options={lecturerOptions}
                  value={selectedLecturerOption}
                  onChange={(e) => handleLecturerOptions(e)}
                  className="mb-3"
                  placeholder="Select lecturer..."
                ></Select>
              </CCol>
            </CRow>
            <CRow>
              <CCol md={12}>
                <CFormLabel>Prequisites Courses</CFormLabel>
                <Select
                  isMulti
                  name="prequisitesId"
                  options={courseOptions}
                  value={selectedCourses}
                  onChange={handleCourseChange}
                  className="mb-3"
                  placeholder="Select courses..."
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={6}>
                <CFormLabel>Semester</CFormLabel>
                <CFormInput
                  name="semester"
                  value={formData.semester}
                  onChange={(e) => handleFormChange(e)}
                  required
                  className="mb-3"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Academic Year</CFormLabel>
                <CFormInput
                  type="number"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={(e) => handleFormChange(e)}
                  required
                  className="mb-3"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={12}>
                <CFormLabel>Schedule</CFormLabel>
                <CFormInput
                  name="schedule"
                  value={formData.schedule}
                  onChange={(e) => handleFormChange(e)}
                  required
                  className="mb-3"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={12}>
                <CFormLabel>Room</CFormLabel>
                <CFormInput
                  name="roomLocation"
                  value={formData.roomLocation}
                  onChange={(e) => handleFormChange(e)}
                  required
                  className="mb-3"
                />
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
        <CModalBody>Are you sure you want to delete this course?</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handlleDeleteCourse}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default Course
