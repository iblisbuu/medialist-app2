import React from 'react'
import PropTypes from 'prop-types'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import fileDownload from 'react-file-download'
import { DataDam } from 'react-data-dam'
import ContactsTable from '/imports/ui/contacts/contacts-table'
import SearchBox from '/imports/ui/lists/search-box'
import ContactsActionsToast from '/imports/ui/contacts/contacts-actions-toast'
import CampaignTopbar from '/imports/ui/campaigns/campaign-topbar'
import CampaignSummary from '/imports/ui/campaigns/campaign-summary'
import Campaigns from '/imports/api/campaigns/campaigns'
import Contacts from '/imports/api/contacts/contacts'
import AddOrCreateContactModal from '/imports/ui/campaigns/add-or-create-contact'
import RemoveContactModal from '/imports/ui/campaigns/remove-contact'
import AddContactsToCampaign from '/imports/ui/contacts/add-to-campaign/add-many-modal'
import AddTagsModal from '/imports/ui/tags/add-tags-modal'
import AddToMasterListModal from '/imports/ui/master-lists/add-to-master-list-modal'
import MergeContactsModal from '/imports/ui/contacts/merge/merge-contacts-modal'
import AbbreviatedAvatarList from '/imports/ui/lists/abbreviated-avatar-list'
import { batchAddToMasterLists } from '/imports/api/master-lists/methods'
import { batchAddTags } from '/imports/api/tags/methods'
import { batchFavouriteContacts, batchUpdateStatus } from '/imports/api/contacts/methods'
import { exportCampaignToCsv, assignContactOwner } from '/imports/api/campaigns/methods'
import NearBottomContainer from '/imports/ui/navigation/near-bottom-container'
import SubscriptionLimitContainer from '/imports/ui/navigation/subscription-limit-container'
import { LoadingBar } from '/imports/ui/lists/loading'
import querystring from 'querystring'
import { StatusIndex } from '/imports/api/contacts/status'
import escapeRegExp from 'lodash.escaperegexp'
import { collationSort } from '/imports/lib/collation'
import { CampaignContacts, CampaignContactStatuses } from '/imports/ui/campaigns/collections'
import ShowUpdatesButton from '/imports/ui/lists/show-updates-button'
import { sortedAutoRelease, updatedByUserAutoRelease, compose } from '/imports/ui/lists/data-dam'

const minSearchLength = 3

class CampaignContactsPage extends React.Component {
  static propTypes = {
    campaign: PropTypes.object.isRequired,
    contacts: PropTypes.array.isRequired,
    contactsCount: PropTypes.number.isRequired,
    term: PropTypes.string,
    setQuery: PropTypes.func.isRequired,
    status: PropTypes.string,
    statusCounts: PropTypes.object
  }

  state = {
    ready: false,
    selections: [],
    selectionMode: 'include',
    isDropdownOpen: false,
    addContactModal: false,
    addContactsToCampaignModal: false,
    addTagsModal: false,
    addToMasterListsModal: false,
    removeContactsModal: false,
    mergeContactsModal: false
  }

  componentWillReceiveProps (nextProps) {
    if (this.state.ready) return
    if (nextProps.loading === false) {
      this.setState({ready: true})
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.state.ready === prevState.ready) return
    const {location} = this.props
    if (location.state && location.state.scrollPos) {
      window.scrollTo.apply(window, location.state.scrollPos)
    }
  }

  onContactClick = (e) => {
    const {location, router} = this.props
    const highlightContactSlug = e.currentTarget.dataset.contact

    router.replace({
      pathname: location.pathname,
      query: location.query,
      state: {
        scrollPos: [0, window.scrollY],
        highlightContactSlug
      }
    })
  }

  onAddContactClick = () => {
    this.showModal('addContactModal')
  }

  onFavouriteAll = () => {
    const contactSlugs = this.state.selections.map((s) => s.slug)

    batchFavouriteContacts.call({contactSlugs}, (error) => {
      if (error) {
        console.log(error)
        return this.context.snackbar.error('batch-favourite-contacts-failure')
      }
      this.context.snackbar.show(`Favourited ${contactSlugs.length} ${contactSlugs.length === 1 ? 'contact' : 'contacts'}`, 'batch-favourite-contacts-success')
    })
  }

