import React, { PropTypes } from 'react'
import Dropdown from 'rebass/dist/Dropdown'
import AutocompleteDropdownMenu from '../lists/autocomplete-dropdown-menu'
import isEqual from 'lodash.isequal'
import callAll from '/imports/lib/call-all'

const dropdownStyle = { maxWidth: 300 }

export default React.createClass({
  propTypes: {
    className: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    suggestions: PropTypes.array.isRequired
  },
  getInitialState () {
    return { open: false, activeInd: null }
  },
  componentWillReceiveProps (props) {
    const { suggestions, value } = props
    if (isEqual(suggestions, this.props.suggestions) && value === props.value) return
    this.setState({open: suggestions.length > 0 && suggestions[0] !== value})
  },
  onBlur () {
    this.setState({ open: false, activeInd: null })
  },
  onChange (evt) {
    this.props.onChange(evt.target.value)
    this.setState({open: true})
  },
  onKeyDown (evt) {
    const { key } = evt
    if (!this.props.suggestions.length) return
    const { suggestions } = this.props
    const { open, activeInd } = this.state
    switch (key) {
      case 'ArrowDown':
        if (!open) return this.setState({open: true})
        if (activeInd == null) return this.setState({ activeInd: 0 })
        if (activeInd < suggestions.length - 1) this.setState({ activeInd: activeInd + 1 })
        break

      case 'ArrowUp':
        if (activeInd > 0) this.setState({ activeInd: activeInd - 1 })
        break

      case 'Enter':
        if (open) evt.preventDefault()
        if (activeInd !== null) {
          this.props.onSelect(suggestions[activeInd])
          this.setState({ open: false, activeInd: null })
        }
    }
  },
  onDismiss () {
    this.setState({ open: false, activeInd: null })
  },
  onClick (suggestion) {
    this.props.onSelect(suggestion)
    this.setState({ open: false, activeInd: null })
  },
  onActivate (ind) {
    this.setState({ activeInd: ind })
  },
  render () {
    const {
      style,
      className,
      name,
      value,
      placeholder,
      suggestions,
      onFocus,
      onBlur
    } = this.props
    const { onChange, onDismiss, onClick, onKeyDown, onActivate } = this
    const { open, activeInd } = this.state
    return (
      <Dropdown style={{ display: 'inline-block', ...style }}>
        <input
          type='text'
          className={className}
          name={name}
          value={value}
          placeholder={placeholder}
          autoComplete='off'
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={callAll([this.onBlur, onBlur])}
        />
        <AutocompleteDropdownMenu open={open} onDismiss={onDismiss} style={dropdownStyle}>
          <ol className='list-reset'>{suggestions.map((s, ind) => {
            const activeClass = (activeInd === ind) ? 'bg-blue white' : ''
            return (
              <li
                key={s}
                className={`block px3 py2 pointer left-align f-sm normal gray20 ${activeClass}`}
                onMouseOver={() => onActivate(ind)}
                onMouseOut={() => onActivate(null)}
                onMouseDown={() => onClick(s)}>
                {s}
              </li>
            )
          })}</ol>
        </AutocompleteDropdownMenu>
      </Dropdown>
    )
  }
})
