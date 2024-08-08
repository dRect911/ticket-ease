import { TicketTable } from '@/components/ticket-table'
import React from 'react'

type Props = {}

const tickets = (props: Props) => {
  return (
    <div className=' p-4 px-64' >
      <TicketTable />
    </div>
  )
  
}

export default tickets