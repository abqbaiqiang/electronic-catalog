import { redirect } from 'next/navigation'

export default function HomeRedirect({ params }) {
  redirect(`/${params.catalogId}`)
}