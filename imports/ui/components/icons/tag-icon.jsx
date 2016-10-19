import React from 'react'
function setSvg () { return {__html: '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M1.657 9.93a.931.931 0 0 1 .006-1.32L8.61 1.663c.366-.366 1.087-.638 1.593-.608l3.549.208c.514.03.955.48.985.985l.208 3.55c.03.513-.24 1.224-.608 1.592L7.39 14.337a.931.931 0 0 1-1.32.006L1.657 9.93zm9.547-3.707a1.35 1.35 0 1 0 0-2.7 1.35 1.35 0 0 0 0 2.7z" fill="#BFC8D7" fill-rule="evenodd"/></svg>'} }
function TagIcon () { return (<span className="svg-icon svg-icon-tag-icon" dangerouslySetInnerHTML={setSvg()}></span>) }
export default TagIcon
