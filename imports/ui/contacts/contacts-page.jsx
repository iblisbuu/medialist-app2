import querystring from 'querystring'
import React from 'react'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import { Link, withRouter } from 'react-router'
import Arrow from 'rebass/dist/Arrow'
import { Dropdown, DropdownMenu } from '../navigation/dropdown'
import ContactsTable from './contacts-table'
import SearchBox from '../lists/search-box'
import ContactsActionsToast from './contacts-actions-toast'
import SectorSelector from '../campaigns/sector-selector.jsx'
import EditContact from './edit-contact.jsx'
import ContactListEmpty from './contacts-list-empty'
import { FeedContactIcon } from '../images/icons'
import createSearchContainer from './search-container'
import Medialists from '/imports/api/medialists/medialists'
import { AvatarTag } from '../tags/tag'

/*
 * ContactPage and ContactsPageContainer
 *
 * The Router passes in parameters on query string.
 * The Page component is wrapped in a Meteor data container.
 * The container handles the subscription, and maps the query params to subscription filters.
 * The subscription should be stable across param changes. The router will update the page rather than destroy and re-create, as the same page is matched each time the query changes.
 * The subcription is initially the n recently updated contacts
 * The sort options are encoded as `?sort=updatedAt+asc`
 * The search term is `?q=<term>`
 * The sector-selector is ?sector=<sector>
 */

const ContactsPage = React.createClass({
  getInitialState () {
    return {
      selections: [],
      selectedSector: null,
      isDropdownOpen: false,
      addContactModalOpen: false
    }
  },

  onSectorChange (selectedSector) {
    this.setState({ selectedSector })
  },

  onSortChange (sort) {
    this.props.setQuery({ sort })
  },

  onTermChange (term) {
    this.props.setQuery({ term })
  },

  onSelectionsChange (selections) {
    this.setState({ selections })
  },

  onDeselectAllClick () {
    this.setState({ selections: [] })
  },

  onDeleteAllClick () {
    const { selections } = this.state
    const contactIds = selections.map((s) => s._id)
    Meteor.call('contacts/remove', contactIds, (err, res) => {
      if (err) return console.error('Removing contacts failed', err)
      this.setState({ selections: [] })
    })
  },

  onDropdownArrowClick () {
    this.setState({ isDropdownOpen: true })
  },

  onDropdownDismiss () {
    this.setState({ isDropdownOpen: false })
  },

  onLinkClick () {
    this.setState({ isDropdownOpen: false })
  },

  toggleAddContactModal () {
    this.setState({ addContactModalOpen: !this.state.addContactModalOpen })
  },

  onAddContactChange (contact) {
    console.log('change', contact)
  },

  onAddContactSubmit (contact) {
    console.log('submit', contact)
  },

  onCampaignRemove (campaign) {
    const { setQuery, campaignSlugs } = this.props
    setQuery({
      campaignSlugs: campaignSlugs.filter((str) => str !== campaign.slug)
    })
  },

  render () {
    const { contactsCount, loading, searching, contacts, term, sort, campaigns } = this.props
    const { onSortChange, onSelectionsChange, onSectorChange, onTermChange, onCampaignRemove } = this
    const { selections } = this.state
    if (!loading && contactsCount === 0) return <ContactListEmpty />
    return (
      <div>
        <div className='flex items-center justify-end bg-white width-100 shadow-inset-2'>
          <div className='flex-auto border-right border-gray80'>
            <SectorSelectorContainer selected={this.state.selectedSector} onSectorChange={onSectorChange} />
          </div>
          <div className='flex-none bg-white center px4' style={{width: 240}}>
            <button className='btn bg-completed white mr1' onClick={this.toggleAddContactModal}>New Contact</button>
            <Dropdown>
              <button className='btn bg-completed white' onClick={this.onDropdownArrowClick} >
                <Arrow direction='down' style={{ marginLeft: 0 }} />
              </button>
              <DropdownMenu width={210} left={-165} top={0} open={this.state.isDropdownOpen} onDismiss={this.onDropdownDismiss}>
                <nav className='block py1'>
                  <Link to='/contacts/import' className='block px3 py2 f-md normal gray20 hover-bg-gray90' activeClassName='active' onClick={this.onLinkClick}>
                    <FeedContactIcon />
                    <span className='ml2'>Import Contacts</span>
                  </Link>
                </nav>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className='bg-white shadow-2 m4 mt8'>
          <div className='p4 flex items-center'>
            <div className='flex-auto'>
              <SearchBox onTermChange={onTermChange} placeholder='Search contacts...'>
                {campaigns && campaigns.map((c) => (
                  <AvatarTag
                    key={c.slug}
                    name={c.name}
                    avatar={c.avatar}
                    style={{marginBottom: 0}}
                    onRemove={() => onCampaignRemove(c)}
                  />
                ))}
              </SearchBox>
            </div>
            <div className='flex-none pl4 f-xs'>
              <ContactsTotal searching={searching} results={contacts} total={contactsCount} />
            </div>
          </div>
          <ContactsTable
            contacts={contacts}
            loading={loading}
            sort={sort}
            limit={25}
            term={term}
            selections={selections}
            onSortChange={onSortChange}
            onSelectionsChange={onSelectionsChange} />
        </div>
        <ContactsActionsToast
          contacts={selections}
          onCampaignClick={() => console.log('TODO: add contacts to campaign')}
          onSectorClick={() => console.log('TODO: add/edit sectors')}
          onFavouriteClick={() => console.log('TODO: toggle favourite')}
          onTagClick={() => console.log('TODO: add/edit tags')}
          onDeleteClick={this.onDeleteAllClick}
          onDeselectAllClick={this.onDeselectAllClick} />
        <EditContact
          onDismiss={this.toggleAddContactModal}
          onChange={this.onAddContactChange}
          onSubmit={this.onAddContactSubmit}
          open={this.state.addContactModalOpen} />
      </div>
    )
  }
})

