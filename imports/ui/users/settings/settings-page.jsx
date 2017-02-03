import { Meteor } from 'meteor/meteor'
import MasterLists from '../../../api/master-lists/master-lists'
import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { createContainer } from 'meteor/react-meteor-data'
import { SettingsIcon, ChevronRight } from '../../images/icons'
import { CircleAvatar } from '../../images/avatar'
import SettingsProfile from './profile'
import SettingsPassword from './password'
import SettingsTeam from './team'
import CampaignMasterLists from './campaign-master-lists'

const menuItems = [
  {label: 'Profile', slug: 'profile'},
  {label: 'Change Password', slug: 'password'},
  {label: 'Team', slug: 'team'},
  {label: 'Campaigns Lists', slug: 'campaigns-master-lists'}
]

const SettingsPage = React.createClass({
  propTypes: {
    user: PropTypes.object.isRequired,
    masterlists: PropTypes.array,
    params: PropTypes.object
  },
  getInitialState () {
    return {
      selectedMenuItem: this.props.params.selected
    }
  },
  componentWillReceiveProps (props) {
    this.setState({selectedMenuItem: props.params.selected})
  },
  onAddMasterList ({type, name}) {
    Meteor.call('MasterLists/create', {type, name})
  },
  onUpdateMasterList ({_id, name}) {
    Meteor.call('MasterLists/update', {_id, name})
  },
  onDeleteMasterList (_id) {
    Meteor.call('MasterLists/delete', {_id})
  },
  render () {
    const settingsPanel = {
      profile: <SettingsProfile user={this.props.user} />,
      password: <SettingsPassword />,
      team: <SettingsTeam />,
      'campaigns-master-lists': <CampaignMasterLists masterlists={this.props.masterlists} {...this} />
    }
    return (
      <div className='flex max-width-4 mx-auto my4 pt4'>
        <div className='flex-none mr4 xs-hide sm-hide' style={{width: 250}}>
          <article>
            <label className='gray40'><SettingsIcon /> Settings / <span className='gray'>{this.state.selectedMenuItem}</span></label>
            <hr className='flex-auto mx2 py2' style={{height: 1}} />
            {userInfo(this.props.user)}
            {sideNav(this.state.selectedMenuItem)}
          </article>
        </div>
        <div className='flex-auto px2 bg-white'>
          {settingsPanel[this.state.selectedMenuItem || 'profile']}
        </div>
      </div>
    )
  }
})

export default createContainer(() => {
  return {
    user: Meteor.user(),
    masterlists: MasterLists.find().fetch()
  }
}, SettingsPage)

function userInfo (user) {
  return (
    <div className='py3'>
      <CircleAvatar name={user.profile.name} />
      <div className='inline-block align-middle pl2'>
        <div className='f-md semibold gray10'>{user.profile.name}</div>
        <div className='f-xs normal gray20'>{`Organisation name`}</div>
      </div>
    </div>
  )
}

function sideNav (selected) {
  selected = selected || 'profile'
  return (
    <nav className='mt2 bg-white border-top border-left border-right border-gray80'>
      {menuItems.map((navItem) => {
        const activeClass = navItem.slug === selected ? 'active' : ''
        const activeIcon = navItem.slug === selected ? <span className='right pr1'><ChevronRight /></span> : ''
        return (<Link to={`/settings/${navItem.slug}`} key={navItem.slug}>
          <div className={`py4 pl3 pr2 border-bottom border-gray80 active-border-left-blue active-blue ${activeClass}`}>{navItem.label}{activeIcon}</div>
        </Link>)
      })}
    </nav>
  )
}
