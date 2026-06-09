import OtherSports from '../../82-0-for-other-sports/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <OtherSports params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'otherSports', '/82-0-for-other-sports')
}

export function generateStaticParams() {
  return staticLangParams()
}
