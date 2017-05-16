import { createContainer } from 'meteor/react-meteor-data'
import { searchOutlets } from '/imports/api/contacts/methods'
import ValidatedAutocomplete from '/imports/ui/forms/validated-autocomplete'

const OutletAutocomplete = createContainer((props) => {
  const {field, value: term} = props
  if (!term || term.length < 1) return {suggestions: []}
  const suggestions = searchOutlets.call({field, term})
  return {suggestions}
}, ValidatedAutocomplete)

export default OutletAutocomplete
