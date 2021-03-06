import { Meteor } from 'meteor/meteor'
import { Counter } from 'meteor/natestrauser:publish-performant-counts'
import { check } from 'meteor/check'
import { ReactiveAggregate } from 'meteor/jcbernack:reactive-aggregate'
import Campaigns from '/imports/api/campaigns/campaigns'
import Contacts from '/imports/api/contacts/contacts'
import StatusMap from '/imports/api/contacts/status'
import publishToCollection from '/imports/lib/publish-to-collection'
import createCampaignSearchQuery from '/imports/api/campaigns/queries'
import { CampaignSearchSchema } from '/imports/api/campaigns/schema'
import { getMongoCollationOpts } from '/imports/lib/collation'

const campaignCounter = new Counter('campaignCount', Campaigns.find({}))

Meteor.publish('campaignCount', function () {
  return campaignCounter
})

// TODO: replace with campaign-search for filter dropdown.
Meteor.publish('campaign-refs', function () {
  return Campaigns.find({}, {
    fields: {
      _id: 1,
      slug: 1,
      name: 1,
      avatar: 1,
      client: 1,
      contacts: 1
    }
  })
})

Meteor.publish('campaign-refs-by-slug', function ({campaignSlugs}) {
  return Campaigns.find({
    slug: {
      $in: campaignSlugs
    }
  }, {
    fields: {
      _id: 1,
      slug: 1,
      name: 1,
      avatar: 1,
      client: 1,
      contacts: 1
    }
  })
})

Meteor.publish('campaign', function (slug) {
  if (!this.userId) {
    return []
  }

  return [
    Campaigns.find({
      slug: slug
    }),
    Contacts.find({
      campaigns: slug
    }, {
      fields: {
        importedData: 0
      }
    })
  ]
})

Meteor.publish('campaigns', function (query = {}, options = {}) {
  if (!this.userId) {
    return this.ready()
  }

  return Campaigns.find(query, options)
})

Meteor.publish('campaign-favourites', function () {
  if (!this.userId) return []
  return Campaigns.find({}, { limit: 7, sort: [['createdAt', 'desc']] })
})

// Returns a list of ContactRef-like objects for contacts on a campaign
Meteor.publish('campaign-contacts', function (campaignSlug) {
  if (!this.userId) {
    return this.ready()
  }

  check(campaignSlug, String)

  ReactiveAggregate(this, Campaigns, [{
    $match: {
      slug: campaignSlug
    }
  }, {
    $project: {
      campaign: '$slug',
      contacts: 1
    }
  }, {
    $unwind: '$contacts'
  }, {
    $lookup: {
      from: 'contacts',
      localField: 'contacts.slug',
      foreignField: 'slug',
      as: 'remote_contact'
    }
  }, {
    $unwind: {
      path: '$remote_contact'
    }
  }, {
    $project: {
      _id: {
        $concat: ['$_id', '-', '$remote_contact._id']
      },
      campaign: '$campaign',
      slug: '$contacts.slug',
      status: '$contacts.status',
      latestPost: '$contacts.latestPost',
      owners: '$contacts.owners',
      updatedAt: '$contacts.updatedAt',
      updatedBy: '$contacts.updatedBy',
      coverage: '$contacts.coverage',
      coverageCount: { $size: { $ifNull: [ '$contacts.coverage', [] ] } },
      name: '$remote_contact.name',
      avatar: '$remote_contact.avatar',
      outlets: '$remote_contact.outlets',
      emails: '$remote_contact.emails',
      phones: '$remote_contact.phones'
    }
  }], {
    clientCollection: 'campaign-contacts-client'
  })
})

// Returns status counts for all contacts on a campaign
Meteor.publish('campaign-contact-statuses', function (campaignSlug) {
  if (!this.userId) {
    return this.ready()
  }

  const group = Object.keys(StatusMap).reduce((group, status) => {
    group[status] = {
      $sum: {
        $cond: [{
          $eq: ['$contacts.status', StatusMap[status]]
        }, 1, 0]
      }
    }

    return group
  }, {
    _id: '$_id'
  })

  const project = Object.keys(StatusMap).reduce((project, status) => {
    project[StatusMap[status]] = `$${status}`

    return project
  }, {
    _id: 1
  })

  ReactiveAggregate(this, Campaigns, [{
    $match: {
      slug: campaignSlug
    }
  }, {
    $project: {
      contacts: 1
    }
  }, {
    $unwind: '$contacts'
  }, {
    $group: group
  }, {
    $project: project
  }], {
    clientCollection: 'campaign-contact-statuses-client'
  })
})

Meteor.publish('campaign-search-results', function ({sort, limit, ...campaignSearch}) {
  if (!this.userId) {
    return this.ready()
  }
  CampaignSearchSchema.validate(campaignSearch)

  const query = createCampaignSearchQuery(campaignSearch)

  if (sort && sort.hasOwnProperty('updatedAt')) {
    // reactive: will publish changes as they happen.
    const cursor = Campaigns.find(query, {sort, limit})
    publishToCollection(this, 'campaign-search-results', cursor)
  } else {
    // non-reactive: result set won't change until you re-subscribe
    const sub = this

    const rawCursor = Campaigns.rawCollection()
      .find(query)
      .sort(sort)
      .limit(limit)
      .collation(getMongoCollationOpts())

    const addToSub = Meteor.wrapAsync(function (cb) {
      rawCursor.forEach(
        doc => sub.added('campaign-search-results', doc._id, doc),
        cb
      )
    })

    addToSub(err => {
      if (err) return sub.error(err)
      sub.ready()
    })
  }
})

Meteor.publish('campaign-search-count-not-reactive', function (campaignSearch) {
  if (!this.userId) {
    return this.ready()
  }
  CampaignSearchSchema.validate(campaignSearch)

  const query = createCampaignSearchQuery(campaignSearch)

  const count = Campaigns.find(query).count()

  const sub = this
  // Always use the same _id, so it's replaced on the client.
  sub.added('campaign-search-count', 'campaign-search-count-id', {count: count})

  sub.ready()
})
