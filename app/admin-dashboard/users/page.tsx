import { UserTable } from '@/components/user-table'
import React from 'react'

type Props = {}

const users = (props: Props) => {
  return (
    <div className=' p-4 px-64' >
      <UserTable />
      
    </div>
  )
}

export default users