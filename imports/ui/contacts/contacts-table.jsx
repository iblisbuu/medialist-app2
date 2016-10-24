import React, { PropTypes } from 'react'
import SortableHeader from '../tables/sortable-header'
import SelectableRow from '../tables/selectable-row'
import FromNow from '../time/from-now'
import YouOrName from '../users/you-or-name'
import { CircleAvatar } from '../images/avatar'
import isSameItems from '../lists/is-same-items'

const ContactsTable = React.createClass({
  propTypes: {
    // e.g. { updatedAt: -1 }
    sort: PropTypes.object,
    // Callback when sort changes, passed e.g. { updatedAt: 1 }
    onSortChange: PropTypes.func,
    // Data rows to render in the table
    contacts: PropTypes.array,
    // Selected contacts in the table
    selections: PropTypes.array,
    // Callback when selection(s) change
    onSelectionsChange: PropTypes.func
  },

  onSelectAllChange () {
    let selections

    if (isSameItems(this.props.selections, this.props.contacts)) {
      selections = []
    } else {
      selections = this.props.contacts.slice()
    }

    this.props.onSelectionsChange(selections)
  },

  onSelectChange (contact) {
    let { selections } = this.props
    const index = selections.findIndex((c) => c._id === contact._id)

    if (index === -1) {
      selections = selections.concat([contact])
    } else {
      selections.splice(index, 1)
      selections = Array.from(selections)
    }

    this.props.onSelectionsChange(selections)
  },

  render () {
    const { sort, onSortChange, contacts, selections } = this.props

    if (!contacts.length) {
      return <p className='p4 mb2 f-xl semibold center'>No contacts yet</p>
    }

    const selectionsById = selections.reduce((memo, selection) => {
      memo[selection._id] = selection
      return memo
    }, {})

    return (
      <table className='table'>
        <thead>
          <tr className='bg-gray90'>
            <th className='center' style={{width: 55}}>
              <input
                type='checkbox'
                checked={isSameItems(selections, contacts)}
                onChange={this.onSelectAllChange} />
            </th>
            <SortableHeader
              className='left-align'
              sortDirection={sort['name']}
              onSortChange={(d) => onSortChange({ name: d })}>
              Name
            </SortableHeader>
            <SortableHeader
              className='left-align'
              sortDirection={sort['jobTitles']}
              onSortChange={(d) => onSortChange({ 'jobTitles': d })}>
              Title
            </SortableHeader>
            <SortableHeader
              className='left-align'
              sortDirection={sort['primaryOutlets']}
              onSortChange={(d) => onSortChange({ 'primaryOutlets': d })}>
              Media Outlet
            </SortableHeader>
            <th className='left-align'>Email</th>
            <th className='left-align'>Phone</th>
            <SortableHeader
              className='left-align'
              sortDirection={sort['updatedAt']}
              onSortChange={(d) => onSortChange({ updatedAt: d })}>
              Updated
            </SortableHeader>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => {
            const {
              _id,
              name,
              avatar,
              jobTitles,
              primaryOutlets,
              emails,
              phones,
              updatedAt,
              updatedBy
            } = contact

            return (
              <SelectableRow data={contact} selected={!!selectionsById[_id]} onSelectChange={this.onSelectChange} key={_id}>
                <td className='left-align'>
                  <CircleAvatar avatar={avatar} name={name} />
                  <span className='ml3 semibold'>{name}</span>
                </td>
                <td className='left-align'>{jobTitles}</td>
                <td className='left-align'>{primaryOutlets}</td>
                <td className='left-align'>
                  <DisplayEmail emails={emails} />
                </td>
                <td className='left-align'>
                  <DisplayPhone phones={phones} />
                </td>
                <td className='left-align'>
                  <FromNow date={updatedAt} /> by <YouOrName user={updatedBy} />
                </td>
              </SelectableRow>
            )
          })}
        </tbody>
      </table>
    )
  }
})

const DisplayEmail = ({ emails }) => {
  if (!emails || !emails.length) return null
  return <a href={`mailto:${emails[0].value}`}>{emails[0].value}</a>
}

const DisplayPhone = ({ phones }) => {
  if (!phones || !phones.length) return null
  return <a href={`tel:${phones[0].value}`}>{phones[0].value}</a>
}

export default ContactsTable
