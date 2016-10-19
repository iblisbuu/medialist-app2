import React from 'react'
function setSvg () { return {__html: '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M13 1l2 2-7 7-2.5.5L6 8l7-7zm-.5 8.5L14 8v5.5c0 .276-.229.5-.5.5h-11a.504.504 0 0 1-.5-.5v-11c0-.276.229-.5.5-.5H8L6.5 3.5H4.01a.506.506 0 0 0-.51.51v7.98c0 .288.228.51.51.51h7.98c.288 0 .51-.228.51-.51V9.5z" fill="#BFC8D7" fill-rule="evenodd"/></svg>'} }
function EditIcon () { return (<span className="svg-icon svg-icon-edit-icon" dangerouslySetInnerHTML={setSvg()}></span>) }
export default EditIcon
