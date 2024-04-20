import { randomUUID } from 'node:crypto'

import { defineAbilityFor } from '@nivo/auth'
import { projectSchema } from '@nivo/auth/src/models/project'

const userId = randomUUID()

const ability = defineAbilityFor({ role: 'MEMBER', id: userId })
const project = projectSchema.parse({ id: randomUUID(), ownerId: userId })

const anotherProject = projectSchema.parse({
  id: randomUUID(),
  ownerId: randomUUID(),
})

const userCanCreateProject = ability.can('create', 'Project')
const userCanUpdateAnyProject = ability.can('update', anotherProject)
const userCanDeleteAnyProject = ability.can('delete', anotherProject)

const userCanUpdateHisOwnProject = ability.can('update', project)
const userCanDeleteHisOwnProject = ability.can('delete', project)

const userCannotCreateProject = ability.cannot('create', 'Project')
const userCannotUpdateAnyProject = ability.cannot('update', anotherProject)
const userCannotDeleteAnyProject = ability.cannot('delete', anotherProject)

const userCannotUpdateHisOwnProject = ability.cannot('update', project)
const userCannotDeleteHisOwnProject = ability.cannot('delete', project)

console.log('\n/////// can ///////\n')

console.log(`userCanCreateProject: ${userCanCreateProject}`)
console.log(`userCanUpdateAnyProject: ${userCanUpdateAnyProject}`)
console.log(`userCanDeleteAnyProject: ${userCanDeleteAnyProject}`)
console.log(`userCanUpdateHisOwnProject: ${userCanUpdateHisOwnProject}`)
console.log(`userCanDeleteHisOwnProject: ${userCanDeleteHisOwnProject}`)

console.log('\n/////// cannot ///////\n')

console.log(`userCannotCreateProject: ${userCannotCreateProject}`)
console.log(`userCannotUpdateAnyProject: ${userCannotUpdateAnyProject}`)
console.log(`userCannotDeleteAnyProject: ${userCannotDeleteAnyProject}`)
console.log(`userCannotUpdateHisOwnProject: ${userCannotUpdateHisOwnProject}`)
console.log(`userCannotDeleteHisOwnProject: ${userCannotDeleteHisOwnProject}`)
