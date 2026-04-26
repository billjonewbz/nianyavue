import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const htmlPath = path.join(process.cwd(), 'vue3/dist/index.html')
  try {
    const html = fs.readFileSync(htmlPath, 'utf-8')
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch {
    return new NextResponse('Vue3 app not built. Run: cd vue3 && npm run build', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}
