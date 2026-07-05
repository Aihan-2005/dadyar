import { LawyerProfile } from '@/types/lawyer'

export async function getLawyerProfile() {
  console.log('GET Lawyer Profile')

  return null
}

export async function saveLawyerProfile(payload: LawyerProfile) {
  console.log('SAVE Lawyer Profile')

  console.log(payload)

  return payload
}

export async function updateLawyerProfile(payload: LawyerProfile) {
  console.log('UPDATE Lawyer Profile')

  console.log(payload)

  return payload
}