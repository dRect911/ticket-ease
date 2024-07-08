
import React from 'react'


import { LocationTable } from '@/components/location-table'


type Props = {}

const locations = (props: Props) => {
  return (
    <div className=' p-4 px-64' >
      <LocationTable />
      
    </div>
  )
}

export default locations