import React from 'react'
import PropTypes from 'prop-types'
import SignInLayout from '/imports/ui/sign-in/sign-in-layout'

const InvalidTokenPage = ({ onRetry }) => {
  const content = (
    <div className='bg-white max-width-2 mt6 p5 mx-auto shadow-2'>
      <p className='semibold f-sm grey10'>The sign in link was invalid or has expired, please try again</p>
      <button className='btn bg-blue white my3' data-id='back-to-login-form-button' onClick={onRetry}>Okay</button>
      <p className='gray40 f-sm'>Having trouble signing in? Please email us at <a href='mailto:feedback@medialist.io'>feedback@medialist.io</a></p>
    </div>
  )

  return <SignInLayout content={content} />
}

InvalidTokenPage.propTypes = {
  onRetry: PropTypes.func
}

export default InvalidTokenPage
