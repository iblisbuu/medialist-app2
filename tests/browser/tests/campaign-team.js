'use strict'

const test = {
  '@tags': ['campaign-team'],

  beforeEach: function (t) {
    t.resizeWindow(1440, 1024)

    t.page.authenticate()
      .register()
  },

  'Should add team members to a campaign': function (t) {
    t.createDomain(['user', 'user', 'campaign'], (user1, user2, campaign, done) => {
      const campaignPage = t.page.campaign()
        .navigate(campaign)

      campaignPage
        .editTeam()
        .addToTeam(user1)
        .addToTeam(user2)
        .saveTeamEdit()

      t.page.main().waitForSnackbarMessage('campaign-team-update-success')

      t.perform((done) => {
        t.db.findCampaign({
          _id: campaign._id
        })
        .then((doc) => {
          t.assert.equal(doc.team.length, 3)
          t.assert.equal(doc.team.find(member => member._id === user1._id)._id, user1._id)
          t.assert.equal(doc.team.find(member => member._id === user2._id)._id, user2._id)

          done()
        })
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should remove team members from a campaign': function (t) {
    t.createDomain(['user', 'user', 'campaign'], (user1, user2, campaign, done) => {
      t.perform((done) => {
        t.addTeamMembersToCampaign([user1, user2], campaign, () => done())
      })

      const campaignPage = t.page.campaign()
        .navigate(campaign)

      campaignPage
        .editTeam()
        .removeFromTeam(user1)
        .removeFromTeam(user2)
        .saveTeamEdit()

      t.page.main().waitForSnackbarMessage('campaign-team-update-success')

      t.perform((done) => {
        t.db.findCampaign({
          _id: campaign._id
        })
        .then((doc) => {
          t.assert.equal(doc.team.length, 1)
          t.assert.notEqual(doc.team[0]._id, user1._id)
          t.assert.notEqual(doc.team[0]._id, user2._id)

          done()
        })
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should cancel removing team members from a campaign': function (t) {
    t.createDomain(['user', 'user', 'campaign'], (user1, user2, campaign, done) => {
      t.perform((done) => {
        t.addTeamMembersToCampaign([user1, user2], campaign, () => done())
      })

      const campaignPage = t.page.campaign()
        .navigate(campaign)

      campaignPage
        .editTeam()
        .removeFromTeam(user1)
        .removeFromTeam(user2)
        .cancelTeamEdit()

      t.perform((done) => {
        t.db.findCampaign({
          _id: campaign._id
        })
        .then((doc) => {
          t.assert.equal(doc.team.length, 3)
          t.assert.equal(doc.team.find(member => member._id === user1._id)._id, user1._id)
          t.assert.equal(doc.team.find(member => member._id === user2._id)._id, user2._id)

          done()
        })
      })

      done()
    })

    t.page.main().logout()
    t.end()
  }
}

module.exports = test