  onTagAll = (tags) => {
    const slugs = this.state.selections.map((s) => s.slug)
    const names = tags.map((t) => t.name)

    batchAddTags.call({type: 'Contacts', slugs, names}, (error) => {
      if (error) {
        console.error(error)
        return this.context.snackbar.error('batch-tag-contacts-failure')
      }

      this.context.snackbar.show(`Added ${names.length} ${names.length === 1 ? 'tag' : 'tags'} to ${slugs.length} ${slugs.length === 1 ? 'contact' : 'contacts'}`, 'batch-tag-contacts-success')
    })
  }

  onAddAllToMasterLists = (masterLists) => {
    const slugs = this.state.selections.map((s) => s.slug)
    const masterListIds = masterLists.map((m) => m._id)

    batchAddToMasterLists.call({type: 'Contacts', slugs, masterListIds}, (error) => {
      if (error) {
        console.error(error)
        return this.context.snackbar.error('contacts-batch-add-to-contact-list-failure')
      }

      this.context.snackbar.show(`Added ${slugs.length} ${slugs.length === 1 ? 'contact' : 'contacts'} to ${masterLists.length} ${masterLists.length === 1 ? 'Contact List' : 'Contact Lists'}`, 'batch-add-contacts-to-contact-list-success')
    })
  }

  onBatchUpdateStatus = (contacts, status) => {
    const contactSlugs = contacts.map((c) => c.slug)
    batchUpdateStatus.call({
      campaignSlug: this.props.campaign.slug,
      contactSlugs: contactSlugs,
      status
    }, (error) => {
      if (error) {
        console.error(error)
        return this.context.snackbar.error('batch-update-status-failure')
      }

      this.context.snackbar.show(`${contacts.length} ${contacts.length === 1 ? 'contact' : 'contacts'} marked as ${status}`, 'batch-update-status-success')
    })
  }

  onExportToCsv = () => {
    const {campaign} = this.props
    const {selections, selectionMode} = this.state
    const opts = {campaignSlug: campaign.slug}
    if (selectionMode === 'include') {
      opts.contactSlugs = selections.map(c => c.slug)
    }
    exportCampaignToCsv.call(opts, (error, res) => {
      if (error) {
        console.log(error)
        this.context.snackbar.error('export-campaign-to-csv-failure')
      } else {
        fileDownload(res.data, res.filename, 'text/csv')
        this.clearSelectionAndHideModals()
      }
    })
  }

  onAssignOwnerClick = (ownerUserRef) => {
    const {campaign} = this.props
    const {selections} = this.state
    const opts = {
      campaignSlug: campaign.slug,
      contactSlugs: selections.map(c => c.slug),
      ownerUserId: ownerUserRef._id
    }
    assignContactOwner.call(opts, (err) => {
      if (err) {
        console.log(err)
        this.context.snackbar.error('assign-contact-owner-failure')
      } else {
        this.clearSelection()
      }
    })
  }

  onSelectionModeChange = (selectionMode) => {
    this.setState({selectionMode})
  }

  onSortChange = (sort) => {
    this.props.setQuery({ sort })
  }

  onTermChange = (term) => {
    this.props.setQuery({ term })
  }

  onStatusFilterChange = (status) => {
    this.props.setQuery({ status })
  }

  onSelectionsChange = (selections) => {
    this.setState({ selections })
  }

  clearSelectionAndHideModals = () => {
    this.hideModals()
    this.clearSelection()
  }

  clearSelection = () => {
    this.setState({
      selections: [],
      selectionMode: 'include'
    })
  }

  showModal = (modal) => {
    this.hideModals()

    this.setState((s) => ({
      [modal]: true
    }))
  }

  hideModals = () => {
    this.setState({
      addContactModal: false,
      addContactsToCampaignModal: false,
      addTagsModal: false,
      addToMasterListsModal: false,
      removeContactsModal: false,
      mergeContactsModal: false
    })
  }

  autoRelease = compose(
    (data, diff, nextData) => {
      // Owner info is updated out of band i.e. does not effect updatedBy field
      // so just let these changes through.
      if (diff.total.updated) {
        const didUpdateOwners = diff.updated.some(updatedItem => {
          const item = data.find(item => item._id === updatedItem._id)
          const owners = item.owners || []
          const updatedOwners = updatedItem.owners || []

          return updatedOwners.length === owners.length
            ? owners.some((owner, i) => owner._id !== updatedOwners[i]._id)
            : true
        })

        if (didUpdateOwners) return true
      }
    },
    sortedAutoRelease,
    updatedByUserAutoRelease
  )

