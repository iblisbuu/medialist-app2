import React from 'react'
import PropTypes from 'prop-types'
import StatusSelector from '/imports/ui/feedback/status-selector'
import { createFeedbackPost } from '/imports/api/posts/methods'

class StatusSelectorContainer extends React.Component {
  static propTypes = {
    contact: PropTypes.object.isRequired,
    campaign: PropTypes.object.isRequired,
    children: PropTypes.func.isRequired,
    compact: PropTypes.bool,
    dropdown: PropTypes.shape({
      left: PropTypes.number,
      width: PropTypes.number,
      arrowAlign: PropTypes.string,
      arrowMarginRight: PropTypes.string,
      arrowMarginLeft: PropTypes.string
    })
  }

  onStatusChange = (event) => {
    createFeedbackPost.call({
      contactSlug: this.props.contact.slug,
      campaignSlug: this.props.campaign.slug,
      status: event.target.value
    })
  }

  render () {
    const {
      contact,
      campaign,
      children,
      compact,
      ...props
    } = this.props
    let status = null
    if (contact && contact.status) {
      status = contact.status
    } else if (campaign && campaign.status) {
      status = campaign.status
    } else if (campaign && campaign.contacts && contact) {
      status = campaign.contacts.find(c => c.slug === contact.slug)
    }
    return (
      <StatusSelector
        {...props}
        status={status}
        onChange={this.onStatusChange}
        children={children(status)}
        compact={compact}
        dropdown={this.props.dropdown}
      />
    )
  }
}

export default StatusSelectorContainer
