'use strict'

const faker = require('faker')

const test = {
  '@tags': ['contact-campaigns'],

  beforeEach: function (t) {
    this.user = t.page.authenticate()
      .register()
  },

  'Should search for campaigns': function (t) {
    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      const contactCampaignsPage = t.page.contactCampaigns()
        .navigateToCampaignList(contact)

      contactCampaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .clickRow(0)

      t.assert.urlEquals(`${t.launch_url}/campaign/${campaign.slug}`)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should view campaign contacts from toast menu': function (t) {
    t.createDomain(['campaign', 'contact', 'contact', 'contact'], (campaign, contact1, contact2, contact3, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact1, contact2], campaign, () => done())
      })

      const contactCampaignsPage = t.page.contactCampaigns()
        .navigateToCampaignList(contact1)

      contactCampaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .selectRow(0)

      contactCampaignsPage.section.toast.viewContacts()

      t.assert.urlEquals(`${t.launch_url}/contacts?campaign=${campaign.slug}`)

      t.page.contacts()
        .section.contactTable.isInResults(contact1)

      t.page.contacts()
        .section.contactTable.isInResults(contact2)

      t.page.contacts()
        .section.contactTable.isNotInResults(contact3)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should add to campaign list from toast menu': function (t) {
    t.createDomain(['campaignList', 'campaign', 'contact'], (campaignList, campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      const contactCampaignsPage = t.page.contactCampaigns()
        .navigateToCampaignList(contact)

      contactCampaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .selectRow(0)

      contactCampaignsPage.section.toast.openAddToCampaignListsModal()
      contactCampaignsPage.section.campaignListsModal
        .selectList(campaignList)
        .save()

      t.page.main().waitForSnackbarMessage('campaigns-batch-add-to-campaign-list-success')

      const campaignsPage = t.page.campaigns()
        .navigate()

      campaignsPage
        .navigateToCampaignList(campaignList)

      campaignsPage.section.campaignTable
        .assertInSearchResults(campaign)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should favourite campaigns from toast menu': function (t) {
    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      const contactCampaignsPage = t.page.contactCampaigns()
        .navigateToCampaignList(contact)

      contactCampaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .selectRow(0)

      contactCampaignsPage.section.toast.favouriteCampaigns()

      t.page.main().waitForSnackbarMessage('campaigns-batch-favourite-success')

      const campaignsPage = t.page.campaigns()
        .navigateToMyCampaigns()

      campaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .assertInSearchResults(campaign)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should add tags to campaigns from toast menu': function (t) {
    const tag = `${faker.hacker.noun()}-${faker.hacker.noun()}-${faker.hacker.noun()}`.toLowerCase().replace(/[^a-z0-9_-]/g, '')

    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      const contactCampaignsPage = t.page.contactCampaigns()
        .navigateToCampaignList(contact)

      contactCampaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .selectRow(0)

      contactCampaignsPage.section.toast.openAddTagsToCampaignModal()

      contactCampaignsPage.section.tagSelectorModal
        .addTag(tag)
        .save()

      t.page.main().waitForSnackbarMessage('campaigns-batch-tag-success')

      const campaignsPage = t.page.campaigns()
        .navigateToTag(tag)

      campaignsPage.section.campaignTable
        .assertInSearchResults(campaign)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should remove contact from campaigns from toast menu': function (t) {
    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      const contactCampaignsPage = t.page.contactCampaigns()
        .navigateToCampaignList(contact)

      contactCampaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .selectRow(0)

      contactCampaignsPage.section.toast.openRemoveContactsFRomCampaignsModal()

      contactCampaignsPage.section.removeContactsFromCampaignsModal
        .confirm()

      t.page.main().waitForSnackbarMessage('batch-remove-contacts-from-campaign-success')

      contactCampaignsPage.section.campaignTable
        .assertNoResults()
        .assertNotInSearchResults(campaign)

      t.perform((done) => {
        t.db.findContacts({
          campaigns: campaign.slug
        })
        .then((docs) => {
          t.assert.equal(docs.length, 0)

          done()
        })
        .catch(error => {
          throw error
        })
      })

      t.perform((done) => {
        t.db.findCampaign({
          _id: campaign._id
        })
        .then((doc) => {
          t.assert.equal(doc.contacts[contact._id], undefined)

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

  'Should update the status of a contact': function (t) {
    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      t.perform((done) => {
        const contactCampaignsPage = t.page.contactCampaigns()
          .navigateToCampaignList(contact)

        contactCampaignsPage.section.campaignTable
          .searchFor(campaign.name)
          .updateStatus(campaign, 'hot-lead')

        t.perform((done) => {
          t.db.findCampaign({
            slug: campaign.slug
          })
          .then((doc) => {
            t.assert.equal(doc.contacts.find(c => c.slug === contact.slug).status, 'Hot Lead')

            done()
          })
          .catch(error => {
            throw error
          })
        })

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should retain search query in search box after page refresh': function (t) {
    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      const contactCampaignsPage = t.page.contactCampaigns()
        .navigateToCampaignList(contact)

      contactCampaignsPage.section.campaignTable
        .searchFor(campaign.name)

      t.refresh()

      contactCampaignsPage.section.campaignTable
        .waitForElementVisible('@searchInput')
        .assert.value('@searchInput', campaign.name)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should display show updates button': function (t) {
    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      t.page.main()
        .logout()

      // Login with a new user
      this.user = t.page.authenticate()
        .register()

      const contactCampaignsPage = t.page.contactCampaigns()
        .navigateToCampaignList(contact)

      // ReactiveAggregate is reactive for the collection you're aggregating
      // over, but is not reactive over documents you obtain via $lookup.
      // The contact-campaigns publication almost exclusively uses fields from
      // Campaigns, so we alter a campaign field and then alter the updatedAt
      // field on the contact so the subscription picks up the change.
      t.perform((done) => {
        t.db.connection
          .collection('campaigns')
          .update(
            {slug: campaign.slug},
            {$set: {name: `TEST${Date.now()}`}},
            done
          )
      })

      t.perform((done) => {
        t.db.connection
          .collection('contacts')
          .update(
            {slug: contact.slug},
            {$set: {updatedAt: new Date()}},
            done
          )
      })

      contactCampaignsPage
        .waitForElementPresent('@showUpdatesButton')

      done()
    })

    t.page.main().logout()
    t.end()
  }
}

module.exports = test
