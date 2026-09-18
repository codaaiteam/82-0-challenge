import BetterTeam from '../../82-0-better-team/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <BetterTeam params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'betterTeam', '/82-0-better-team')
}

export function generateStaticParams() {
  return staticLangParams()
}
