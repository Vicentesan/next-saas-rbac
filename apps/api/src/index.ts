import { randomUUID } from 'node:crypto'

import { defineAbilityFor } from '@nivo/auth'
import { projectSchema } from '@nivo/auth/src/models/project'

const userId = randomUUID()

const ability = defineAbilityFor({ role: 'MEMBER', id: userId })
const project = projectSchema.parse({ id: randomUUID(), ownerId: userId })

const userCanCreateProject = ability.can('create', 'Project')
const userCanUpdateAnyProject = ability.can('update', 'Project') // erro esta aqui... esta retornando true
const userCanDeleteAnyProject = ability.can('delete', 'Project') // erro esta aqui... esta retornando true

const userCanUpdateHisOwnProject = ability.can('update', project)
const userCanDeleteHisOwnProject = ability.can('delete', project)

console.log('\n/////// can ///////\n')
console.log(`userCanCreateProject: ${userCanCreateProject}`)
console.log(`userCanUpdateAnyProject: ${userCanUpdateAnyProject}`) // erro esta aqui... esta retornando true
console.log(`userCanDeleteAnyProject: ${userCanDeleteAnyProject}`) // erro esta aqui... esta retornando true
console.log(`userCanUpdateHisOwnProject: ${userCanUpdateHisOwnProject}`)
console.log(`userCanDeleteHisOwnProject: ${userCanDeleteHisOwnProject}`)

console.log('\n/////// cannot ///////\n')
