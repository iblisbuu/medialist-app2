'use strict'

const findUrl = require('../../../imports/lib/find-url')

module.exports = {
  selector: '[data-id=post-box]',
  elements: {
    feedbackTab: '[data-id=feedback-tab]',
    coverageTab: '[data-id=coverage-tab]',
    needToKnowTab: '[data-id=need-to-know-tab]',
    feedbackInput: '[data-id=feedback-input]',
    coverageInput: '[data-id=coverage-input]',
    needToKnowInput: '[data-id=need-to-know-input]',
    createPostButton: '[data-id=create-post-button]',
    selectCampaignButton: '[data-id=select-campaign-button]',
    selectContactButton: '[data-id=select-contact-button]',
    searchForCampaignInput: '[data-id=campaigns-filterable-list-search-input]',
    searchForContactInput: '[data-id=contacts-filterable-list-search-input]',
    contactStatusSelectorButton: '[data-id=contact-status-selector-button]'
  },
  commands: [{
    openFeedbackTab: function () {
      this
        .waitForElementVisible('@feedbackTab')
        .click('@feedbackTab')
        .waitForElementVisible('@feedbackInput')
        .click('@feedbackInput')

      return this
    },
    selectContact: function (contact) {
      this
        .waitForElementVisible('@selectContactButton')
        .click('@selectContactButton')
        .waitForElementVisible('@searchForContactInput')
        .clear('@searchForContactInput')
        .setValue('@searchForContactInput', contact.name)
        .waitForElementVisible(`[data-id=campaign-contact-${contact.slug}]`)
        .click(`[data-id=campaign-contact-${contact.slug}]`)

      return this
    },
    selectContactStatus: function (contactStatus) {
      this
        .waitForElementVisible('@contactStatusSelectorButton')
        .click('@contactStatusSelectorButton')
        .waitForElementVisible(`[data-id=contact-status-${contactStatus}]`)
        .click(`[data-id=contact-status-${contactStatus}]`)

      return this
    },
    postFeedback: function (campaign, contact, contactStatus, text) {
      if (arguments.length === 3) {
        text = contactStatus
        contactStatus = contact
        contact = campaign
        campaign = null
      }

      this.openFeedbackTab()

      if (campaign) {
        this
          .waitForElementVisible('@selectCampaignButton')
          .click('@selectCampaignButton')
          .waitForElementVisible('@searchForCampaignInput')
          .setValue('@searchForCampaignInput', campaign.name)
          .waitForElementVisible(`[data-type=campaign-search-result][data-id=campaign-${campaign.slug}]`)
          .click(`[data-id=campaign-${campaign.slug}]`)
      } else {
        this.selectContact(contact)
      }

      this.selectContactStatus(contactStatus)

      this
        .waitForElementVisible('@feedbackInput')
        .setValue('@feedbackInput', text)

      const url = findUrl(text)

      if (url) {
        this.waitForElementVisible(`[href='${url}'][data-id=link-preview]`)
      }

      this
        .waitForElementVisible('@createPostButton')
        .click('@createPostButton')
        // The post box should now "close"
        .waitForElementNotVisible(campaign ? '@selectCampaignButton' : '@selectContactButton')
        .waitForElementNotVisible('@createPostButton')

      return this
    },
    openCoverageTab: function () {
      this
        .waitForElementVisible('@coverageTab')
        .click('@coverageTab')
        .waitForElementVisible('@coverageInput')
        .click('@coverageInput')

      return this
    },
    postCoverage: function (campaign, contact, contactStatus, text) {
      if (arguments.length === 3) {
        text = contactStatus
        contactStatus = contact
        contact = campaign
        campaign = null
      }

      this.openCoverageTab()

      if (campaign) {
        this
          .waitForElementVisible('@selectCampaignButton')
          .click('@selectCampaignButton')
          .waitForElementVisible('@searchForCampaignInput')
          .setValue('@searchForCampaignInput', campaign.name)
          .waitForElementVisible(`[data-id=campaign-${campaign.slug}]`)
          .click(`[data-id=campaign-${campaign.slug}]`)
      } else {
        this.selectContact(contact)
      }

      this.selectContactStatus(contactStatus)

      this
        .waitForElementVisible('@coverageInput')
        .setValue('@coverageInput', text)

      const url = findUrl(text)

      if (url) {
        this.waitForElementVisible(`[href='${url}'][data-id=link-preview]`)
      }

      this
        .waitForElementVisible('@createPostButton')
        .click('@createPostButton')
        // The post box should now "close"
        .waitForElementNotVisible(campaign ? '@selectCampaignButton' : '@selectContactButton')
        .waitForElementNotVisible('@createPostButton')

      return this
    },
    postNeedToKnow: function (contact, text) {
      this
        .waitForElementVisible('@needToKnowTab')
        .click('@needToKnowTab')
        .waitForElementVisible('@needToKnowInput')
        .click('@needToKnowInput')
        .setValue('@needToKnowInput', text)

      const url = findUrl(text)

      if (url) {
        this.waitForElementVisible(`[href='${url}'][data-id=link-preview]`)
      }

      this
        .waitForElementVisible('@createPostButton')
        .click('@createPostButton')
        // The post box should now "close"
        .waitForElementNotVisible('@createPostButton')

      return this
    },
    postFeedbackMessage: function (text) {
      this
        .waitForElementVisible('@feedbackTab')
        .click('@feedbackTab')
        .waitForElementVisible('@feedbackInput')
        .setValue('@feedbackInput', text)
        .waitForElementVisible('@createPostButton')
        .click('@createPostButton')

      return this
    }
  }]
}
