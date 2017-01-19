import React, { PropTypes } from 'react'
import { withRouter } from 'react-router'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import CampaignTopbar from './campaign-topbar'
import CampaignInfo from './campaign-info'
import CampaignContactList from './campaign-contact-list'
import PostBox from './campaign-postbox'
import ActivityFeed from '../dashboard/activity-feed'
import EditCampaign from './edit-campaign'
import Clients from '/imports/api/clients/clients'
import Medialists from '/imports/api/medialists/medialists'
import AddContact from '../contacts/edit-contact'
import AddCampaignContact from './add-contact'

const CampaignActivityPage = React.createClass({
  propTypes: {
    router: PropTypes.object,
    loading: PropTypes.bool,
    campaign: PropTypes.object,
    user: PropTypes.object,
    contacts: PropTypes.array,
    contactsAll: PropTypes.array,
    contactsCount: PropTypes.number
  },

  getInitialState () {
    return {
      addContactModalOpen: false,
      addCampaignContactModalOpen: false,
      editModalOpen: false
    }
  },

  onAddContactClick () {
    const { contactsAll } = this.props

    if (contactsAll && contactsAll.length) {
      const addCampaignContactModalOpen = !this.state.addCampaignContactModalOpen
      this.setState({ addCampaignContactModalOpen })
    } else {
      const addContactModalOpen = !this.state.addContactModalOpen
      this.setState({ addContactModalOpen })
    }
  },

  onAddContactModalDismiss () {
    this.setState({ addContactModalOpen: false })
  },

  onAddCampaignContactModalDismiss () {
    this.setState({ addCampaignContactModalOpen: false })
  },

  toggleEditModal () {
    const editModalOpen = !this.state.editModalOpen
    this.setState({ editModalOpen })
  },

  onFeedback ({message, contact, status}, cb) {
    const post = {
      contactSlug: contact.slug,
      medialistSlug: this.props.campaign.slug,
      message,
      status
    }
    Meteor.call('posts/create', post, cb)
  },

  onCoverage ({message, contact}, cb) {
    const post = {
      medialistSlug: this.props.campaign.slug,
      contactSlug: contact.slug,
      message
    }
    Meteor.call('posts/createCoverage', post, cb)
  },

  render () {
    const {
      onAddContactClick,
      onAddContactModalDismiss,
      onAddCampaignContactModalDismiss,
      toggleEditModal,
      onFeedback,
      onCoverage
    } = this
    const { campaign, contacts, contactsCount, clients, contactsAll, user } = this.props
    const {
      addContactModalOpen,
      addCampaignContactModalOpen,
      editModalOpen
    } = this.state

    if (!campaign) return null

    return (
      <div>
        <CampaignTopbar campaign={campaign} onAddContactClick={onAddContactClick} />
        <div className='flex m4 pt4 pl4'>
          <div className='flex-none mr4 xs-hide sm-hide' style={{width: 323}}>
            <CampaignInfo campaign={campaign} onEditClick={toggleEditModal} user={user} />
            <EditCampaign campaign={campaign} open={editModalOpen} onDismiss={toggleEditModal} clients={clients} />
          </div>
          <div className='flex-auto px2' >
            <PostBox campaign={campaign} contacts={contacts} onFeedback={onFeedback} onCoverage={onCoverage} />
            <ActivityFeed campaign={campaign} />
          </div>
          <div className='flex-none xs-hide sm-hide pl4' style={{width: 323}}>
            <CampaignContactList contacts={contacts} contactsAll={contactsAll} contactsCount={contactsCount} campaign={campaign} onAddContactClick={onAddContactClick} />
          </div>
        </div>
        <AddContact
          open={addContactModalOpen}
          onDismiss={onAddContactModalDismiss}
          campaign={campaign} />
        <AddCampaignContact
          open={addCampaignContactModalOpen}
          onDismiss={onAddCampaignContactModalDismiss}
          contacts={contacts}
          contactsAll={contactsAll}
          campaign={campaign} />
      </div>
    )
  }
})

export default createContainer((props) => {
  const { campaignSlug } = props.params

  const subs = [
    Meteor.subscribe('medialist', campaignSlug),
    Meteor.subscribe('contacts'),
    Meteor.subscribe('clients')
  ]
  const loading = subs.some((s) => !s.ready())

  return {
    ...props,
    loading,
    campaign: Medialists.findOne({ slug: campaignSlug }),
    // TODO: need to be able to sort contacts by recently updated with respect to the campaign.
    contacts: window.Contacts.find({medialists: campaignSlug}, {limit: 7, sort: {updatedAt: -1}}).fetch(),
    contactsCount: window.Contacts.find({medialists: campaignSlug}).count(),
    contactsAll: window.Contacts.find({}, {sort: {name: 1}}).fetch(),
    user: Meteor.user(),
    clients: Clients.find({}).fetch()
  }
}, withRouter(CampaignActivityPage))
