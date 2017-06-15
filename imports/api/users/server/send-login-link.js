import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import findOrCreateUser from './find-or-create-user'

const sendEmailLogInLink = (email) => {
  const domain = email.split('@').pop()
  const validDomain = Meteor.settings.public.authentication.emailDomains
    .concat(Meteor.settings.public.authentication.extraEmailDomains)
    .some(validDomain => domain === validDomain)

  if (!validDomain) {
    console.warn(`User tried to log in with invalid email domain '${domain}'`)

    throw new Meteor.Error('INVALID_EMAIL')
  }

  const user = findOrCreateUser(email)

  if (Meteor.settings.authentication.sendLink) {
    Meteor.defer(() => {
      Accounts.sendLoginEmail(user._id, email)
    })

    return
  }

  // mark email verified
  Accounts.addEmail(user._id, email, true)

  // just sign the user in, only used for browser tests..
  const stampedLoginToken = Accounts._generateStampedLoginToken()
  Accounts._insertLoginToken(user._id, stampedLoginToken)

  return stampedLoginToken
}

export default sendEmailLogInLink
