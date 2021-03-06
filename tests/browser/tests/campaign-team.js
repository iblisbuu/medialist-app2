'use strict'

const faker = require('faker')

const test = {
  '@tags': ['campaign-team'],

  beforeEach: function (t) {
    this.user = t.page.authenticate()
      .register()
  },

  'Should add only suggest team members': function (t) {
    t.createDomain(['user', 'user', 'campaign'], (user1, user2, campaign, done) => {
      t.perform((done) => {
        // user2 is a support user, it shouldn't appear in the edit team modal
        t.db.connection.collection('users').update({
          _id: user2._id
        }, {
          $set: {
            'profile.name': 'TEST SUPPORT',
            roles: ['support']
          }
        }, (err) => {
          if (err) throw err
          done()
        })
      })

      const campaignPage = t.page.campaign().navigate(campaign)

      campaignPage
        .editTeam()

      // ensure user2 isn't in the initial suggestions or in the search results
      campaignPage.section.editTeamMembersForm
        .waitForElementVisible('[data-id=team-mates-table-unfiltered]')
        .assert.elementNotPresent(`[data-id=${user2._id}]`)
        .clear('@searchInput')
        .setValue('@searchInput', 'TEST SUPPORT')
        .waitForElementVisible('[data-id=team-mates-table-search-results],[data-id=team-mates-table-empty]')
        .assert.elementNotPresent(`[data-id=${user2._id}]`)

      // ensure user1 is in the search results
      campaignPage.section.editTeamMembersForm
        .clear('@searchInput')
        .setValue('@searchInput', user1.profile.name)
        .waitForElementVisible('@searchResults')
        .assert.elementPresent(`[data-id=${user1._id}]`)

      campaignPage
        .cancelTeamEdit()

      done()
    })
    t.page.main().logout()
    t.end()
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
        .catch(error => {
          throw error
        })
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should add team members to a campaign by email address': function (t) {
    t.createDomain(['campaign'], (campaign, done) => {
      const campaignPage = t.page.campaign()
        .navigate(campaign)

      campaignPage
        .editTeam()
        .addToTeamByEmail(faker.internet.email(null, null, 'test.medialist.io'))
        .saveTeamEdit()

      t.page.main().waitForSnackbarMessage('campaign-team-update-success')

      t.perform((done) => {
        t.db.findCampaign({
          _id: campaign._id
        })
        .then((doc) => {
          t.assert.equal(doc.team.length, 2)

          done()
        })
        .catch(error => {
          throw error
        })
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should arrive at campaign after following invitation link': function (t) {
    const email = faker.internet.email(null, null, 'test.medialist.io')
    const name = faker.name.findName()

    t.createDomain(['campaign'], (campaign, done) => {
      t.perform((done) => {
        t.createCampaignInvitationLink(email, campaign, (link) => {
          t.page.main().logout()

          t.url(link)

          t.page.onboarding()
            .onboard(name)

          t.assert.urlEquals(`${t.launch_url}/campaign/${campaign.slug}`)

          done()
        })
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should remove team members from a campaign': function (t) {
    t.createDomain(['user', 'user', 'user', 'campaign'], (user1, user2, user3, campaign, done) => {
      t.perform((done) => {
        t.addTeamMembersToCampaign([user1, user2, user3], campaign, () => done())
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
          t.assert.equal(doc.team[0]._id, user3._id)

          done()
        })
        .catch(error => {
          throw error
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
          t.assert.equal(doc.team.length, 2)
          t.assert.equal(doc.team.find(member => member._id === user1._id)._id, user1._id)
          t.assert.equal(doc.team.find(member => member._id === user2._id)._id, user2._id)

          done()
        })
        .catch(error => {
          throw error
        })
      })

      done()
    })

    t.page.main().logout()
    t.end()
  }
}

module.exports = test
