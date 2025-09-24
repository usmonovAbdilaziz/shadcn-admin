import { type conversations } from './convo.json'

export type CharacterUser = (typeof conversations)[number]
export type Convo = CharacterUser['messages'][number]
