import { ability } from '@nivo/auth'

const userCanInviteSomeoneElse = ability.can('invite', 'User') // true
const userCanDeleteDeleteOtherUsers = ability.can('delete', 'User') // false

const userCannotDeleteOtherUsers = ability.cannot('delete', 'User') // true

console.log(`\n ////// can ///// \n`)

console.log('userCanInviteSomeoneElse: ' + userCanInviteSomeoneElse)
console.log('userCanDeleteDeleteOtherUsers: ' + userCanDeleteDeleteOtherUsers)

console.log(`\n ////// cannot ///// \n`)

console.log('userCannotDeleteOtherUsers: ' + userCannotDeleteOtherUsers)
