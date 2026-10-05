import TeamMode from '../../82-0-team/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <TeamMode params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'teamMode', '/82-0-team')
}

export function generateStaticParams() {
  return staticLangParams()
}
