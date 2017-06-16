import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import SortableHeader from '/imports/ui/tables/sortable-header'
import SelectableRow from '/imports/ui/tables/selectable-row'
import Checkbox from '/imports/ui/tables/checkbox'
import { TimeFromNow } from '/imports/ui/time/time'
import YouOrName from '/imports/ui/users/you-or-name'
import { CircleAvatar } from '/imports/ui/images/avatar'
import isSameItems from '/imports/ui/lists/is-same-items'
import StatusLabel from '/imports/ui/feedback/status-label'
import StatusSelectorContainer from '/imports/ui/feedback/status-selector-container'

const ContactLink = ({contact, campaign}) => {
  const {slug, name, avatar} = contact

  return (
    <Link to={`/contact/${slug}`} className='nowrap' data-id='contact-link' data-contact={contact._id}>
      <CircleAvatar avatar={avatar} name={name} />
      <span className='ml3 semibold'>{name}</span>
    </Link>
  )
}

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
    onSelectionsChange: PropTypes.func,
    // Optional campaign for calculating a contacts status
    campaign: PropTypes.object,
    // returns true while subscriptionts are still syncing data.
    loading: PropTypes.bool,
    // true if we are searching
    searching: PropTypes.bool
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
    const { sort, onSortChange, contacts, selections, campaign, loading } = this.props

    if (!loading && !contacts.length) {
      return <p className='pt2 pb5 mt0 f-xl semibold center' data-id='contacts-table-empty'>No contacts found</p>
    }

    const selectionsById = selections.reduce((memo, selection) => {
      memo[selection._id] = selection
      return memo
    }, {})

    return (
      <div>
        <table className='table' data-id={`contacts-table${this.props.searching ? '-search-results' : '-unfiltered'}`}>
          <thead>
            <tr className='bg-gray90'>
              <th className='right-align' style={{width: 34, paddingRight: 0, borderRight: '0 none'}}>
                <Checkbox
                  checked={isSameItems(selections, contacts)}
                  onChange={this.onSelectAllChange} />
              </th>
              <SortableHeader
                className='left-align'
                sortDirection={sort['name']}
                style={{borderLeft: '0 none'}}
                onSortChange={(d) => onSortChange({ name: d })}>
                Name
              </SortableHeader>
              <SortableHeader
                className='left-align'
                sortDirection={sort['outlets.value']}
                onSortChange={(d) => onSortChange({ 'outlets.value': d })}>
                Title
              </SortableHeader>
              <SortableHeader
                className='left-align'
                sortDirection={sort['outlets.label']}
                onSortChange={(d) => onSortChange({ 'outlets.label': d })}>
                Media Outlet
              </SortableHeader>
              <th className='left-align'>Email</th>
              <th className='left-align'>Phone</th>
              {campaign && (
                <SortableHeader
                  className='left-align'
                  sortDirection={sort['status']}
                  onSortChange={(d) => onSortChange({ status: d })}>
                  Status
                </SortableHeader>
              )}
              <SortableHeader
                className='left-align'
                sortDirection={sort['updatedAt']}
                onSortChange={(d) => onSortChange({ updatedAt: d })}>
                Updated
              </SortableHeader>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact, index) => {
              const {
                _id,
                emails,
                outlets,
                phones,
                updatedBy
              } = contact
              return (
                <SelectableRow data={contact} selected={!!selectionsById[_id]} onSelectChange={this.onSelectChange} key={_id} data-id={`contacts-table-row-${index}`} data-item={_id}>
                  <td className='left-align'>
                    <ContactLink contact={contact} campaign={campaign} />
                  </td>
                  <td className='left-align'>
                    {(outlets && outlets.length && outlets[0].value) ? outlets[0].value : <span className='gray60'>No title</span>}
                  </td>
                  <td className='left-align'>
                    {(outlets && outlets.length && outlets[0].label) ? outlets[0].label : <span className='gray60'>No outlet</span>}
                  </td>
                  <td className='left-align'>
                    <DisplayEmail emails={emails} />
                  </td>
                  <td className='left-align'>
                    <DisplayPhone phones={phones} />
                  </td>
                  {campaign && (
                    <td className='left-align' style={{overflow: 'visible'}}>
                      <StatusSelectorContainer
                        buttonClassName='btn btn-no-border bg-transparent'
                        buttonStyle={{marginLeft: 0}}
                        contactSlug={contact.slug}
                        campaign={campaign}
                        children={(status) => <StatusLabel name={status} />}
                      />
                    </td>
                  )}
                  <td className='left-align'>
                    <TimeFromNow className='semibold f-sm' date={campaign ? contact.campaigns[campaign.slug].updatedAt : contact.updatedAt} />
                    <span className='normal f-sm'> by <YouOrName user={updatedBy} /></span>
                  </td>
                </SelectableRow>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
})

const DisplayEmail = ({ emails }) => {
  if (!emails || !emails.length) {
    return <span className='gray60'>No email</span>
  }

  return <a href={`mailto:${emails[0].value}`}>{emails[0].value}</a>
}

const DisplayPhone = ({ phones }) => {
  if (!phones || !phones.length) {
    return <span className='gray60'>No phone</span>
  }

  return <a href={`tel:${phones[0].value}`}>{phones[0].value}</a>
}

export default ContactsTable
