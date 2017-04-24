import React, { PropTypes } from 'react'
import { withRouter } from 'react-router'
import { Meteor } from 'meteor/meteor'
import { createFeedbackPost, createCoveragePost, createNeedToKnowPost } from '/imports/api/posts/methods'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/campaigns/campaigns'
import MasterLists from '/imports/api/master-lists/master-lists'
import Posts from '/imports/api/posts/posts'
import { createContainer } from 'meteor/react-meteor-data'
import ContactTopbar from './contact-topbar'
import ContactInfo from './contact-info'
import ContactNeedToKnowList from './contact-need-to-know-list'
import PostBox from '../feedback/post-box'
import ActivityFeed from '../dashboard/activity-feed'
import { EditContactModal } from './edit-contact'
import AddContactsToCampaigns from './add-contacts-to-campaign'
import withSnackbar from '../snackbar/with-snackbar'

const ContactPage = withSnackbar(React.createClass({
  propTypes: {
    router: PropTypes.object,
    campaigns: PropTypes.array,
    contact: PropTypes.object,
    campaign: PropTypes.object,
    user: PropTypes.object,
    masterlists: PropTypes.array,
    needToKnows: PropTypes.array,
    loading: PropTypes.bool.isRequired,
    snackbar: PropTypes.object.isRequired
  },

  getInitialState () {
    return {
      editContactModalOpen: false,
      addToCampaignOpen: false
    }
  },

  componentDidMount () {
    const { location: { pathname, query }, router } = this.props
    if (query && query.editContactModalOpen) {
      this.setState({ editContactModalOpen: true })
      router.replace(pathname)
    }
  },

  toggleEditContactModal () {
    this.setState((s) => ({ editContactModalOpen: !s.editContactModalOpen }))
  },

  toggleAddToCampaign () {
    this.setState((s) => ({ addToCampaignOpen: !s.addToCampaignOpen }))
  },

  onFeedback ({message, campaign, status}, cb) {
    const contactSlug = this.props.contact.slug
    const campaignSlug = campaign.slug
    createFeedbackPost.call({contactSlug, campaignSlug, message, status}, cb)
  },

  onCoverage ({message, campaign, status}, cb) {
    const contactSlug = this.props.contact.slug
    const campaignSlug = campaign.slug
    createCoveragePost.call({contactSlug, campaignSlug, message, status}, cb)
  },

  onNeedToKnow ({message}, cb) {
    const contactSlug = this.props.contact.slug
    createNeedToKnowPost.call({contactSlug, message}, cb)
  },

  render () {
    const { contact, campaigns, campaign, user, masterlists, needToKnows, loading } = this.props
    const { editContactModalOpen, addToCampaignOpen } = this.state
    if (!contact) return null
    return (
      <div>
        <ContactTopbar contact={contact} onAddToCampaignClick={this.toggleAddToCampaign} />
        <div className='flex m4 pt4 pl4'>
          <div className='flex-none mr4 xs-hide sm-hide' style={{width: 323}}>
            <ContactInfo
              campaigns={campaigns}
              contact={contact}
              user={user}
              masterlists={masterlists}
              onEditClick={this.toggleEditContactModal}
              onAddToCampaignClick={this.toggleAddToCampaign}
            />
          </div>
          <div className='flex-auto px2' >
            <PostBox
              loading={loading}
              contact={contact}
              campaigns={campaigns}
              campaign={campaign}
              onFeedback={this.onFeedback}
              onCoverage={this.onCoverage}
              onNeedToKnow={this.onNeedToKnow}
            />
            <ActivityFeed data-id='contact-activity-feed' contact={contact} />
          </div>
          <div className='flex-none xs-hide sm-hide pl4' style={{width: 323}}>
            <ContactNeedToKnowList items={needToKnows} />
          </div>
        </div>
        <EditContactModal
          open={editContactModalOpen}
          onDismiss={this.toggleEditContactModal}
          contact={contact} />
        <AddContactsToCampaigns
          title={`Add ${contact.name.split(' ')[0]} to a Campaign`}
          onDismiss={this.toggleAddToCampaign}
          open={addToCampaignOpen}
          contacts={[contact]} />
      </div>
    )
  }
}))

export default createContainer((props) => {
  const { contactSlug, campaignSlug } = props.params
  const subs = [
    Meteor.subscribe('contact-page', contactSlug),
    Meteor.subscribe('need-to-knows', {
      contact: contactSlug
    })
  ]
  const user = Meteor.user()
  const contact = Contacts.findOne({ slug: contactSlug })
  const campaign = Campaigns.findOne({ slug: campaignSlug })
  const campaigns = contact ? Campaigns.find({ slug: { $in: contact.campaigns } }).fetch() : []
  const masterlists = MasterLists.find({type: 'Contacts'}).fetch()
  const needToKnows = Posts.find(
    { type: 'NeedToKnowPost', 'contacts.slug': contactSlug },
    { sort: { createdAt: -1 } }
  ).fetch()
  const loading = subs.some((s) => !s.ready())
  return { ...props, contact, campaigns, campaign, user, masterlists, needToKnows, loading }
}, withRouter(ContactPage))
