import { Random } from 'meteor/random'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import Embeds from '/imports/api/embeds/embeds'
import {
  createEmbed
} from '/imports/api/embeds/server/methods'
import { createTestUsers } from '/tests/fixtures/server-domain'

describe('createEmbed', function () {
  let users

  beforeEach(function () {
    resetDatabase()

    users = createTestUsers(1)
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => createEmbed.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => createEmbed.validate({url: 1}), /Url must be of type String/)
    assert.throws(() => createEmbed.validate({url: 'goober://fools.gold'}), /Url/)
    assert.doesNotThrow(() => createEmbed.validate({url: 'https://wizard.cool'}))
  })

  // TODO: https://github.com/Medialist/medialist-app2/issues/372
  it('should scrape the url and insert the result into the Embeds collection', function (done) {
    if (process.env.CI) {
      console.warn('Not running test - see https://github.com/Medialist/medialist-app2/issues/372')
      return done()
    }

    this.timeout(10000)

    const url = 'https://www.theguardian.com/world/2017/mar/06/why-do-sheep-get-horny-in-winter-because-the-light-is-baaad-says-study'
    const res = createEmbed.run.call({userId: users[0]._id}, {url})
    assert.ok(res)

    const embeds = Embeds.find({}).fetch()
    assert.equal(embeds.length, 1)
    assert.equal(embeds[0].url, url)

    done()
  })

  // TODO: https://github.com/Medialist/medialist-app2/issues/372
  it('should scrape urls hidden by shortening services', function (done) {
    if (process.env.CI) {
      console.warn('Not running test - see https://github.com/Medialist/medialist-app2/issues/372')
      return done()
    }

    this.timeout(60000)

    const url = 'https://t.co/f7WPyaasSx'
    const res = createEmbed.run.call({userId: users[0]._id}, {url})
    assert.ok(res)

    const embeds = Embeds.find({}).fetch()
    assert.equal(embeds.length, 1)
    assert.equal(embeds[0].urls[0], url)

    done()
  })

  // TODO: https://github.com/Medialist/medialist-app2/issues/372
  it('should not duplicate embeds if two urls redirect to the same page', function (done) {
    if (process.env.CI) {
      console.warn('Not running test - see https://github.com/Medialist/medialist-app2/issues/372')
      return done()
    }

    this.timeout(60000)

    const url1 = 'https://techcrunch.com/2017/04/13/lucid-tests-a-high-speed-prototype-version-of-its-air-electric-car/'
    assert.ok(createEmbed.run.call({
      userId: users[0]._id
    }, {
      url: url1
    }))

    const url2 = 'https://techcrunch.com/2017/04/13/lucid-tests-a-high-speed-prototype-version-of-its-air-electric-car'
    assert.ok(createEmbed.run.call({
      userId: users[0]._id
    }, {
      url: url2
    }))

    const embeds = Embeds.find({}).fetch()
    assert.equal(embeds.length, 1)
    assert.equal(embeds[0].urls.includes(url1), true)
    assert.equal(embeds[0].urls.includes(url2), true)

    done()
  })
})
