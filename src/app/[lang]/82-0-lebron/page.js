import LebronMode from '../../82-0-lebron/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <LebronMode params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'lebronMode', '/82-0-lebron')
}

export function generateStaticParams() {
  return staticLangParams()
}
