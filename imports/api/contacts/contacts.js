import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Counter } from 'meteor/natestrauser:publish-performant-counts'
import values from 'lodash.values'
import nothing from '/imports/lib/nothing'
import StatusMap from '/imports/api/contacts/status'
import { ContactRefSchema, ContactCreateSchema, ContactSchema } from './schema'

export { ContactRefSchema, ContactCreateSchema, ContactSchema }

const Contacts = new Mongo.Collection('contacts')
Contacts.attachSchema(ContactSchema)
Contacts.allow(nothing)

if (Meteor.isServer) {
  Contacts._ensureIndex({ slug: 1 })
}

Contacts.allContactsCount = () => Counter.get('contactCount')

Contacts.toRef = ({_id, slug, name, avatar, outlets, updatedAt, createdAt}) => {
  const ref = {
    _id,
    slug,
    name,
    avatar,
    outlets: outlets && outlets.length ? outlets : [],
    updatedAt: updatedAt || createdAt
  }

  if (!ref.avatar) {
    delete ref.avatar
  }

  return ref
}

Contacts.findRefs = ({contactSlugs}) => {
  return Contacts.find({
    slug: {
      $in: contactSlugs
    }
  }, {
    fields: {
      _id: 1,
      slug: 1,
      name: 1,
      avatar: 1,
      outlets: 1,
      updatedAt: 1,
      createdAt: 1
    }
  }).map(Contacts.toRef)
}

Contacts.findOneRef = (contactSlugOrId) => {
  return Contacts.toRef(Contacts.findOne({
    $or: [{
      _id: contactSlugOrId
    }, {
      slug: contactSlugOrId
    }]
  }, {
    fields: {
      _id: 1,
      slug: 1,
      name: 1,
      avatar: 1,
      outlets: 1,
      updatedAt: 1,
      createdAt: 1
    }
  }))
}

Contacts.status = StatusMap
Contacts.phoneTypes = [
  'Mobile',
  'Landline'
]
Contacts.emailTypes = [
  'Work',
  'Personal',
  'Other'
]
Contacts.socialTypes = [
  'Twitter',
  'LinkedIn',
  'Facebook',
  'YouTube',
  'Pinterest',
  'Instagram'
]
// Get the index of a given status for sorting
// String => Integer
Contacts.statusIndex = [].indexOf.bind(values(Contacts.status))

export default Contacts