  render () {
    const {
      campaign,
      contacts,
      loading,
      location,
      contactsTotal,
      sort,
      term,
      status,
      statusCounts,
      contactsAllCount
    } = this.props

    const {
      selections,
      selectionMode,
      addContactModal
    } = this.state

    if (!campaign) {
      return <LoadingBar />
    }

    if (loading) {
      return (
        <div>
          <CampaignTopbar campaign={campaign} onAddContactClick={this.onAddContactClick} />
          <LoadingBar />
        </div>
      )
    }

    let contactSearch = null
    if (selectionMode === 'all') {
      contactSearch = {
        campaignSlugs: [campaign.slug]
      }
    }

    const highlightSlug = location.state && location.state.highlightContactSlug

    return (
      <DataDam data={contacts} autoRelease={this.autoRelease}>
        {(contacts, diff, release) => (
          <div style={{paddingBottom: 100}}>
            <CampaignTopbar campaign={campaign} onAddContactClick={this.onAddContactClick} />
            <CampaignSummary campaign={campaign} contacts={contacts} statusFilter={status} onStatusClick={this.onStatusFilterChange} statusCounts={statusCounts} />
            <div className='bg-white shadow-2 m4' data-id='contacts-table'>
              <div className='pt4 pl4 pr4 pb1 items-center'>
                <SearchBox initialTerm={term} onTermChange={this.onTermChange} placeholder='Search contacts...' data-id='search-contacts-input' style={{zIndex: 1}} />
                <div className='f-xs gray60' style={{position: 'relative', top: -35, right: 20, textAlign: 'right', zIndex: 0}}>{contactsTotal} contact{contactsTotal === 1 ? '' : 's'}</div>
              </div>
              <ContactsTable
                sort={sort}
                term={term}
                campaign={campaign}
                contacts={contacts}
                selections={selections}
                selectionMode={selectionMode}
                statusFilter={status}
                onSortChange={this.onSortChange}
                onSelectionsChange={this.onSelectionsChange}
                onSelectionModeChange={this.onSelectionModeChange}
                searchTermActive={Boolean(term)}
                onContactClick={this.onContactClick}
                highlightSlug={highlightSlug}
              />
            </div>
            <ContactsActionsToast
              campaign={campaign}
              contacts={selections}
              contactsCount={selections.length}
              onCampaignClick={() => this.showModal('addContactsToCampaignModal')}
              onSectorClick={() => this.showModal('addToMasterListsModal')}
              onFavouriteClick={this.onFavouriteAll}
              onTagClick={() => this.showModal('addTagsModal')}
              onStatusClick={this.onBatchUpdateStatus}
              onDeleteClick={() => this.showModal('removeContactsModal')}
              onDeselectAllClick={this.clearSelection}
              onExportToCsvClick={this.onExportToCsv}
              onMergeClick={() => this.showModal('mergeContactsModal')}
              onAssignOwnerClick={this.onAssignOwnerClick} />
            <AddOrCreateContactModal
              open={addContactModal}
              onDismiss={this.hideModals}
              campaign={campaign}
              campaignContacts={contacts}
              allContactsCount={contactsAllCount} />
            <AddContactsToCampaign
              title='Add these Contacts to a Campaign'
              contacts={selections}
              contactsCount={selections.length}
              contactSearch={contactSearch}
              selectionMode={selectionMode}
              onDismiss={this.hideModals}
              open={this.state.addContactsToCampaignModal} />
            <AddTagsModal
              title='Tag these Contacts'
              type='Contacts'
              open={this.state.addTagsModal}
              onDismiss={this.hideModals}
              onUpdateTags={this.onTagAll}>
              <AbbreviatedAvatarList items={selections} maxTooltip={12} />
            </AddTagsModal>
            <AddToMasterListModal
              type='Contacts'
              items={this.state.selections}
              open={this.state.addToMasterListsModal}
              onDismiss={this.hideModals}
              onSave={(masterLists) => this.onAddAllToMasterLists(masterLists)}>
              <AbbreviatedAvatarList items={selections} maxTooltip={12} />
            </AddToMasterListModal>
            <RemoveContactModal
              open={this.state.removeContactsModal}
              onDismiss={this.hideModals}
              onDelete={this.clearSelectionAndHideModals}
              campaigns={[campaign]}
              contacts={this.state.selections}
              avatars={this.state.selections} />
            <MergeContactsModal
              contacts={this.state.selections}
              open={this.state.mergeContactsModal}
              onDismiss={this.hideModals}
              onMerged={this.clearSelectionAndHideModals} />
            <ShowUpdatesButton data={contacts} diff={diff} onClick={release} />
          </div>
        )}
      </DataDam>
    )
  }
}

