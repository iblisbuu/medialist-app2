import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import Campaigns from './campaigns'

/**
 * Find campaigns that match a search term and other criteria.
 * Returns a Cursor.
 */
export const searchCampaigns = ({
  term,
  masterListSlug,
  userId,
  sort,
  limit = 20,
  minSearchLength = 3
}) => {
  check(term, Match.Maybe(String))
  check(masterListSlug, Match.Maybe(String))
  check(userId, Match.Maybe(String))
  check(sort, Object)
  check(limit, Number)

  const query = {}
  if (masterListSlug) {
    query['masterLists.slug'] = masterListSlug
  }
  if (userId) {
    const user = Meteor.users.findOne({_id: userId})
    const myContacts = user ? user.myCampaigns : []
    query.slug = { $in: myContacts.map((c) => c.slug) }
  }
  if (term && term.length >= minSearchLength) {
    const termRegExp = new RegExp(term, 'gi')
    query.$or = [
      { name: termRegExp },
      { 'purpose': termRegExp },
      { 'client.name': termRegExp }
    ]
  }
  return Campaigns.find(query, {sort, limit})
}