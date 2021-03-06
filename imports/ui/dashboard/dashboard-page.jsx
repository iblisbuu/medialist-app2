import React from 'react'
import PropTypes from 'prop-types'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import RecentCampaignsList from '/imports/ui/dashboard/recent-campaigns-list'
import RecentContactsList from '/imports/ui/dashboard/recent-contacts-list'
import ActivityFeed from '/imports/ui/dashboard/activity-feed'

const DashboardPage = React.createClass({
  propTypes: {
    recentCampaigns: PropTypes.array,
    recentContacts: PropTypes.array
  },

  render () {
    const { recentCampaigns, recentContacts } = this.props
    return (
      <div className='flex max-width-lg mx-auto my4 py1'>
        <div className='flex-none mr4 xs-hide sm-hide' style={{width: 323}}>
          <RecentCampaignsList campaigns={recentCampaigns} />
          <RecentContactsList contacts={recentContacts} />
        </div>
        <div className='flex-auto px2 py1'>
          <ActivityFeed data-id='dashboard-activity-feed' />
        </div>
      </div>
    )
  }
})

export default createContainer(() => {
  return {
    recentCampaigns: Meteor.user().myCampaigns.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3),
    recentContacts: Meteor.user().myContacts.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5)
  }
}, DashboardPage)
