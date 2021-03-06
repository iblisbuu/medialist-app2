'use strict'

const faker = require('faker')
const tmp = require('tmp')
const fs = require('fs')
const async = require('async')
const mkdirp = require('mkdirp')
const domain = require('../fixtures/domain')
const assertions = require('../fixtures/assertions')

const test = {
  '@tags': ['contacts'],

  beforeEach: function (t) {
    this.user = t.page.authenticate()
      .register()
  },

  'Should only import csv files': function (t) {
    mkdirp.sync('/tmp/medialist_test')

    const file = tmp.fileSync({
      dir: '/tmp/medialist_test',
      mode: 0o644
    })

    t.page.contactImport()
      .navigate()
      .selectFile(file.name)

    t.page.main().waitForSnackbarMessage('contacts-import-file-not-csv')

    t.page.main().logout()
    t.end()
  },

  'Should import contacts': function (t) {
    // file is shared from test container to chrome container via docker volume mount.
    // See .drone.yml
    const file = tmp.fileSync({
      dir: '/tmp/medialist_test',
      postfix: '.csv',
      mode: 0o644
    })
    const contents = `Name, Outlet, Email, Telephone
${faker.name.findName()}, ${faker.company.companyName()}, ${faker.internet.email()}, ${faker.phone.phoneNumber()}`
    fs.writeFileSync(file.name, contents)

    t.page.contactImport()
      .navigate()
      .uploadCsvFile(file.name)
      .completeImport()
      .waitForElementVisible('@status')
      .assert.containsText('@status', '1 new contacts added, 0 updated.')

    t.page.main().logout()
    t.end()
  },

  'Should create a new contact': function (t) {
    const contactsPage = t.page.main()
      .navigateToContacts(t)

    contactsPage.waitForElementVisible('@newContactButton')
      .click('@newContactButton')
      .waitForElementVisible(contactsPage.section.editContactForm.selector)

    const contact = domain.contact()

    contactsPage.section.editContactForm
      .populate(contact)
      .submit()

    t.page.main().waitForSnackbarMessage('contact-create-success')

    t.perform((done) => {
      t.db.findContact({
        name: contact.name
      })
      .then((doc) => {
        t.assert.urlEquals(`${t.launch_url}/contact/${doc.slug}`)

        assertions.contactsAreEqual(t, contact, doc)

        done()
      })
      .catch(error => {
        throw error
      })
    })

    t.page.main().logout()
    t.end()
  },

  'Should search for contacts': function (t) {
    t.createDomain(['contact'], (contact, done) => {
      const contactsPage = t.page.main()
        .navigateToContacts(t)

      contactsPage.section.contactTable
        .searchFor(contact.name)
        .clickRow(0)

      t.assert.urlEquals(`${t.launch_url}/contact/${contact.slug}`)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should add contacts to a campaign from toast menu': function (t) {
    t.createDomain(['contact', 'campaign'], (contact, campaign, done) => {
      const contactsPage = t.page.main()
        .navigateToContacts(t)

      contactsPage.section.contactTable
        .searchFor(contact.name)
        .selectRow(0)

      contactsPage.section.toast.openAddContactsToCampaignModal()

      contactsPage.section.campaignSelectorModal
        .searchForCampaign(campaign)
        .selectSearchResult(campaign)

      t.page.main().waitForSnackbarMessage('batch-add-contacts-to-campaign-success')

      const campaignContactsPage = t.page.campaignContacts()
        .navigate(campaign)

      campaignContactsPage.section.contactTable
        .assertInSearchResults(contact)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should add to contact list from toast menu': function (t) {
    t.createDomain(['contactList', 'contact'], (contactList, contact, done) => {
      const contactsPage = t.page.contacts()
        .navigate()

      contactsPage.section.contactTable
        .searchFor(contact.name)
        .selectRow(0)

      contactsPage.section.toast.openAddToContactListsModal()
      contactsPage.section.contactListsModal
        .selectList(contactList)
        .save()

      t.page.main().waitForSnackbarMessage('batch-add-contacts-to-contact-list-success')

      contactsPage
        .navigateToContactList(contactList)

      contactsPage.section.contactTable
        .assertInSearchResults(contact)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should favourite contacts from toast menu': function (t) {
    t.createDomain(['contact'], (contact, done) => {
      const contactsPage = t.page.contacts()
        .navigate()

      contactsPage.section.contactTable
        .searchFor(contact.name)
        .selectRow(0)

      contactsPage.section.toast.favouriteContacts()

      t.page.main().waitForSnackbarMessage('batch-favourite-contacts-success')

      contactsPage
        .navigateToMyContacts()

      contactsPage.section.contactTable
        .searchFor(contact.name)
        .assertInSearchResults(contact)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should add tags to contacts from toast menu': function (t) {
    const tag = `${faker.hacker.noun()}-${faker.hacker.noun()}-${faker.hacker.noun()}`.toLowerCase().replace(/[^a-z0-9_-]/g, '')

    t.createDomain(['contact'], (contact, done) => {
      const contactsPage = t.page.contacts()
        .navigate()

      contactsPage.section.contactTable
        .searchFor(contact.name)
        .selectRow(0)

      contactsPage.section.toast.openAddTagsToContactsModal()

      contactsPage.section.tagSelectorModal
        .addTag(tag)
        .save()

      t.page.main().waitForSnackbarMessage('batch-tag-contacts-success')

      contactsPage
        .navigateToTag(tag)

      contactsPage.section.contactTable
        .assertInSearchResults(contact)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should hide delete contacts option in toast menu': function (t) {
    t.createDomain(['contact'], (contact, done) => {
      const contactsPage = t.page.contacts()
        .navigate()

      contactsPage.section.contactTable
        .searchFor(contact.name)
        .selectRow(0)

      contactsPage.waitForElementVisible(contactsPage.section.toast.selector)
      contactsPage.section.toast.assert.elementNotPresent('@deleteContacts')

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should filter contacts by master list': function (t) {
    const domainArgs = Array(5).fill('contact').concat(Array(5).fill('contactList'))

    t.createDomain(domainArgs, function () {
      const args = Array.from(arguments)
      const contacts = args.slice(0, 5)
      const masterLists = args.slice(5, 10)
      const done = args[10]

      t.perform((done) => {
        const tasks = contacts.map((c, i) => {
          return (cb) => t.addContactsToContactLists([c], [masterLists[i]], cb)
        })
        async.parallel(tasks, done)
      })

      const contactsPage = t.page.contacts()
        .navigate()

      const masterListsSelector = contactsPage.section.masterListsSelector
      const contactTable = contactsPage.section.contactTable

      contactsPage
        .waitForElementVisible(contactsPage.section.masterListsSelector.selector)

      // Assert each campaign present/absent in each master list
      masterLists.forEach((masterList, i) => {
        masterListsSelector.clickMasterListBySlug(masterList.slug)

        const assertResult = (resultCampaign) => {
          contacts.forEach((campaign, i) => {
            const selector = `[data-item='${campaign.slug}']`
            if (campaign === resultCampaign) {
              contactTable.waitForElementPresent(selector)
            } else {
              contactTable.waitForElementNotPresent(selector)
            }
          })
        }

        assertResult(contacts[i])
      })

      // Ensure we can click all/my and that they become selected
      masterListsSelector
        .assert.elementPresent('@all')
        .clickMasterListBySlug('all')
        .waitForElementPresent('@allSelected')
        .assert.elementPresent('@my')
        .clickMasterListBySlug('my')
        .waitForElementPresent('@mySelected')

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should retain search query in search box after page refresh': function (t) {
    t.createDomain(['contact'], (contact, done) => {
      const contactsPage = t.page.main()
        .navigateToContacts(t)

      contactsPage.section.contactTable
        .searchFor(contact.name)

      t.refresh()

      contactsPage.section.contactTable
        .waitForElementVisible('@searchInput')
        .assert.value('@searchInput', contact.name)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should suggest job title and company': function (t) {
    t.createDomain(['contact'], (contact, done) => {
      const contactsPage = t.page.main()
        .navigateToContacts(t)

      contactsPage
        .waitForElementVisible('@newContactButton')
        .click('@newContactButton')
        .waitForElementVisible(contactsPage.section.editContactForm.selector)

      const jobTitle = contact.outlets[0].value
      const jobCompany = contact.outlets[0].label

      contactsPage.section.editContactForm
        .populateJobTitle(0, jobTitle)
        .assertJobTitleSuggestion(0, jobTitle)

      contactsPage.section.editContactForm
        .populateJobCompany(0, jobCompany)
        .assertJobCompanySuggestion(0, jobCompany)

      // Dismiss the modal
      t.keys(t.Keys.ENTER)
      contactsPage.section.editContactForm.cancel()

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should not suggest the same job title/company multiple times': function (t) {
    t.createDomain(['contact'], (contact1, done) => {
      const contactsPage = t.page.main()
        .navigateToContacts(t)

      contactsPage
        .waitForElementVisible('@newContactButton')
        .click('@newContactButton')
        .waitForElementVisible(contactsPage.section.editContactForm.selector)

      const contact2 = domain.contact()

      // Add a new contact with the same first outlet as contact1
      contact2.outlets = contact1.outlets.slice(0, 1)

      contactsPage.section.editContactForm
        .populate(contact2)
        .submit()

      t.page.main().waitForSnackbarMessage('contact-create-success')
      t.page.main().navigateToContacts(t)

      contactsPage
        .waitForElementVisible('@newContactButton')
        .click('@newContactButton')
        .waitForElementVisible(contactsPage.section.editContactForm.selector)

      const jobTitle = contact1.outlets[0].value
      const jobCompany = contact1.outlets[0].label

      contactsPage.section.editContactForm
        .populateJobTitle(0, jobTitle)
        // (checks the value isn't seen twice in the list)
        .assertJobTitleSuggestion(0, jobTitle)

      contactsPage.section.editContactForm
        .populateJobCompany(0, jobCompany)
        // (checks the value isn't seen twice in the list)
        .assertJobCompanySuggestion(0, jobCompany)

      // Dismiss the modal
      t.keys(t.Keys.ENTER)
      contactsPage.section.editContactForm.cancel()

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should return contacts on any campaign searched for': function (t) {
    t.createDomain(['contact', 'contact', 'campaign', 'campaign'], (contact1, contact2, campaign1, campaign2, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact1], campaign1, () => done())
      })

      t.perform((done) => {
        t.addContactsToCampaign([contact2], campaign2, () => done())
      })

      const campaignsPage = t.page.main()
        .navigateToCampaigns(t)

      campaignsPage.section.campaignTable
        .searchFor(campaign1.name)
        .selectRow(0)

      campaignsPage.section.campaignTable
        .searchFor(campaign2.name)
        .selectRow(0)

      campaignsPage.section.toast.viewContacts()

      t.page.contacts()
        .section.contactTable.isInResults(contact1)

      t.page.contacts()
        .section.contactTable.isInResults(contact2)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should case-insensitive sort by name': function (t) {
    // clear out contacts, as we're testing ordering.
    t.db.connection.collection('contacts').remove({}, function (err) {
      if (err) throw err
      t.createDomain(['contact', 'contact', 'contact', 'contact'], (contact1, contact2, contact3, contact4, done) => {
        t.perform((done) => {
          async.parallel([
            cb => t.db.connection.collection('contacts').update({
              _id: contact1._id
            }, {
              $set: {
                'name': 'albert'
              }
            }, cb),

            cb => t.db.connection.collection('contacts').update({
              _id: contact2._id
            }, {
              $set: {
                'name': 'Alfonzo'
              }
            }, cb),

            cb => t.db.connection.collection('contacts').update({
              _id: contact3._id
            }, {
              $set: {
                'name': 'Alan'
              }
            }, cb),

            cb => t.db.connection.collection('contacts').update({
              _id: contact4._id
            }, {
              $set: {
                'name': 'alan'
              }
            }, cb)
          ], done)
        })

        const contactsPage = t.page.main()
          .navigateToContacts(t)

        // Expect case-insensitive name sort:  Alan, alan, albert, Alfonzo
        contactsPage.section.contactTable
          .sortBy('name', 1, function (_, self) {
            self
              .assertInPosition(contact3, 0)
              .assertInPosition(contact4, 1)
              .assertInPosition(contact1, 2)
              .assertInPosition(contact2, 3)
          })

        // Expect case-insensitive name sort:  Alfonzo, albert, alan, Alan
        contactsPage.section.contactTable
          .sortBy('name', -1, function (_, self) {
            self
              .assertInPosition(contact2, 0)
              .assertInPosition(contact1, 1)
              .assertInPosition(contact4, 2)
              .assertInPosition(contact3, 3)
          })

        done()
      })
      t.page.main().logout()
      t.end()
    })
  },

  'Should display show updates button': function (t) {
    t.createDomain(['contact'], (contact, done) => {
      t.page.main()
        .logout()

      // Login with a new user
      this.user = t.page.authenticate()
        .register()

      const contactsPage = t.page.main()
        .navigateToContacts(t)

      t.perform((done) => {
        t.db.connection
          .collection('contacts')
          .update(
            {slug: contact.slug},
            {$set: {name: `TEST${Date.now()}`}},
            done
          )
      })

      contactsPage
        .waitForElementPresent('@showUpdatesButton')

      done()
    })

    t.page.main().logout()
    t.end()
  }
}

module.exports = test
