import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import { createContactSearchQuery } from '/imports/api/contacts/queries'
import { ContactSearchCount, ContactSearchResults } from './collections'

function extractQueryOpts (props) {
  const {
    minSearchLength = 3,
    term,
    campaignSlugs,
    tagSlugs,
    masterListSlug,
    userId,
    importId
  } = props

  const queryOpts = {
    campaignSlugs,
    masterListSlug,
    userId,
    tagSlugs,
    importId,
    minSearchLength
  }

  if (term && term.length >= minSearchLength) {
    queryOpts.term = term
  }

  return queryOpts
}

function isSearching (queryOpts) {
  const query = createContactSearchQuery(queryOpts)
  return Object.keys(query).length > 0
}

/**
* Contact SearchContainer HOC
* Find contacts by a search term and other criteria.
*
* You can pass in:
* - `term` - The Search term
* - `campaignSlugs` - Array of campaigns to search in.
* - `masterListSlug` - To search a in a specific list
* - `userId` to search in the `myContacts` for a given user
* - `sort` - A mongo sort sort specifier
* - `limit` - Maximum number of docs to fetch.
*
* Your component will recieve these additional props:
* - `contacts` - search results
* - `loading` - search subscription is loading
* - `searching` - true if their is any search criteria
*/
export default (Component) => createContainer((props) => {
  console.log('search', props)

  const {
    limit,
    sort = { updatedAt: -1 }
  } = props

  const queryOpts = extractQueryOpts(props)

  const searchOpts = {
    sort,
    limit,
    ...queryOpts
  }

  const searching = isSearching(queryOpts)

  const subs = [Meteor.subscribe('contact-search-results', searchOpts)]

  const contacts = ContactSearchResults.find().fetch()

  const loading = props.loading || subs.some((s) => !s.ready())

  return { contacts, searching, loading, sort }
}, Component)

export const createSearchCountContainer = (Component) => createContainer((props) => {
  console.log('search-count', props)
  const queryOpts = extractQueryOpts(props)
  const subs = [Meteor.subscribe('contact-search-count', queryOpts)]
  const res = ContactSearchCount.find().fetch()
  const contactsCount = res[0] ? res[0].count : null
  const loading = props.loading || subs.some((s) => !s.ready())
  return { contactsCount, loading }
}, Component)
