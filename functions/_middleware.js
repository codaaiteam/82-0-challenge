// Cloudflare Pages root middleware — canonical host enforcement.
//
// The apex (non-www) host 82-0-challenge.com was serving 200 directly instead
// of redirecting to the canonical https://www.82-0-challenge.com. Pages
// `_redirects` cannot express a domain-level (host-based) redirect — it matches
// on path only, so a `/*` rule would also loop www onto itself — and the zone
// has no apex->www rule. A root _middleware runs on every request for this
// project (apex + www both resolve to it), so we do the host check here.
//
// Only the exact apex host is rewritten to www (301, path + query preserved).
// www and *.pages.dev fall straight through. Any unexpected error falls through
// to next() so this can never take the site down.
export async function onRequest(context) {
  try {
    const url = new URL(context.request.url)
    if (url.hostname === '82-0-challenge.com') {
      url.hostname = 'www.82-0-challenge.com'
      return Response.redirect(url.toString(), 301)
    }
  } catch (e) {
    // fall through — serving the request normally is always safe
  }
  return context.next()
}
