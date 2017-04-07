
const mongojs = require('mongojs')
const retry = require('promise-retry')

const findCampaign = (db, query) => {
  return retry((retry) => {
    return new Promise((resolve, reject) => {
      db.collection('campaigns').findOne(query, (error, doc) => {
        if (!error && !doc) {
          error = new Error('Could not find doc')
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

const findUser = (db, query) => {
  return retry((retry) => {
    return new Promise((resolve, reject) => {
      db.collection('users').findOne(query, (error, doc) => {
        if (!error && !doc) {
          error = new Error('Could not find doc')
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

const findContact = (db, query) => {
  return retry((retry) => {
    return new Promise((resolve, reject) => {
      db.collection('contacts').findOne(query, (error, doc) => {
        if (!error && !doc) {
          error = new Error('Could not find doc')
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

const findContacts = (db, query) => {
  return retry((retry) => {
    return new Promise((resolve, reject) => {
      db.collection('contacts').find(query, (error, doc) => {
        if (!error && !doc) {
          error = new Error('Could not find docs')
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
    findCampaign: findCampaign.bind(null, db),
    findUser: findUser.bind(null, db),
    findContact: findContact.bind(null, db),
    findContacts: findContacts.bind(null, db)
  }
}
