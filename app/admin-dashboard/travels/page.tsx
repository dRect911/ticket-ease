import TravelTable from '@/components/travel-table'
import React from 'react'

type Props = {}

const TravelsPage = (props: Props) => {
  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="mx-auto w-full max-w-7xl">
        <TravelTable />
      </div>
    </main>
  )
}

export default TravelsPage