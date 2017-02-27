import React, { PropTypes } from 'react'
import SearchBox from '../lists/search-box'
import Campaign from '../campaigns/campaign-list-item'

const itemMatchesTerm = (item, term) => {
  if (!item) return
  return item.toLowerCase().substring(0, term.length) === term.toLowerCase()
}

const CampaignsFilterableList = React.createClass({
  propTypes: {
    contact: PropTypes.object,
    campaigns: PropTypes.array,
    onFilter: PropTypes.func.isRequired,
    onClearFilter: PropTypes.func
  },
  getInitialState () {
    return { filteredCampaigns: this.props.campaigns || [] }
  },
  componentWillReceiveProps (props) {
    this.setState({ filteredCampaigns: props.campaigns })
  },
  onTermChange (term) {
    const { campaigns } = this.props
    const filteredCampaigns = campaigns.filter((c) => itemMatchesTerm(c.name, term) || itemMatchesTerm(c.client.name, term))
    this.setState({ filteredCampaigns })
  },
  render () {
    const { onFilter, contact, onClearFilter } = this.props
    const { filteredCampaigns } = this.state
    const styleOverrides = {
      backgroundColor: 'white',
      position: 'absolute',
      left: 0,
      right: 0,
      borderTop: 'solid 0px',
      borderRight: 'solid 0px',
      borderLeft: 'solid 0px'
    }
    return (
      <nav className='overflow-scroll' style={{maxHeight: 377}}>
        <SearchBox onTermChange={this.onTermChange} placeholder='Search campaigns' style={styleOverrides} />
        <div className='absolute left-0 right-0 f-sm semibold p3 bg-gray90 border-bottom border-gray80 pointer' style={{top: 51}} onClick={onClearFilter}>All campaigns ({filteredCampaigns.length})</div>
        <div style={{paddingTop: 98}}>
          {filteredCampaigns.map((item, i) => (
            <div
              key={item._id}
              className={`px3 py2 pointer border-transparent border-bottom ${i !== 0 ? 'border-top' : ''} hover-bg-gray90 hover-border-gray80`}
              onClick={() => onFilter(item)}>
              <Campaign campaign={item} contact={contact} />
            </div>
          ))}
        </div>
      </nav>
    )
  }
})

export default CampaignsFilterableList
