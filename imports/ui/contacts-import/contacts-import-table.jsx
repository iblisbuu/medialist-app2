import React from 'react'
import PropTypes from 'prop-types'
import Dropdown from 'rebass/dist/Dropdown'
import DropdownMenu from '/imports/ui/lists/dropdown-menu'
import { SelectedIcon, ChevronDown } from '/imports/ui/images/icons'
import { allColumns } from '/imports/ui/contacts-import/csv-to-contacts.js'
import { BLUE } from '/imports/ui/colours'

const ImportTable = React.createClass({
  propTypes: {
    rows: PropTypes.array.isRequired,
    cols: PropTypes.array.isRequired,
    onColumnChange: PropTypes.func.isRequired
  },

  getInitialState () {
    return { open: false }
  },

  onDismiss () {
    this.setState({ open: false })
  },

  onColumnSelect (i) {
    this.setState({ open: i })
  },

  onColumnChange (newCol, columnIndex) {
    const { onColumnChange } = this.props
    this.setState({ open: false })
    onColumnChange(newCol, columnIndex)
  },

  render () {
    const { onDismiss, onColumnSelect, onColumnChange } = this
    const { open } = this.state
    const { rows, cols } = this.props
    const firstRow = rows[0]
    const otherRows = rows.slice(1)

    /*
    cols is
    [{key: 'name', label: 'Name'}, {key: 'email', label: 'Email'}]

    a col will be null if we couldn't figure out what to map the data to.

    rows is
    [['Dave', 'dave@exmaple.org'], ['Bob', 'bob@example.org']]
    */

    return (
      <div style={{overflowY: 'scroll'}}>
        <table className='table bg-white shadow-2 nowrap'>
          <thead>
            <tr>
              {cols.map((col, columnIndex) => {
                return (
                  <th key={columnIndex} className='pointer bg-white' style={{width: 240, padding: '0px 80px 0 0', borderLeft: '0 none', borderRight: '0 none'}}>
                    <Dropdown>
                      <div className='p2 m2 rounded border border-gray80 left-align' style={{width: 180}} onClick={() => onColumnSelect(columnIndex)}>
                        <ChevronDown className='right' />
                        {col ? (
                          <span className='gray10 semibold'>{col.label}</span>
                        ) : (
                          <span className='gray40'>Select a field</span>
                        )}
                      </div>
                      <DropdownMenu open={open && open === columnIndex} onDismiss={onDismiss} style={{left: '5px'}}>
                        <ul className='list-reset mt0'>
                          {allColumns.map((newCol, i) => {
                            return <li key={i} className='p2 left-align hover-bg-blue' onClick={(evt) => onColumnChange(newCol, columnIndex)}>{newCol.label}</li>
                          })}
                        </ul>
                      </DropdownMenu>
                    </Dropdown>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            <tr className='bg-gray90'>
              {firstRow.map((cell, i) => (
                <td key={i} className='left-align' style={{borderLeft: '0 none', borderRight: '0 none'}}>
                  <div className='inline-block truncate align-middle semibold f-sm gray20' style={{maxWidth: '40em'}} >{cell}</div>
                  { cols[i] && <SelectedIcon className='ml2' style={{width: 14, height: 14, fill: BLUE}} /> }
                </td>
              ))}
            </tr>
            {otherRows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, i) => (
                  <td key={i} className={`truncate ${i === 0 ? 'gray10' : 'gray20'}`} style={{maxWidth: '40em'}}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
})

export default ImportTable
