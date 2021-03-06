import SimpleSchema from 'simpl-schema'
import { MasterListRefSchema } from '/imports/api/master-lists/schema'
import { TagRefSchema } from '/imports/api/tags/schema'
import { IdSchema, LabelValueSchema, AuditSchema, CreatedAtSchema } from '/imports/lib/schema'

export const ContactRefSchema = new SimpleSchema({
  slug: {
    type: String
  },
  name: {
    type: String
  },
  avatar: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  },
  outlets: {
    type: Array
  },
  'outlets.$': {
    type: LabelValueSchema
  },
  updatedAt: {
    type: Date
  }
})
ContactRefSchema.extend(IdSchema)

export const SocialSchema = new SimpleSchema({
  label: {
    type: String
  },
  value: {
    type: String,
    optional: true
  },
  twitterId: {
    type: String,
    optional: true
  }
})

export const AddressSchema = new SimpleSchema({
  street: {
    type: String,
    optional: true
  },
  city: {
    type: String,
    optional: true
  },
  postcode: {
    type: String,
    optional: true
  },
  country: {
    type: String,
    optional: true
  }
})

export const ContactCreateSchema = new SimpleSchema({
  name: {
    type: String,
    min: 1
  },
  avatar: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  },
  outlets: {
    type: Array
  },
  'outlets.$': {
    type: LabelValueSchema
  },
  emails: {
    type: Array
  },
  'emails.$': {
    type: LabelValueSchema
  },
  phones: {
    type: Array
  },
  'phones.$': {
    type: LabelValueSchema
  },
  bio: {
    type: String,
    optional: true
  },
  // TODO: Refactor the socials schema to allow for twitterId or other properties
  socials: {
    type: Array
  },
  'socials.$': {
    type: Object,
    blackbox: true
  },
  addresses: {
    type: Array
  },
  'addresses.$': {
    type: AddressSchema
  }
})

export const ContactSchema = new SimpleSchema({
  slug: {
    type: String,
    min: 1
  },
  // References to other collections
  campaigns: {
    type: Array
  },
  'campaigns.$': {
    type: String
  },
  masterLists: {
    type: Array
  },
  'masterLists.$': {
    type: MasterListRefSchema
  },
  tags: {
    type: Array
  },
  'tags.$': {
    type: TagRefSchema
  },
  imports: {
    type: Array
  },
  'imports.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  }
})
ContactSchema.extend(IdSchema)
ContactSchema.extend(AuditSchema)
ContactSchema.extend(CreatedAtSchema)
ContactSchema.extend(ContactCreateSchema)

export const ContactSearchSchema = new SimpleSchema({
  excludeSlugs: {
    type: Array,
    optional: true
  },
  'excludeSlugs.$': {
    type: String
  },
  term: {
    type: String,
    optional: true
  },
  tagSlugs: {
    type: Array,
    optional: true
  },
  'tagSlugs.$': {
    type: String
  },
  masterListSlug: {
    type: String,
    optional: true
  },
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  campaignSlugs: {
    type: Array,
    optional: true
  },
  'campaignSlugs.$': {
    type: String,
    optional: true
  },
  importId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  minSearchLength: {
    type: Number,
    optional: true
  }
})

export const ContactSlugsOrSearchSchema = new SimpleSchema({
  contactSlugs: {
    type: Array,
    optional: true
  },
  'contactSlugs.$': {
    type: String
  },
  contactSearch: {
    type: ContactSearchSchema,
    optional: true,
    custom () {
      if (!this.isSet && !this.field('contactSlugs').isSet) {
        return SimpleSchema.ErrorTypes.REQUIRED
      }
    }
  }
})
