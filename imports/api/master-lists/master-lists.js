import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import nothing from '/imports/lib/nothing'

const MasterLists = new Mongo.Collection('MasterLists')
MasterLists.allow(nothing)
if (Meteor.isServer) {
  MasterLists._ensureIndex({slug: 1})
}
export default MasterLists

const TypeSchema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ['Contacts', 'Campaigns']
  }
})

export const MasterListSchema = new SimpleSchema([
  TypeSchema,
  {
    name: {
      type: String,
      min: 1
    },
    slug: {
      type: String,
      min: 1
    },
    items: {
      type: [String],
      regEx: SimpleSchema.RegEx.Id
    },
    order: {
      type: Number
    }
  }
])

export const MasterListCreationSchema = new SimpleSchema([
  TypeSchema,
  {
    name: {
      type: String,
      min: 1
    }
  }
])

export const MasterListRefSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  name: {
    type: String,
    min: 1
  },
  slug: {
    type: String,
    min: 1
  }
})
