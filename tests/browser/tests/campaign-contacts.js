'use strict'

const faker = require('faker')

const test = {
  '@tags': ['campaign-contacts'],

  beforeEach: function (t) {
    this.user = t.page.authenticate()
      .register()
  },

  'Should add contacts to a campaign': function (t) {
    t.createDomain(['contact', 'contact', 'campaign'], (contact1, contact2, campaign, done) => {
      const campaignPage = t.page.campaign()
        .navigate(campaign)

      campaignPage
        .openAddContactsModal()

      campaignPage.section.addContactsModal
        .add(contact1)
        .add(contact2)
        .save()

      t.page.main().waitForSnackbarMessage('batch-add-contacts-to-campaign-success')

      t.perform((done) => {
        t.db.findCampaign({
          _id: campaign._id
        })
        .then((doc) => {
          t.assert.equal(Object.keys(doc.contacts).length, 2)
          t.assert.equal(doc.contacts[contact1.slug], 'To Contact')
          t.assert.equal(doc.contacts[contact2.slug], 'To Contact')

          done()
        })
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should update the status of a contact': function (t) {
    t.createDomain(['campaign', 'contact', 'contact', 'contact'], (campaign, contact1, contact2, contact3, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact1, contact2], campaign, () => done())
      })

      t.perform((done) => {
        const campaignPage = t.page.campaignContacts()
          .navigate(campaign)

        campaignPage.section.contactTable
          .searchFor(contact1.name)
          .updateStatus(contact1, 'hot-lead')

        t.perform((done) => {
          t.db.findCampaign({
            _id: campaign._id
          })
          .then((doc) => {
            t.assert.equal(doc.contacts[contact1.slug], 'Hot Lead')

            done()
          })
        })

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should add contacts to a campaign from campaign contacts page toast menu': function (t) {
    t.createDomain(['campaign', 'campaign', 'contact', 'contact'], (campaign1, campaign2, contact1, contact2, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact1, contact2], campaign1, () => done())
      })

      t.perform((done) => {
        const campaign1ContactsPage = t.page.campaignContacts()
          .navigate(campaign1)

        campaign1ContactsPage.section.contactTable
          .searchFor(contact1.name)
          .selectRow(0)

        campaign1ContactsPage.section.toast.openAddContactsToCampaignModal()

        campaign1ContactsPage.section.campaignSelectorModal
          .searchForCampaign(campaign2)
          .selectSearchResult(campaign2)

        t.page.main().waitForSnackbarMessage('batch-add-contacts-to-campaign-success')

        const campaign2ContactsPage = t.page.campaignContacts()
          .navigate(campaign2)

        campaign2ContactsPage.section.contactTable
          .assertInSearchResults(contact1)

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should add to contact list from campaign contacts page toast menu': function (t) {
    t.createDomain(['campaign', 'contactList', 'contact'], (campaign, contactList, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      t.perform((done) => {
        const campaignContactsPage = t.page.campaignContacts()
          .navigate(campaign)

        campaignContactsPage.section.contactTable
          .searchFor(contact.name)
          .selectRow(0)

        campaignContactsPage.section.toast.openAddToContactListsModal()
        campaignContactsPage.section.contactListsModal
          .selectList(contactList)
          .save()

        t.page.main().waitForSnackbarMessage('batch-add-contacts-to-contact-list-success')

        const contactsPage = t.page.contacts()
          .navigate()

        contactsPage
          .navigateToContactList(contactList)

        contactsPage.section.contactTable
          .assertInSearchResults(contact)

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should favourite contacts from campaign contacts page toast menu': function (t) {
    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      t.perform((done) => {
        const campaignContactsPage = t.page.campaignContacts()
          .navigate(campaign)

        campaignContactsPage.section.contactTable
          .searchFor(contact.name)
          .selectRow(0)

        campaignContactsPage.section.toast.favouriteContacts()

        t.page.main().waitForSnackbarMessage('batch-favourite-contacts-success')

        const contactsPage = t.page.contacts()
          .navigate()

        contactsPage
          .navigateToMyContacts()

        contactsPage.section.contactTable
          .searchFor(contact.name)
          .assertInSearchResults(contact)

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should add tags to contacts from campaign contacts page toast menu': function (t) {
    const tag = `${faker.hacker.noun()}-${faker.hacker.noun()}-${faker.hacker.noun()}`.toLowerCase().replace(/[^a-z0-9_-]/g, '')

    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      t.perform((done) => {
        const campaignContactsPage = t.page.campaignContacts()
          .navigate(campaign)

        campaignContactsPage.section.contactTable
          .searchFor(contact.name)
          .selectRow(0)

        campaignContactsPage.section.toast.openAddTagsToContactsModal()

        campaignContactsPage.section.tagSelectorModal
          .addTag(tag)
          .save()

        t.page.main().waitForSnackbarMessage('batch-tag-contacts-success')

        const contactsPage = t.page.contacts()
          .navigate()

        contactsPage
          .navigateToTag(tag)

        contactsPage.section.contactTable
          .assertInSearchResults(contact)

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should remove contacts from a campaign from campaign contacts toast menu': function (t) {
    t.createDomain(['campaign', 'contact', 'contact', 'contact'], (campaign, contact1, contact2, contact3, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact1, contact2, contact3], campaign, () => done())
      })

      t.perform((done) => {
        const campaignContactsPage = t.page.campaignContacts()
          .navigate(campaign)

        campaignContactsPage.section.contactTable
          .selectRow(0)
          .selectRow(1)

        campaignContactsPage.section.toast.openRemoveContactsModal()

        campaignContactsPage.section.removeContactsModal
          .confirm()

        t.page.main().waitForSnackbarMessage('batch-remove-contacts-from-campaign-success')

        t.perform((done) => {
          t.db.findContacts({
            [`campaigns.${campaign.slug}`]: {
              $exists: true
            }
          })
          .then((docs) => {
            t.assert.equal(docs.length, 1)

            done()
          })
        })

        done()
      })

      t.perform((done) => {
        t.db.findCampaign({
          _id: campaign._id
        })
        .then((doc) => {
          t.assert.equal(doc.contacts[contact1._id], undefined)
          t.assert.equal(doc.contacts[contact2._id], undefined)

          done()
        })
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should cancel removing contacts from a campaign from campaign contacts toast menu': function (t) {
    t.createDomain(['campaign', 'contact', 'contact', 'contact'], (campaign, contact1, contact2, contact3, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact1, contact2], campaign, () => done())
      })

      t.perform((done) => {
        const campaignContactsPage = t.page.campaignContacts()
          .navigate(campaign)

        campaignContactsPage.section.contactTable
          .selectRow(0)
          .selectRow(1)

        campaignContactsPage.section.toast.openRemoveContactsModal()

        campaignContactsPage.section.removeContactsModal
          .cancel()

        t.perform((done) => {
          t.db.findCampaign({
            _id: campaign._id
          })
          .then((doc) => {
            t.assert.equal(Object.keys(doc.contacts).length, 2)
            t.assert.equal(doc.contacts[contact1.slug], 'To Contact')
            t.assert.equal(doc.contacts[contact2.slug], 'To Contact')

            done()
          })
        })

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  }
}

module.exports = test
