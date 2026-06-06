import WhatIs820 from '../../82-0/page'
import { pageMetadata, staticLangParams } from '@/lib/pageMeta'

export default function Page({ params }) {
  return <WhatIs820 params={params} />
}

export async function generateMetadata({ params }) {
  return pageMetadata(params?.lang, 'whatIs', '/82-0')
}

export function generateStaticParams() {
  return staticLangParams()
}
