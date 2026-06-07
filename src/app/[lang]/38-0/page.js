import ThirtyEight from '../../38-0/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <ThirtyEight params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'thirtyEight', '/38-0')
}

export function generateStaticParams() {
  return staticLangParams()
}
