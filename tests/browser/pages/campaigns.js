'use strict'

const editCampaignForm = require('../forms/edit-campaign-form')
const campaignTable = require('../forms/campaign-table')

module.exports = {
  url: 'http://localhost:3000/campaigns',
  elements: {
    newCampaignButton: '[data-id=create-campaign-button]',
    editCampaignButton: '[data-id=edit-campaign-button]',
    myCampaignsButton: '[data-slug=my]'
  },
  sections: {
    editCampaignForm: editCampaignForm,
    campaignTable: campaignTable,
    toast: {
      selector: '[data-id=campaign-actions-toast]',
      elements: {
        viewContacts: '[data-id=campaign-actions-view-contacts]',
        addToCampaignList: '[data-id=campaign-actions-add-to-campaign-list]',
        addToMyCampaigns: '[data-id=campaign-actions-add-to-my-campaigns]',
        addTagsToCampaign: '[data-id=campaign-actions-add-tags]',
        deleteCampaigns: '[data-id=campaign-actions-delete]'
      },
      commands: [{
        viewContacts: function () {
          this
            .waitForElementVisible('@viewContacts')
            .click('@viewContacts')

          return this
        },
        openAddToCampaignListsModal: function () {
          this
            .waitForElementVisible('@addToCampaignList')
            .click('@addToCampaignList')

          return this
        },
        favouriteCampaigns: function () {
          this
            .waitForElementVisible('@addToMyCampaigns')
            .click('@addToMyCampaigns')

          return this
        },
        openAddTagsToCampaignModal: function () {
          this
            .waitForElementVisible('@addTagsToCampaign')
            .click('@addTagsToCampaign')

          return this
        }
      }]
    },
    campaignListsModal: {
      selector: '[data-id=add-to-list-modal]',
      elements: {
        saveButton: '[data-id=add-to-list-modal-save-button]',
        cancelButton: '[data-id=add-to-list-modal-cancel-button]',
        manageListsButton: '[data-id=add-to-list-modal-manage-lists-button]'
      },
      commands: [{
        selectCampaignList: function (campaignList) {
          const selector = `[data-id=master-list-button][data-item='${campaignList._id}']`

          this
            .waitForElementVisible(selector)
            .click(selector)

          return this
        },
        save: function () {
          this
            .waitForElementVisible('@saveButton')
            .click('@saveButton')

          return this
        }
      }]
    },
    tagSelectorModal: {
      selector: '[data-id=tag-selector-modal]',
      elements: {
        searchInput: '[data-id=tag-search-input]',
        saveButton: '[data-id=tag-selector-modal-save-button]',
        cancelButton: '[data-id=tag-selector-modal-cancel-button]',
      }
    }
  },
  commands: [{
    navigateToCampaignList: function (campaignList) {
      this.api.url('http://localhost:3000/campaigns?list=' + campaignList.slug)
      this.waitForElementVisible(this.section.campaignTable.selector)

      return this
    },
    navigateToMyCampaigns: function () {
      this.navigate()
        .waitForElementVisible('@myCampaignsButton')
        .click('@myCampaignsButton')
        .waitForElementVisible(this.section.campaignTable.selector)

      return this
    }
  }]
}
