import SimpleSchema from 'simpl-schema'
import { MasterListRefSchema } from '/imports/api/master-lists/schema'
import { TagRefSchema } from '/imports/api/tags/schema'
import { IdSchema, AuditSchema, CreatedAtSchema, UserRefSchema, LinkSchema } from '/imports/lib/schema'

export const CampaignRefSchema = new SimpleSchema({
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
  clientName: {
    type: String,
    optional: true
  },
  updatedAt: {
    type: Date
  }
})
CampaignRefSchema.extend(IdSchema)

const ClientSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  name: {
    type: String,
    optional: true
  }
})

export const CampaignSchema = new SimpleSchema({
  name: {
    type: String,
    min: 1
  },
  avatar: {
    type: String,
    optional: true
  },
  purpose: {
    type: String,
    min: 1,
    optional: true
  },
  slug: {
    type: String,
    denyUpdate: true
  },
  contacts: {
    type: Object,
    blackbox: true
  },
  client: {
    type: ClientSchema,
    optional: true
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
  team: {
    type: Array
  },
  'team.$': {
    type: UserRefSchema
  },
  links: {
    type: Array
  },
  'links.$': {
    type: LinkSchema
  }
})
CampaignSchema.extend(IdSchema)
CampaignSchema.extend(AuditSchema)
CampaignSchema.extend(CreatedAtSchema)
