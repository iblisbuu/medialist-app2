import SimpleSchema from 'simpl-schema'
import { MasterListRefSchema } from '/imports/api/master-lists/schema'
import { TagRefSchema } from '/imports/api/tags/schema'
import { IdSchema, AuditSchema, CreatedAtSchema, UserRefSchema, LinkSchema } from '/imports/lib/schema'
import { ClientSchema } from '/imports/api/clients/schema'
import { StatusValues } from '/imports/api/contacts/status'

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

const CampaignContactRefSchema = new SimpleSchema({
  status: {
    type: String,
    allowedValues: StatusValues
  }
})
CampaignContactRefSchema.extend(AuditSchema)

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
    blackbox: true,
    custom: function () {
      // ugh https://github.com/aldeed/meteor-simple-schema/issues/244
      Object.keys(this.value).forEach(key => CampaignContactRefSchema.validate(this.value[key]))
    }
  },
  'contacts.$': {
    type: CampaignContactRefSchema
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
