import React, { PropTypes } from 'react'
import classNames from 'classnames/dedupe'

const defaultSize = 30

const Avatar = React.createClass({
  propTypes: {
    avatar: PropTypes.string,
    name: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    size: PropTypes.number
  },

  getInitialState () {
    return { imageLoadError: false }
  },

  componentWillReceiveProps ({ avatar }) {
    if (avatar !== this.props.avatar) this.setState({ imageLoadError: false })
  },

  onError () {
    this.setState({ imageLoadError: true })
  },

  resizeAvatar (url, size) {
    if (url.indexOf('ucarecdn') === -1) return url
    return `${url}-/scale_crop/${size}x${size}/center/`
  },

  render () {
    const { imageLoadError } = this.state
    const { avatar, name } = this.props
    const className = classNames(this.props.className, 'inline-block overflow-hidden white align-middle center semibold')
    const size = Number(this.props.size || defaultSize) // px
    const fontSize = ((size / defaultSize) * 13).toFixed(0) + 'px'
    const style = Object.assign({ width: size, height: size, lineHeight: size + 'px', fontSize }, this.props.style || {})

    if (avatar && !imageLoadError) {
      const src = this.resizeAvatar(avatar, size * 2) // @2x for hdpi

      return (
        <div className={className} style={style}>
          <img style={{width: '100%', height: '100%'}} src={src} alt={name} title={name} onError={this.onError} />
        </div>
      )
    }

    if (name) {
      const initials = name
        .split(' ')
        .filter((n) => !!n)
        .map((n) => n[0].toUpperCase())
        .join('')

      return (
        <div style={style} className={classNames(className, 'initials')} title={name}>{initials}</div>
      )
    }

    return <div style={style} className={className} />
  }
})

export default Avatar

export const CircleAvatar = (props) => {
  const className = classNames(props.className, 'circle bg-gray60')
  return <Avatar {...props} className={className} />
}

export const SquareAvatar = (props) => {
  const className = classNames(props.className, 'rounded bg-black')
  return <Avatar {...props} className={className} />
}
