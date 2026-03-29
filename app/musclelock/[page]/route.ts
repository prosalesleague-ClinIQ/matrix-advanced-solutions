import { readFileSync } from 'fs'
import { join } from 'path'

const ALLOWED = ['science.html', 'challenge.html', 'atlas.html']

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ page: string }> }
) {
  const { page } = await params
  if (!ALLOWED.includes(page)) {
    return new Response('Not Found', { status: 404 })
  }
  const html = readFileSync(
    join(process.cwd(), 'public/musclelock', page),
    'utf8'
  )
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