CampaignContactsPage.propTypes = {
  campaign: PropTypes.object,
  contacts: PropTypes.array.isRequired,
  contactsAllCount: PropTypes.number.isRequired
}

CampaignContactsPage.contextTypes = {
  snackbar: PropTypes.object
}

// I decode and encode the search options from the query string
// and set up the subscriptions and collecton queries from those options.
const CampaignContactsPageContainer = (props, context) => {
  // API is like setState...
  // Pass an obj with the new params you want to set on the query string.
  // has to be in a container because createComponent does not give you access to context
  const setQuery = (opts) => {
    const { location } = props
    const { router } = context
    const newQuery = {}

    if (opts.sort) {
      try {
        newQuery.sort = JSON.stringify(opts.sort)
      } catch (error) {
        console.warn(error)
      }
    }

    if (opts.hasOwnProperty('term')) {
      newQuery.q = opts.term
    }

    if (opts.hasOwnProperty('status')) {
      newQuery.status = opts.status
    }

    const query = Object.assign({}, location.query, newQuery)

    if (query.q === '') {
      delete query.q
    }

    if (opts.status === null) {
      delete query.status
    }

    const qs = querystring.stringify(query)

    if (!qs) {
      return router.replace(`/campaign/${props.campaign.slug}/contacts`)
    }

    router.replace(`/campaign/${props.campaign.slug}/contacts?${qs}`)
  }

  return (
    <NearBottomContainer>
      {(nearBottom) => (
        <SubscriptionLimitContainer wantMore={nearBottom}>
          {(limit) => (
            <CampaignContactsPage
              limit={limit}
              {...props}
              setQuery={setQuery} />
          )}
        </SubscriptionLimitContainer>
      )}
    </NearBottomContainer>
  )
}
CampaignContactsPageContainer.contextTypes = {
  router: PropTypes.object
}

const parseQuery = ({ query }) => {
  let sort = {
    updatedAt: -1
  }

  if (query.sort) {
    try {
      sort = JSON.parse(query.sort)
    } catch (error) {
      console.warn(error)
    }
  }

  const term = (query.q || '').trim()
  const status = (query.status || '').trim()

  return {
    sort,
    term,
    status
  }
}

// returns a sort compator fn or mongo sort specifier
const getCustomSortSpec = (sort) => {
  if (sort.status) {
    const dir = sort.status
    return (a, b) => {
      return (StatusIndex[a.status] - StatusIndex[b.status]) * dir
    }
  }
  // Use collation Sort if is a text field
  const nonTextFields = ['updatedAt']
  const sortKey = Object.keys(sort)[0]
  if (nonTextFields.indexOf(sortKey) === -1) {
    return collationSort(sort)
  }
  return sort
}

export default createContainer(({location, params: { campaignSlug }}) => {
  const subs = [
    Meteor.subscribe('campaign', campaignSlug),
    Meteor.subscribe('campaign-contacts', campaignSlug),
    Meteor.subscribe('campaign-contact-statuses', campaignSlug),
    Meteor.subscribe('contactCount')
  ]
  const loading = subs.some((s) => !s.ready())

  const {
    sort,
    term,
    status
  } = parseQuery(location)

  const query = {
    campaign: campaignSlug
  }

  if (status && StatusIndex[status] > -1) {
    query.status = status
  }

  if (term && term.length >= minSearchLength) {
    const termRegExp = new RegExp(escapeRegExp(term), 'gi')

    query.$or = [{
      name: termRegExp
    }, {
      'outlets.value': termRegExp
    }, {
      'outlets.label': termRegExp
    }]
  }

  const sortSpec = getCustomSortSpec(sort)
  const cursor = CampaignContacts.find(query, {sort: sortSpec})
  const contacts = cursor.fetch()
  const contactsCount = cursor.count()
  const statusCounts = CampaignContactStatuses.find().fetch().pop()
  const campaign = Campaigns.findOne({
    slug: campaignSlug
  })

  return {
    loading,
    campaign,
    contacts: contacts,
    contactsTotal: contactsCount,
    contactsAllCount: Contacts.allContactsCount(),
    sort,
    term,
    status,
    statusCounts
  }
}, CampaignContactsPageContainer)
