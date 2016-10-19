import React from 'react'
function setSvg () { return {__html: '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M1 1.99A1 1 0 0 1 2.007 1h11.986C14.55 1 15 1.451 15 1.99v4.02c0 .546-.45.99-1.007.99H2.007A1.004 1.004 0 0 1 1 6.01V1.99zM1 10c0-.552.45-1 1.007-1h11.986a1 1 0 1 1 0 2H2.007A1.001 1.001 0 0 1 1 10zm0 4c0-.552.45-1 1.007-1h11.986c.556 0 1.007.444 1.007 1 0 .552-.45 1-1.007 1H2.007A1.001 1.001 0 0 1 1 14z" fill="#437AF4" fill-rule="evenodd"/></svg>'} }
function FeedCoverageIcon () { return (<span className="svg-icon svg-icon-feed-coverage-icon" dangerouslySetInnerHTML={setSvg()}></span>) }
export default FeedCoverageIcon
