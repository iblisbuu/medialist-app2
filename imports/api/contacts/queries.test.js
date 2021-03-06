import { Meteor } from 'meteor/meteor'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import faker from 'faker'
import Contacts from '/imports/api/contacts/contacts'
import { searchContacts } from '/imports/api/contacts/queries'
import Campaigns from '/imports/api/campaigns/campaigns'
import { campaign, user, contact } from '/tests/browser/fixtures/domain'
import { createContact, batchFavouriteContacts, addContactsToCampaign } from '/imports/api/contacts/methods'
import { createCampaign } from '/imports/api/campaigns/methods'
import { batchAddToMasterLists, createMasterList } from '/imports/api/master-lists/methods'
import MasterLists from '/imports/api/master-lists/master-lists'
import { createTestUsers, createTestContacts, createTestCampaigns, createTestCampaignLists, createTestContactLists } from '/tests/fixtures/server-domain'

describe('searchContacts', function () {
  let users
  let contacts
  let campaigns
  let masterLists

  beforeEach(function () {
    resetDatabase()

    users = createTestUsers(2)
    campaigns = createTestCampaigns(3)
    contacts = createTestContacts(4)
    masterLists = createTestContactLists(2)

    contacts.forEach(contact => {
      Contacts.update({
        _id: contact._id
      }, {
        $set: {
          name: contact.name + ' name'
        }
      })
    })

    addContactsToCampaign.run.call({ userId: users[0]._id }, {
      contactSlugs: [contacts[1].slug],
      campaignSlug: campaigns[0].slug
    })

    addContactsToCampaign.run.call({ userId: users[0]._id }, {
      contactSlugs: [contacts[3].slug],
      campaignSlug: campaigns[1].slug
    })

    batchAddToMasterLists.run.call({ userId: users[0]._id }, {
      type: 'Contacts',
      slugs: [contacts[2].slug],
      masterListIds: [masterLists[0]._id]
    })

    batchFavouriteContacts.run.call({ userId: users[1]._id }, {
      contactSlugs: [contacts[1].slug]
    })
  })

  it('should search for contacts by name', function () {
    const termSearch1Res = searchContacts({term: contacts[1].name, sort: {name: -1}}).fetch()
    assert.equal(termSearch1Res.length, 1)
    assert.equal(termSearch1Res[0]._id, contacts[1]._id)
  })

  it('should search for contacts by master list name', function () {
    const termSearch2Res = searchContacts({term: masterLists[0].name, sort: {name: -1}}).fetch()
    assert.equal(termSearch2Res.length, 1)
    assert.equal(termSearch2Res[0]._id, contacts[2]._id)
  })

  it('should search for multiple contacts by name', function () {
    const termSearchManyRes = searchContacts({term: 'name', sort: {name: -1}}).fetch()
    assert.equal(termSearchManyRes.length, 4)
  })

  it('should search for contacts by name and slug', function () {
    const termAndCampaignSearch1Res = searchContacts({term: 'name', campaignSlugs: [campaigns[0].slug], sort: {name: -1}}).fetch()
    assert.equal(termAndCampaignSearch1Res.length, 1)
    assert.equal(termAndCampaignSearch1Res[0]._id, contacts[1]._id)
  })

  it('should search for contacts by favourites', function () {
    const myContactsSearch1Res = searchContacts({userId: users[1]._id, sort: {name: -1}}).fetch()
    assert.equal(myContactsSearch1Res.length, 1)
    assert.equal(myContactsSearch1Res[0]._id, contacts[1]._id)
  })

  it('should search for contacts by master list slug', function () {
    const masterListSearch1Res = searchContacts({masterListSlug: masterLists[0].slug, sort: {name: -1}}).fetch()
    assert.equal(masterListSearch1Res.length, 1)
    assert.equal(masterListSearch1Res[0]._id, contacts[2]._id)
  })

  it('should search for contacts by either campaign slugs', function () {
    const termAndCampaignSearch1Res = searchContacts({campaignSlugs: [campaigns[0].slug, campaigns[1].slug], sort: {name: -1}}).fetch()
    assert.equal(termAndCampaignSearch1Res.length, 2)
    assert.ok(termAndCampaignSearch1Res.find(c => c._id === contacts[1]._id))
    assert.ok(termAndCampaignSearch1Res.find(c => c._id === contacts[3]._id))
  })
})
