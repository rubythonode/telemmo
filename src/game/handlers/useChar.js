import {
  partial,
  tap,
  always,
  nth,
} from 'ramda'

import { ObjectId } from 'mongodb'

import { reject, rejectUndefined } from './errors'

function useChar (dao, playerId, char) {
  return dao.player.update(
    { _id: playerId },
    { $set: { currentCharId: char.id } },
  ).then(always(char))
}

export default function call (dao, provider, _, msg) {
  const charId = msg.matches[1]

  if (!ObjectId.isValid(charId)) {
    return reject(msg, _('Character ID is not a valid key ID'))
  }

  return dao.character
    .find({
      _id: ObjectId(charId),
      playerId: msg.player.id,
    })
    .then(nth(0))
    .then(rejectUndefined(msg, _('This character for this player was not found.')))
    .then(partial(useChar, [dao, msg.player.id]))
    .then(char => ({
      to: msg.chat,
      text: _('You are now using <b>%s</b>', char.name),
    }))
}

