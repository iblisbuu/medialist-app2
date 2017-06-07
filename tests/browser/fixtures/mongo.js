
const mongojs = require('mongojs')
const retry = require('promise-retry')

const findOne = (db, collection, query) => {
  return find(db, collection, 'findOne', query)
}

const findMany = (db, collection, query) => {
  return find(db, collection, 'find', query)
}

const find = (db, collection, method, query) => {
  return retry((retry) => {
    return new Promise((resolve, reject) => {
      db.collection(collection)[method](query, (error, doc) => {
        if (!error && !doc) {
          error = new Error('Could not find doc(s)')
        }

        if (error) {
          return reject(error)
        }

        resolve(doc)
      })
    })
    .catch(retry)
  })
}

module.exports = (url) => {
  const db = mongojs(url)

  return {
    connection: db,
    findCampaign: findOne.bind(null, db, 'campaigns'),
    findCampaigns: findMany.bind(null, db, 'campaigns'),
    findUser: findOne.bind(null, db, 'users'),
    findContact: findOne.bind(null, db, 'contacts'),
    findContacts: findMany.bind(null, db, 'contacts'),
    findCampaignList: findOne.bind(null, db, 'MasterLists'),
    findContactList: findOne.bind(null, db, 'MasterLists')
  }
}
