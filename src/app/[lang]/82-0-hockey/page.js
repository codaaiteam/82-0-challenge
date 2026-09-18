import HockeyMode from '../../82-0-hockey/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <HockeyMode params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'hockeyMode', '/82-0-hockey')
}

export function generateStaticParams() {
  return staticLangParams()
}
