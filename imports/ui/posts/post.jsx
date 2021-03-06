import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import dasherise from 'dasherize'
import { CircleAvatar } from '/imports/ui/images/avatar'
import Time from '/imports/ui/time/time'
import YouOrName from '/imports/ui/users/you-or-name'
import Status from '/imports/ui/feedback/status'
import LinkPreview from '/imports/ui/feedback/link-preview'
import CampaignPreview from '/imports/ui/campaigns/campaign-preview'
import CampaignLink from '/imports/ui/campaigns/campaign-link'
import {
  ChevronRight,
  ChevronOpenDown
} from '/imports/ui/images/icons'
import PostIcon from './post-icon'
import { Dropdown, DropdownMenu, DropdownMenuItem } from '/imports/ui/navigation/dropdown'
import findUrl from '/imports/lib/find-url'
import DeletePostModal from './delete-post-modal'
import EditPostModal from './edit-post-modal'
import { GREY60 } from '/imports/ui/colours'
import { ContactAvatarList } from '/imports/ui/lists/avatar-list'
import { pinPost, unpinPost } from '/imports/api/posts/methods'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'

const hideTextIfOnlyUrl = (item) => {
  const url = findUrl(item.message)
  const embed = (item.embeds && item.embeds[0]) || {}
  const embedUrls = embed.urls || []

  if (embed.url && !embedUrls.includes(embed.url)) {
    embedUrls.push(embed.url)
  }

  // only a url was pasted and we have an embed that matches so hide the url
  if (url === item.message && embedUrls.indexOf(url) !== -1) {
    return null
  }

  const lines = item.message
    .trim()
    .split('\n')
    .map(line => line.trim())

  // the last line of the post is the same as the embed url so hide it
  if (embedUrls.includes(lines[lines.length - 1])) {
    lines.pop()
  }

  // remove trailing blank lines
  for (let i = lines.length - 1; i >= 0; i--) {
    if (!lines[i].trim()) {
      lines.pop()
    } else {
      break
    }
  }

  // if the last line of the post ends with one of the urls from the embed, hide it
  embedUrls.forEach(url => {
    let lastLine = lines.pop()

    if (lastLine && lastLine.endsWith(url)) {
      lastLine = lastLine.substring(0, lastLine.length - url.length).trim()
    }

    // there was still text on the line so re-add it to the list
    if (lastLine) {
      lines.push(lastLine)
    }
  })

  return (
    <p>{
      formatText(lines)
    }</p>
  )
}

const formatText = (lines) => {
  return lines
    .map((line, index, list) => {
      const url = findUrl(line)
      const elements = url ? turnLinksIntoClickableAnchors(line, index) : [<span key={`line-${index}`}>{line}</span>]

      if (index < (list.length - 1)) {
        elements.push(<br key={`line-${index}-break`} />)
      }

      return elements
    })
}

const turnLinksIntoClickableAnchors = (line, index) => {
  let url = findUrl(line)
  const elements = []
  let subIndex = 0

  while (url) {
    const urlStartIndex = line.indexOf(url)
    const urlEndIndex = urlStartIndex + url.length

    if (urlStartIndex > 0) {
      elements.push(<span key={`line-${index}-${subIndex}-start`}>{line.substring(0, urlStartIndex)}</span>)
    }

    elements.push(<a href={url} target='_blank' key={`line-${index}-${subIndex}-url`} className='blue'>{url}</a>)

    const restOfLine = line.substring(urlEndIndex)
    url = findUrl(restOfLine)

    if (!url && urlEndIndex < line.length) {
      elements.push(<span key={`line-${index}-${subIndex}-end`}>{line.substring(urlEndIndex)}</span>)
    }

    line = restOfLine
  }

  return elements
}

