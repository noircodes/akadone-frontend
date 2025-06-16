import React, { useState, useEffect } from 'react';
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
} from '@coreui/react';
import moment from 'moment';
import { useDebounce } from 'use-debounce';
import { fetchWithAuth } from '../../../Api';
import { useNavigate } from 'react-router-dom';
import CIcon from '@coreui/icons-react';
import { cilArrowBottom, cilArrowTop, cilPencil, cilTrash } from '@coreui/icons';
import Select from 'react-select';
import { getBaseUrl } from '../../../utils';

const Lecturer = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState('username');
  const [sortOrder, setSortOrder] = useState('asc');
  const [search, setSearch] = useState('');
  const [departments, setDepartments] = useState([]);
  const [searchDepartment, setSearchDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
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
    specialization: '',
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const baseUrl = getBaseUrl()

  const navigate = useNavigate();
  const [debouncedSearch] = useDebounce(search, 500);

  // Available permissions for React Select
  const permissionOptions = [
    { value: 'read', label: 'Read' },
    { value: 'write', label: 'Write' },
    { value: 'admin', label: 'Admin' },
  ];

  // Transform formData.permissions for React Select
  const selectedPermissions = formData.permissions.map((perm) => ({
    value: perm,
    label: perm.charAt(0).toUpperCase() + perm.slice(1),
  }));

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchWithAuth(
        `${baseUrl}/api/v1/akadone/admin/lecturer/all?page=${page}&size=${size}&sortby=${sortBy}&order=${sortOrder}&name=${encodeURIComponent(search)}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        },
        navigate
      );
      if (response.ok) {
        const data = await response.json();
        setUsers(data.items || []);
        let totalPages = Math.ceil(data.total / size);
        setTotalPages(totalPages || 0);
        setTotalElements(data.total || 0);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, size, sortBy, sortOrder, debouncedSearch]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleAddUser = () => {
    setModalVisible(true);
    setIsEditMode(false);
    setFormError('');
    setFormSuccess('');
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
      specialization: '',
    });
  };

  const handleEditUser = (user) => {
    setModalVisible(true);
    setIsEditMode(true);
    setCurrentUserId(user._id);
    setFormError('');
    setFormSuccess('');
    setFormData({
      username: user.username || '',
      password: '', // Password is not retrieved for security
      fullname: user.fullname || '',
      photoUrl: user.photoUrl || '',
      email: user.email || '',
      phone: user.phone || '',
      noId: user.noId || '',
      gender: user.gender || '',
      permissions: user.permissions || [],
      specialization: user.specialization || [],
    });
  };

  const handleDeleteUser = async () => {
    try {
      const response = await fetchWithAuth(
        `${baseUrl}/api/v1/akadone/admin/lecturer/delete/${userToDelete}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        },
        navigate
      );
      if (response.ok) {
        setFormSuccess('User deleted successfully!');
        setDeleteModalVisible(false);
        setUserToDelete(null);
        fetchUsers();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete user');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
      console.error('Delete error:', err);
    }
  };

  const handleOpenDeleteModal = (userId) => {
    setUserToDelete(userId);
    setDeleteModalVisible(true);
  };

  // Handle form changes for inputs and selects
  const handleFormChange = (e, field) => {
    if (field === 'permissions') {
      // Handle React Select for permissions
      const selected = e ? e.map((option) => option.value) : [];
      setFormData((prev) => ({ ...prev, permissions: selected }));
    } else {
      // Handle standard inputs and CFormSelect
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.username) return 'Username is required';
    if (!isEditMode && !formData.password) return 'Password is required';
    if (!formData.email) return 'Email is required';
    return '';
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const url = isEditMode
        ? `${baseUrl}/api/v1/akadone/admin/lecturer/update/${currentUserId}`
        : '${baseUrl}/api/v1/akadone/admin/lecturer/create';
      const method = isEditMode ? 'PUT' : 'POST';
      
      // Remove password from formData if empty in edit mode
      const submitData = isEditMode && !formData.password 
        ? { ...formData, password: undefined }
        : formData;

      const response = await fetchWithAuth(
        url,
        {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        },
        navigate
      );
      if (response.ok) {
        const data = await response.json();
        setFormSuccess(data.message || isEditMode ? 'User updated successfully!' : 'User created successfully!');
        setModalVisible(false);
        fetchUsers();
      } else {
        const errorData = await response.json();
        setFormError(errorData.message || isEditMode ? 'Failed to update user' : 'Failed to create user');
      }
    } catch (err) {
      if (err.message !== 'Unauthorized: Redirecting to login') {
        setFormError('Network error. Please try again later.');
        console.error('Submit error:', err);
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

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
          <CButton color="primary" onClick={handleAddUser} className="mb-3">
            Add Lecturer
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
                <CTableHeaderCell onClick={() => handleSort('fullname')} style={{ cursor: 'pointer' }}>
                  Fullname {sortBy === 'fullname' && <CIcon icon={sortOrder === 'asc' ? cilArrowTop : cilArrowBottom} />}
                </CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                  Email {sortBy === 'email' && <CIcon icon={sortOrder === 'asc' ? cilArrowTop : cilArrowBottom} />}
                </CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSort('specialization')} style={{ cursor: 'pointer' }}>
                  Specialization {sortBy === 'specialization' && <CIcon icon={sortOrder === 'asc' ? cilArrowTop : cilArrowBottom} />}
                </CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSort('lastLogin')} style={{ cursor: 'pointer' }}>
                  Last Login {sortBy === 'lastLogin' && <CIcon icon={sortOrder === 'asc' ? cilArrowTop : cilArrowBottom} />}
                </CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <CTableRow key={user._id}>
                    <CTableDataCell>{index + 1 + (page - 1) * size}</CTableDataCell>
                    <CTableDataCell>{user.fullname}</CTableDataCell>
                    <CTableDataCell>{user.email}</CTableDataCell>
                    <CTableDataCell>{user.specialization}</CTableDataCell>
                    <CTableDataCell>
                      {user.lastLogin
                        ? moment(user.lastLogin).utcOffset(14).format("dddd, MMMM Do YYYY, h:mm:ss a")
                        : ""}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditUser(user)}
                      >
                        <CIcon icon={cilPencil} /> Edit
                      </CButton>
                      <CButton
                        color="danger"
                        size="sm"
                        onClick={() => handleOpenDeleteModal(user._id)}
                      >
                        <CIcon icon={cilTrash} /> Delete
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan="6" className="text-center">
                    No users found
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
            Showing {users.length} of {totalElements} users
          </p>
        </>
      )}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>{isEditMode ? 'Edit Lecturer' : 'Add New Lecturer'}</CModalTitle>
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
                  onChange={(e) => handleFormChange(e)}
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
                  onChange={(e) => handleFormChange(e)}
                  required={!isEditMode}
                  className="mb-3"
                  placeholder={isEditMode ? 'Leave blank to keep unchanged' : ''}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={12}>
                <CFormLabel>Full Name</CFormLabel>
                <CFormInput
                  name="fullname"
                  value={formData.fullname}
                  onChange={(e) => handleFormChange(e)}
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
                  onChange={(e) => handleFormChange(e)}
                  className="mb-3"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={12}>
                <CFormLabel>Email</CFormLabel>
                <CFormInput
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange(e)}
                  required
                  className="mb-3"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={12}>
                <CFormLabel>Phone</CFormLabel>
                <CFormInput
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => handleFormChange(e)}
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
                  onChange={(e) => handleFormChange(e)}
                  className="mb-3"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Gender</CFormLabel>
                <CFormSelect
                  name="gender"
                  value={formData.gender}
                  onChange={(e) => handleFormChange(e)}
                  className="mb-3"
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </CFormSelect>
              </CCol>
            </CRow>
            <CRow>
              <CCol md={12}>
                <CFormLabel>Permissions</CFormLabel>
                <Select
                  isMulti
                  name="permissions"
                  options={permissionOptions}
                  value={selectedPermissions}
                  onChange={(selectedOptions) => handleFormChange(selectedOptions, 'permissions')}
                  className="mb-3"
                  placeholder="Select permissions..."
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={12}>
                <CFormLabel>Specialization</CFormLabel>
                <CFormInput
                  name="specialization"
                  value={formData.specialization}
                  onChange={(e) => handleFormChange(e)}
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
        <CModalBody>
          Are you sure you want to delete this user?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDeleteUser}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default Lecturer;