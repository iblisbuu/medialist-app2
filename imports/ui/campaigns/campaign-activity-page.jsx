import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import CampaignTopbar from '/imports/ui/campaigns/campaign-topbar'
import CampaignInfo from '/imports/ui/campaigns/campaign-info'
import CampaignContactList from '/imports/ui/campaigns/campaign-contact-list'
import CampaignPostBox from '/imports/ui/campaigns/campaign-postbox'
import ActivityFeed from '/imports/ui/dashboard/activity-feed'
import { EditCampaignModal } from '/imports/ui/campaigns/edit-campaign'
import Clients from '/imports/api/clients/clients'
import Campaigns from '/imports/api/campaigns/campaigns'
import Contacts from '/imports/api/contacts/contacts'
import MasterLists from '/imports/api/master-lists/master-lists'
import { createFeedbackPost, createCoveragePost } from '/imports/api/posts/methods'
import { CreateContactModal } from '/imports/ui/contacts/edit-contact'
import AddContact from '/imports/ui/campaigns/add-contact'
import EditTeam from '/imports/ui/campaigns/edit-team'
import { CampaignContacts } from '/imports/ui/campaigns/collections'
import Loading from '/imports/ui/lists/loading'

const CampaignActivityPage = React.createClass({
  propTypes: {
    router: PropTypes.object,
    loading: PropTypes.bool,
    campaign: PropTypes.object,
    user: PropTypes.object,
    contacts: PropTypes.array,
    contactsCount: PropTypes.number,
    contactsAllCount: PropTypes.number
  },

  getInitialState () {
    return {
      createContactModalOpen: false,
      addContactModalOpen: false,
      editModalOpen: false,
      contactPrefillData: null,
      editTeamModalOpen: false
    }
  },

  onAddContactClick () {
    const { contactsAllCount } = this.props

    if (contactsAllCount) {
      const addContactModalOpen = !this.state.addContactModalOpen
      this.setState({ addContactModalOpen })
    } else {
      const createContactModalOpen = !this.state.createContactModalOpen
      this.setState({ createContactModalOpen })
    }
  },

  onCreateContactModalDismiss () {
    this.setState({
      createContactModalOpen: false,
      contactPrefillData: null,
      addContactModalOpen: true
    })
  },

  onAddContactModalDismiss () {
    this.setState({
      addContactModalOpen: false
    })
  },

  toggleEditModal () {
    const editModalOpen = !this.state.editModalOpen
    this.setState({ editModalOpen })
  },

  toggleEditTeamModal () {
    const editTeamModalOpen = !this.state.editTeamModalOpen
    this.setState({ editTeamModalOpen })
  },

  onFeedback ({message, contact, status}, cb) {
    const campaignSlug = this.props.campaign.slug
    const contactSlug = contact.slug

    createFeedbackPost.call({contactSlug, campaignSlug, message, status}, cb)
  },

  onCoverage ({message, contact, status}, cb) {
    const campaignSlug = this.props.campaign.slug
    const contactSlug = contact.slug

    createCoveragePost.call({contactSlug, campaignSlug, message, status}, cb)
  },

  onShowCreateContact (data) {
    this.setState({
      addContactModalOpen: false,
      createContactModalOpen: true,
      contactPrefillData: data
    })
  },

  render () {
    const {
      onAddContactClick,
      onCreateContactModalDismiss,
      onAddContactModalDismiss,
      toggleEditModal,
      toggleEditTeamModal,
      onFeedback,
      onCoverage,
      onShowCreateContact
    } = this
    const { campaign, contacts, contactsCount, teamMates, loading, user } = this.props
    const {
      createContactModalOpen,
      addContactModalOpen,
      editModalOpen,
      editTeamModalOpen,
      contactPrefillData
    } = this.state

    if (loading) {
      return <div className='center p4'><Loading /></div>
    }

    return (
      <div>
        <CampaignTopbar campaign={campaign} onAddContactClick={onAddContactClick} />
        <div className='flex m4 pt4 pl4'>
          <div className='flex-none mr4 xs-hide sm-hide' style={{width: 323}}>
            <CampaignInfo
              campaign={campaign}
              onEditClick={toggleEditModal}
              onEditTeamClick={toggleEditTeamModal}
              user={user} />
            <EditCampaignModal
              campaign={campaign}
              open={editModalOpen}
              onDismiss={toggleEditModal} />
            <EditTeam
              campaign={campaign}
              open={editTeamModalOpen}
              onDismiss={toggleEditTeamModal}
              teamMates={teamMates}
              loading={loading} />
          </div>
          <div className='flex-auto px2' >
            <CampaignPostBox
              campaign={campaign}
              contacts={contacts}
              onFeedback={onFeedback}
              onCoverage={onCoverage} />
            <ActivityFeed data-id='campaign-activity-feed' campaign={campaign} contacts={contacts} />
          </div>
          <div className='flex-none xs-hide sm-hide pl4' style={{width: 323}}>
            <CampaignContactList contacts={contacts.slice(0, 7)} contactsCount={contactsCount} campaign={campaign} onAddContactClick={onAddContactClick} />
          </div>
        </div>
        <CreateContactModal
          open={createContactModalOpen}
          onDismiss={onCreateContactModalDismiss}
          prefill={contactPrefillData} />
        <AddContact
          open={addContactModalOpen}
          onDismiss={onAddContactModalDismiss}
          onCreate={onShowCreateContact}
          campaign={campaign}
          campaignContacts={contacts} />
      </div>
    )
  }
})

export default createContainer((props) => {
  const { campaignSlug } = props.params

  const subs = [
    Meteor.subscribe('campaign', campaignSlug),
    Meteor.subscribe('campaign-contacts', campaignSlug),
    Meteor.subscribe('contactCount'),
    Meteor.subscribe('clients')
  ]
  const loading = subs.some((s) => !s.ready())
  const campaign = Campaigns.findOne({
    slug: campaignSlug
  })

  const cursor = CampaignContacts.find({
    campaign: campaignSlug
  }, {
    sort: {
      updatedAt: -1
    }
  })

  return {
    ...props,
    loading,
    campaign,
    contacts: cursor.fetch(),
    contactsCount: cursor.count(),
    contactsAllCount: Contacts.allContactsCount(),
    teamMates: (campaign && campaign.team) || [],
    user: Meteor.user(),
    clients: Clients.find({}).fetch(),
    masterlists: MasterLists.find({type: 'Campaigns'}).fetch()
  }
}, withRouter(CampaignActivityPage))