const SectorSelectorContainer = createContainer((props) => {
  return { ...props, items, selected: props.selected || items[0] }
}, SectorSelector)

const ContactsTotal = ({ searching, results, total }) => {
  const num = searching ? results.length : total
  const label = searching ? 'match' : 'total'
  return <div>{num} contact{num === 1 ? '' : 's'} {label}</div>
}

const SearchableContactsPage = createSearchContainer(ContactsPage)

// I decode and encode the search options from the query string
// and set up the subscriptions and collecton queries from those options.
const ContactsPageContainer = withRouter(React.createClass({
  // API is like setState..
  // Pass an obj with the new params you want to set on the query string.
  setQuery (opts) {
    const { location, router } = this.props
    const newQuery = {}
    if (opts.sort) newQuery.sort = JSON.stringify(opts.sort)
    if (opts.hasOwnProperty('term')) {
      newQuery.q = opts.term
    }
    if (opts.campaignSlugs) newQuery.campaign = opts.campaignSlugs
    const query = Object.assign({}, location.query, newQuery)
    if (query.q === '') delete query.q
    const qs = querystring.stringify(query)
    router.replace('/contacts?' + qs)
  },

  parseQuery ({query}) {
    const sort = query.sort ? JSON.parse(query.sort) : { updatedAt: -1 }
    const term = query.q || ''
    const { campaign } = query
    if (!campaign) return { sort, term, campaignSlugs: [], campaigns: [] }

    const campaignSlugs = Array.isArray(campaign) ? campaign : [campaign]
    const campaigns = Medialists.find({slug: {$in: campaignSlugs}}).fetch()
    return { sort, term, campaignSlugs, campaigns }
  },

  render () {
    const { location } = this.props
    return (
      <SearchableContactsPage
        {...this.props}
        {...this.data}
        {...this.parseQuery(location)}
        setQuery={this.setQuery} />
    )
  }
}))

export default ContactsPageContainer

// Fake data
const items = [
  { _id: 0, name: 'All', count: 10 },
  { _id: 1, name: 'My campaigns', count: 5 },
  { _id: 2, name: 'Corporate', count: 97 },
  { _id: 3, name: 'Energy', count: 18 },
  { _id: 4, name: 'Consumer', count: 120 },
  { _id: 5, name: 'Healthcare', count: 55 },
  { _id: 6, name: 'Public Affairs', count: 37 },
  { _id: 7, name: 'Technology', count: 201 }
]
