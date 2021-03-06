import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import '/imports/api/campaigns/methods'
import Campaigns from '/imports/api/campaigns/campaigns'

Meteor.methods({
  'campaigns/toggle-favourite': function (campaignSlug) {
    if (!this.userId) {
      throw new Meteor.Error('Only a logged-in user can (un)favourite a campaign')
    }

    const user = Meteor.users.findOne(this.userId, { fields: { myCampaigns: 1 } })
    check(campaignSlug, String)
    const campaignRef = Campaigns.findOneRef(campaignSlug)

    if (!campaignRef) {
      throw new Meteor.Error('Cannot find campaign')
    }

    if (user.myCampaigns.some((m) => m._id === campaignRef._id)) {
      Meteor.users.update(this.userId, {
        $pull: {
          myCampaigns: {
            _id: campaignRef._id
          }
        }
      })

      return false
    }

    Meteor.users.update(this.userId, {
      $push: {
        myCampaigns: campaignRef
      }
    })

    return true
  }
})
