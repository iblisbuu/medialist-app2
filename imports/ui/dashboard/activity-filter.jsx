import React, { PropTypes } from 'react'
import { Dropdown, DropdownMenu } from '../navigation/dropdown'
import { Option } from '../navigation/select.jsx'
import {
  AllTypesIcon,
  FeedFeedbackIcon,
  FeedCoverageIcon,
  FeedNeedToKnowIcon,
  StatusUpdateIcon,
  ChevronDown
} from '../images/icons'

const iconMap = {
  'All Activity': AllTypesIcon,
  'Feedback': FeedFeedbackIcon,
  'Coverage': FeedCoverageIcon,
  'Need-to-knows': FeedNeedToKnowIcon,
  'Updates': StatusUpdateIcon
}

export const filterNames = Object.keys(iconMap)

const Filter = ({name, selected, onClick}) => {
  const Icon = iconMap[name]
  return (
    <Option onClick={onClick} selected={selected}>
      <Icon className='gray60' />
      <span className={`ml2 gray20 ${selected ? 'semibold' : 'regular'}`}>{name}</span>
    </Option>
  )
}

const ActivityFilter = React.createClass({
  propTypes: {
    selected: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  },
  getInitialState () {
    return { open: false }
  },
  toggleDropdown () {
    const open = !this.state.open
    this.setState({open})
  },
  closeDropdown () {
    this.setState({open: false})
  },
  onLinkClick (filterName) {
    this.setState({open: false, selected: filterName})
    this.props.onChange(filterName)
  },
  render () {
    const { toggleDropdown } = this
    const { open } = this.state
    const { selected } = this.props
    return (
      <div className='flex'>
        <Dropdown>
          <div className='flex-none p3 pointer' onClick={toggleDropdown}>
            <span className={`f-sm semibold ${open ? 'blue' : 'gray20'}`}>
              {selected}
              <ChevronDown />
            </span>
            <DropdownMenu width={213} open={open} onDismiss={toggleDropdown}>
              <nav className='py1'>
                {filterNames.map((filterName) => (
                  <Filter key={filterName} name={filterName} selected={filterName === selected} onClick={() => this.onLinkClick(filterName)} />)
                )}
              </nav>
            </DropdownMenu>
          </div>
        </Dropdown>
        <hr className='flex-auto' style={{height: 1, margin: '25px 0 0 0'}} />
      </div>
    )
  }
})

export default ActivityFilter
