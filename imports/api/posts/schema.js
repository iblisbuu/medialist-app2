import SimpleSchema from 'simpl-schema'
import values from 'lodash.values'
import { IdSchema, AuditSchema, CreatedAtSchema } from '/imports/lib/schema'
import Contacts from '/imports/api/contacts/contacts'
import { CampaignRefSchema } from '/imports/api/campaigns/schema'
import { ContactRefSchema } from '/imports/api/contacts/schema'
import { EmbedRefSchema } from '/imports/api/embeds/schema'

export const PostTypes = [
  'FeedbackPost',
  'CoveragePost',
  'NeedToKnowPost',
  'CreateCampaign',
  'AddContactsToCampaign',
  'StatusUpdate'
]

export const PostSchema = new SimpleSchema({
  contacts: {
    type: Array,
    minCount: 0,
    defaultValue: []
  },
  'contacts.$': {
    type: ContactRefSchema
  },
  campaigns: {
    type: Array,
    minCount: 0,
    defaultValue: []
  },
  'campaigns.$': {
    type: CampaignRefSchema
  },
  embeds: {
    type: Array,
    minCount: 0,
    defaultValue: []
  },
  'embeds.$': {
    type: EmbedRefSchema
  },
  message: {
    type: String,
    optional: true
  },
  status: {
    type: String,
    allowedValues: values(Contacts.status),
    optional: true
  },
  type: {
    type: String,
    allowedValues: values(PostTypes)
  }
})
PostSchema.extend(IdSchema)
PostSchema.extend(AuditSchema)
PostSchema.extend(CreatedAtSchema)
