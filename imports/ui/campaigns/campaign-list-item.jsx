import React from 'react'
import CampaignPreview from './campaign-preview'
import StatusLabel from '../feedback/status-label'

export default ({campaign, contact}) => {
  const slug = contact ? contact.slug : null
  const status = campaign.contacts[slug]
  return (
    <div className='flex items-center'>
      <div className='flex-auto pr3'>
        <CampaignPreview {...campaign} />
      </div>
      <div className='flex-none' style={{width: 173}}>
        <Status name={status} />
      </div>
    </div>
  )
}

const Status = ({ name }) => {
  if (!name) return null
  return <StatusLabel name={name} />
}