const Post = withSnackbar(class Post extends React.Component {
  static propTypes = {
    _id: PropTypes.string.isRequired,
    summary: PropTypes.any,
    details: PropTypes.any,
    createdBy: PropTypes.object,
    createdAt: PropTypes.object,
    currentUser: PropTypes.object,
    type: PropTypes.string,
    bgClass: PropTypes.string,
    contacts: PropTypes.array,
    campaign: PropTypes.object,
    editable: PropTypes.bool,
    pinnable: PropTypes.bool,
    pinned: PropTypes.bool,
    snackbar: PropTypes.object
  }

  static defaultProps = {
    bgClass: 'bg-white'
  }

  state = {
    menuOpen: false,
    deleteOpen: false,
    editOpen: false
  }

  openMenu = () => {
    this.setState({
      menuOpen: true,
      deleteOpen: false
    })
  }

  closeMenu = () => {
    this.setState({
      menuOpen: false,
      deleteOpen: false,
      editOpen: false
    })
  }

  editPost = () => {
    this.setState({
      menuOpen: false,
      editOpen: true
    })
  }

  deletePost = () => {
    this.setState({
      menuOpen: false,
      deleteOpen: true
    })
  }

  onPinClick = () => {
    this.setState({menuOpen: false})

    pinPost.call({ _id: this.props._id }, (err) => {
      if (err) {
        this.props.snackbar.error('pin-post-failure')
        return console.error(err)
      }
      this.props.snackbar.show('Need-to-know pinned')
    })
  }

  onUnpinClick = () => {
    this.setState({menuOpen: false})

    unpinPost.call({ _id: this.props._id }, (err) => {
      if (err) {
        this.props.snackbar.error('unpin-post-failure')
        return console.error(err)
      }
      this.props.snackbar.show('Need-to-know unpinned')
    })
  }

  render () {
    const data = {
      'data-contact': this.props.contacts.map(contact => contact.slug).join(' '),
      'data-campaign': this.props.campaigns.map(campaign => campaign.slug).join(' ')
    }

    const postTypeLabels = {
      'FeedbackPost': 'feedback',
      'CoveragePost': 'coverage',
      'NeedToKnowPost': 'need-to-know'
    }

    const {deletable, pinnable, pinned} = this.props

    const editable = this.props.editable && (this.props.createdBy._id === this.props.currentUser._id)

    return (
      <article className={`flex rounded px4 pt3 pb2 mb2 shadow-2 ${this.props.bgClass}`} data-id={dasherise(this.props.type)} {...data}>
        <div className='flex-none' style={{paddingTop: 1}}>
          <CircleAvatar size={38} avatar={this.props.createdBy.avatar} name={this.props.createdBy.name} style={{marginRight: 13}} />
          <PostIcon type={this.props.type} />
        </div>
        <div className='flex-auto' style={{paddingLeft: 13}}>
          <header className='pt2 pb3 f-md flex nowrap' data-id='post-header'>
            <YouOrName className='semibold gray10' currentUser={this.props.currentUser} user={this.props.createdBy} />
            <div className='flex-auto truncate' style={{paddingLeft: 3}}>{this.props.summary}</div>
            <span className='f-sm semibold gray60 flex-none'>
              <Time date={this.props.updatedAt || this.props.createdAt} />
            </span>
            {(deletable || editable) ? (
              <Dropdown className='f-sm semibold gray60 flex-none' data-id='post-menu'>
                <ChevronOpenDown onClick={this.openMenu} data-id='open-post-menu-button' className='ml1' style={{fill: GREY60}} />
                <DropdownMenu width={180} left={-150} top={-2} arrowPosition='top' arrowAlign='right' arrowMarginRight='11px' open={this.state.menuOpen} onDismiss={this.closeMenu}>
                  <nav className='pt1'>
                    {pinnable && (
                      <DropdownMenuItem
                        onClick={pinned ? this.onUnpinClick : this.onPinClick}
                        data-id={pinned ? 'unpin-post-button' : 'pin-post-button'}>
                        <span className='ml2 gray20 regular'>
                          {pinned ? 'Unpin' : 'Pin'} {postTypeLabels[this.props.type]}
                        </span>
                      </DropdownMenuItem>
                    )}
                    {editable && (
                      <DropdownMenuItem
                        onClick={this.editPost}
                        data-id='edit-post-button'>
                        <span className='ml2 gray20 regular'>Edit {postTypeLabels[this.props.type]}</span>
                      </DropdownMenuItem>
                    )}
                    {deletable && (
                      <DropdownMenuItem
                        onClick={this.deletePost}
                        data-id='delete-post-button'>
                        <span className='ml2 gray20 regular'>Delete</span>
                      </DropdownMenuItem>
                    )}
                  </nav>
                </DropdownMenu>
              </Dropdown>
            ) : null}
          </header>
          {this.props.details}
        </div>
        { deletable && (
          <DeletePostModal
            open={this.state.deleteOpen}
            post={{_id: this.props._id, type: this.props.type}}
            onDelete={this.closeMenu}
            onDismiss={this.closeMenu} />
        )}
        { editable && (
          <EditPostModal
            contact={this.props.contact}
            campaign={this.props.campaign}
            open={this.state.editOpen}
            post={this.props}
            onDismiss={this.closeMenu} />
        )}
      </article>
    )
  }
})

