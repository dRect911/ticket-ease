import Link from 'next/link'
 
export default async function NotFound() {
  return (
    <div>
      <h2>Error 404: Not Found</h2>
      <p>Could not find requested resource</p>
      <p>
        Go back <Link href="/">home</Link>
      </p>
    </div>
  )
}