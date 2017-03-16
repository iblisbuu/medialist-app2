import React from 'react'
import { StatusValues } from '/imports/api/contacts/status'

const StatusStats = ({statuses, onStatusClick, ...props}) => {
  // { 'Completed': 10, 'Hot Lead': 3, etc}
  const counts = statuses.reduce((counts, s) => {
    if (!counts[s]) counts[s] = 0
    counts[s] = counts[s] + 1
    return counts
  }, {})
  return (
    <div {...props}>
      {StatusValues.map((status, i) => (
        <div
          key={status}
          onClick={() => onStatusClick(status)}
          className={`inline-block pointer px3 border-left hover-color-trigger ${i > 0 ? 'border-gray80' : 'border-transparent'}`}>
          <div className='gray20 hover-blue normal center pb1' style={{fontSize: 20}}>{counts[status] || 0}</div>
          <div className='gray40 hover-blue semibold f-xxs caps center'>{status}</div>
        </div>
      ))}
    </div>
  )
}

export default StatusStats