const ContactLink = ({contact, showOutlet = true, ...props}) => {
  if (!contact) {
    return <span className='gray60'>Unknown</span>
  }

  let outlet = null

  if (showOutlet && contact.outlets && contact.outlets.length && contact.outlets[0].label) {
    outlet = <span className='gray10' data-id='contact-outlet'> ({contact.outlets[0].label})</span>
  }

  return (
    <Link to={`/contact/${contact.slug}`} data-id='contact-link' {...props}>
      <span className='semibold gray10' data-id='contact-name'>{contact.name}</span>
      {outlet}
    </Link>
  )
}

const ContactName = ({contacts, contact, onContactPage}) => {
  if (onContactPage && contact) {
    return <span data-id='contact-name'>{firstName(contact)}</span>
  }

  if (contacts.length > 1) {
    const primary = contact || contacts[0]
    const otherContacts = contacts.filter((c) => c.slug !== primary.slug).length
    const name = contact ? firstName(primary) : <ContactLink contact={primary} showOutlet={false} />
    return (
      <span>
        <span data-id='contact-name' className='semibold gray10'>{name}</span>
        {` and ${otherContacts} other contact${otherContacts > 1 ? 's' : ''}`}
      </span>
    )
  }

  return <ContactLink contact={contacts[0]} />
}

const CampaignName = ({campaigns, onCampaignPage}) => {
  if (onCampaignPage) {
    return null
  }

  return <CampaignLink campaign={campaigns[0]} />
}

const firstName = ({name}) => name.split(' ')[0]

const PostSummary = ({children, status}) => (
  <span className='nowrap flex'>
    <span className='truncate align-middle'>
      {children}
    </span>
    { status &&
      <span className='flex-none align-middle' data-id='contact-status'>
        <Status status={status} />
      </span>
    }
  </span>
)

const FeedbackPostSummary = ({label, campaigns, contacts, status, contact, campaign}) => {
  let campaignLink = null

  if (!campaign && campaigns && campaigns.length) {
    campaignLink = (
      <span>
        <ChevronRight className='gray60 mx1' />
        <CampaignLink campaign={campaigns[0]} />
      </span>
    )
  }

  let contactLink = null

  if (!contact && contacts && contacts.length) {
    contactLink = (
      <span>
        <ChevronRight className='gray60 mx1' />
        <ContactLink contact={contacts[0]} />
      </span>
    )
  }

  return (
    <PostSummary status={status}>
      <span className='gray10' data-id='post-summary'>
        {label}
      </span>
      {campaignLink}
      {contactLink}
    </PostSummary>
  )
}

