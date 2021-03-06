import React from 'react'
import PropTypes from 'prop-types'
import Toast from '/imports/ui/navigation/toast'
import Tooltip from '/imports/ui/navigation/tooltip'
import {
  FavouritesIcon,
  ListIcon,
  TagIcon,
  DeleteIcon,
  ViewIcon
} from '/imports/ui/images/icons'

class ContactCampaignsActionsToast extends React.Component {
  static propTypes = {
    campaigns: PropTypes.array.isRequired,
    onViewClick: PropTypes.func.isRequired,
    onSectorClick: PropTypes.func.isRequired,
    onFavouriteClick: PropTypes.func.isRequired,
    onTagClick: PropTypes.func.isRequired,
    onDeleteClick: PropTypes.func.isRequired,
    onDeselectAllClick: PropTypes.func.isRequired
  }

  render () {
    const {
      campaigns,
      onViewClick,
      onSectorClick,
      onFavouriteClick,
      onTagClick,
      onDeleteClick,
      onDeselectAllClick
    } = this.props

    return (
      <Toast>
        { campaigns.length && (
          <div className='bg-white shadow-1 p4 flex items-center' key='CampaignsActionsToast' data-id='campaign-actions-toast'>
            <div className='flex-none'>
              <span className='badge f-sm bg-blue mr2'>{campaigns.length}</span>
              <span className='gray20'>campaign{campaigns.length === 1 ? '' : 's'} selected</span>
            </div>
            <div className='flex-auto center'>
              <Tooltip title='View Contacts'>
                <ViewIcon
                  className='mx3 pointer gray60 hover-blue'
                  onClick={() => onViewClick(campaigns)}
                  data-id='campaign-actions-view-contacts'
                  style={{width: '21px', height: '21px'}} />
              </Tooltip>
              <Tooltip title='Add to Campaign List'>
                <ListIcon
                  className='mx3 pointer gray60 hover-blue'
                  onClick={() => onSectorClick(campaigns)}
                  data-id='campaign-actions-add-to-campaign-list'
                  style={{width: '21px', height: '21px'}} />
              </Tooltip>
              <Tooltip title='Add to My Campaigns'>
                <FavouritesIcon
                  className='mx3 pointer gray60 hover-gold'
                  onClick={() => onFavouriteClick(campaigns)}
                  data-id='campaign-actions-add-to-my-campaigns'
                  style={{width: '21px', height: '21px'}} />
              </Tooltip>
              <Tooltip title='Add Tags'>
                <TagIcon
                  className='mx3 pointer gray60 hover-blue'
                  onClick={() => onTagClick(campaigns)}
                  data-id='campaign-actions-add-tags'
                  style={{width: '21px', height: '21px'}} />
              </Tooltip>
              <Tooltip title={`Remove contact from campaign${campaigns.length > 1 ? 's' : ''}`}>
                <DeleteIcon
                  className='mx3 pointer gray60 hover-red'
                  onClick={() => onDeleteClick(campaigns)}
                  data-id='campaign-actions-remove-contacts'
                  style={{width: '21px', height: '21px'}} />
              </Tooltip>
            </div>
            <div className='flex-none'>
              <button className='btn btn-no-border bg-transparent grey40' onClick={() => onDeselectAllClick(campaigns)}>Deselect all</button>
            </div>
          </div>
        )}
      </Toast>
    )
  }
}

export default ContactCampaignsActionsToast
