import React, { PropTypes } from 'react'
import classNames from 'classnames'
import { StatusValues } from '/imports/api/contacts/status'

const StatusDot = ({ name, size = 12, className, style }) => {
  if (!name) return null
  const ref = name.toLowerCase().replace(' ', '-')
  className = classNames(`inline-block align-middle circle bg-${ref}`, className)
  return (
    <span title={name} className={className} style={{ width: size, height: size, ...style }} />
  )
}

StatusDot.propTypes = {
  name: PropTypes.oneOf(StatusValues).isRequired,
  size: PropTypes.number,
  className: PropTypes.string
}

export default StatusDot