export const FeedbackPost = ({item, currentUser, contact, campaign}) => (
  <Post
    {...item}
    contact={contact}
    campaign={campaign}
    currentUser={currentUser}
    summary={<FeedbackPostSummary {...item} label='logged feedback' contact={contact} campaign={campaign} />}
    details={
      <div className='border-gray80 border-top gray10' data-id='post-message'>
        {hideTextIfOnlyUrl(item)}
        {item.embeds && item.embeds[0] ? (
          <div className='pb2 mt4'>
            <LinkPreview {...item.embeds[0]} />
          </div>
        ) : null}
      </div>
    }
    editable
    deletable
  />
)

export const CoveragePost = ({item, currentUser, contact, campaign}) => (
  <Post
    {...item}
    contact={contact}
    campaign={campaign}
    currentUser={currentUser}
    summary={<FeedbackPostSummary {...item} label='logged coverage' contact={contact} campaign={campaign} />}
    details={
      <div className='border-gray80 border-top gray10' data-id='post-message'>
        {hideTextIfOnlyUrl(item)}
        {item.embeds && item.embeds[0] ? (
          <div className='pb2 mt4'>
            <LinkPreview {...item.embeds[0]} />
          </div>
        ) : null}
      </div>
    }
    editable
    deletable
  />
)

export const NeedToKnowPost = ({item, currentUser, contact}) => (
  <Post
    {...item}
    bgClass='bg-yellow-lighter'
    currentUser={currentUser}
    summary={<FeedbackPostSummary {...item} label='shared a need-to-know' contact={contact} />}
    details={
      <div className='border-gray80 border-top gray10' data-id='post-message'>
        {hideTextIfOnlyUrl(item)}
        {item.embeds && item.embeds[0] ? (
          <div className='pb2 mt4'>
            <LinkPreview {...item.embeds[0]} />
          </div>
        ) : null}
      </div>
    }
    pinned={!!item.pinnedAt}
    editable
    deletable
    pinnable
  />
)

export const StatusUpdate = ({item, currentUser, contact, campaign}) => {
  let details = null

  if (item.contacts.length > 1 && !contact) {
    details = (
      <div className='border-gray80 border-top gray10'>
        <ContactAvatarList items={item.contacts} className='my0 pt3 pb0 left' maxAvatars={9} />
      </div>
    )
  }

  return (
    <Post
      {...item}
      currentUser={currentUser}
      summary={
        <PostSummary {...item}>
          <span data-id='post-summary'>updated</span> <ContactName contacts={item.contacts} contact={contact} onContactPage={Boolean(contact)} />
          {!campaign ? ' for ' : ''}
          <CampaignName campaigns={item.campaigns} onCampaignPage={Boolean(campaign)} />
        </PostSummary>
      }
      details={details}
    />
  )
}

export const AddContactsToCampaign = ({item, currentUser, contact, campaign}) => {
  let details = null

  if (item.contacts.length > 1) {
    details = (
      <div className='border-gray80 border-top gray10'>
        <ContactAvatarList items={item.contacts} className='my0 pt3 pb0 left' maxAvatars={9} />
      </div>
    )
  }

  return (
    <Post
      {...item}
      currentUser={currentUser}
      summary={
        <span data-id='post-summary'>
          added <ContactName contacts={item.contacts} contact={contact} onContactPage={Boolean(contact)} />
          {!campaign ? ' to ' : ''}
          <CampaignName campaigns={item.campaigns} onCampaignPage={Boolean(campaign)} />
        </span>
      }
      details={contact ? null : details}
    />
  )
}

export const CreateCampaign = ({item, currentUser, campaign}) => {
  const {slug, avatar, name, clientName} = item.campaigns[0]
  return (
    <Post
      {...item}
      currentUser={currentUser}
      summary='created this campaign'
      details={!campaign &&
        <div className='border-gray80 border-top pt2'>
          <Link key={slug} to={`/campaign/${slug}`} className='block py1' title={name}>
            <CampaignPreview name={name} avatar={avatar} clientName={clientName} />
          </Link>
        </div>
      }
    />
  )
}
