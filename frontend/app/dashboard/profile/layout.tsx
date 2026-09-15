import type {
  ReactNode,
} from 'react'

import LawyerDirectoryPublicationCard from '@/components/dashboard/LawyerDirectoryPublicationCard'


export default function LawyerProfileLayout({
  children,
}: {
  children:
    ReactNode
}) {
  return (
    <>
      <LawyerDirectoryPublicationCard />

      {children}
    </>
  )
}