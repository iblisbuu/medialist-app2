import React from 'react'
function setSvg () { return {__html: '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path fill="#BFC8D7" d="M8 12.39l-4.326 2.275.826-4.818L1 6.436l4.837-.703L8 1.35l2.163 4.383L15 6.436l-3.5 3.411.826 4.818z" fill-rule="evenodd"/></svg>'} }
function FavouritesIcon () { return (<span className="svg-icon svg-icon-favourites-icon" dangerouslySetInnerHTML={setSvg()}></span>) }
export default FavouritesIcon
