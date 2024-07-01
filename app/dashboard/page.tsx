
"use client"
import withAuth from "@/lib/withAuth"


function Dashboard() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
<div className="flex flex-col justify-center mx-auto text-center" >
  <p className='text-5xl font-bold'>This will be the dashboard</p>
  <p className='text-3xl font-medium'>If you got here you are logged in</p>
</div>
      
    </main>
  )
}

export default withAuth(Dashboard);