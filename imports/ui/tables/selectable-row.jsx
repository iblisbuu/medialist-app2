import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import Checkbox from '/imports/ui/tables/checkbox'

const SelectableRow = ({ selected, active, data, children, onSelectChange, className, ...props }) => (
  <tr className={classnames(className, 'hover-opacity-trigger', { hover: active })} data-id={props['data-id']} data-item={props['data-item']}>
    <td className='right-align' style={{paddingRight: 0}}>
      <Checkbox
        className={classnames('hover-opacity-100', { 'opacity-0': !selected })}
        checked={selected}
        onChange={() => onSelectChange(data)}
        data-id={`${props['data-id']}-checkbox`}
      />
    </td>
    {children}
  </tr>
)

SelectableRow.propTypes = {
  data: PropTypes.object,
  selected: PropTypes.bool,
  active: PropTypes.bool,
  onSelectChange: PropTypes.func
}

export default SelectableRow
