import React from 'react'
function setSvg () { return {__html: '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zM7 7.498C7 7.223 7.214 7 7.505 7h.99c.279 0 .505.215.505.498v4.004a.494.494 0 0 1-.505.498h-.99A.496.496 0 0 1 7 11.502V7.498zM7 5c0-.552.444-1 1-1 .552 0 1 .444 1 1 0 .552-.444 1-1 1-.552 0-1-.444-1-1z" fill="#FF934B" fill-rule="evenodd"/></svg>'} }
function FeedNeedToKnowIcon () { return (<span className="svg-icon svg-icon-feed-need-to-know-icon" dangerouslySetInnerHTML={setSvg()}></span>) }
export default FeedNeedToKnowIcon
