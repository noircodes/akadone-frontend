import React from 'react'
import { CFormSelect } from '@coreui/react'
import PropTypes from 'prop-types'

const FormSelect = ({ options, ariaLabel, defaultValue, onChange, ...props }) => {
  return (
    <CFormSelect
      aria-label={ariaLabel || 'Default select'}
      options={options}
      defaultValue={defaultValue}
      onChange={onChange}
      {...props}
    />
  )
}

FormSelect.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string,
      disabled: PropTypes.bool,
    })
  ).isRequired,
  ariaLabel: PropTypes.string,
  defaultValue: PropTypes.string,
  onChange: PropTypes.func,
}

FormSelect.defaultProps = {
  ariaLabel: 'Default select',
  defaultValue: '',
  onChange: undefined,
}

export default FormSelect