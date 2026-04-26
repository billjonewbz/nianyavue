import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.webp': 'image/webp',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.pdf': 'application/pdf',
  '.wasm': 'application/wasm',
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params
  const relativePath = segments.join('/')

  // Prevent path traversal
  if (relativePath.includes('..') || relativePath.startsWith('/')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const filePath = path.join(process.cwd(), 'vue3/dist', relativePath)
  const ext = path.extname(filePath).toLowerCase()

  try {
    // Try to read the file directly
    const stat = fs.statSync(filePath)
    if (stat.isFile()) {
      const content = fs.readFileSync(filePath)
      const contentType = MIME_TYPES[ext] || 'application/octet-stream'

      // Use immutable cache for hashed files (Vite adds content hashes)
      const isHashed = /[.-][a-f0-9]{8}\./.test(relativePath)
      const headers: Record<string, string> = {
        'Content-Type': contentType,
      }
      if (isHashed) {
        headers['Cache-Control'] = 'public, max-age=31536000, immutable'
      }

      return new NextResponse(content, { headers })
    }
  } catch {
    // File not found - SPA fallback to index.html
  }

  // SPA fallback: return index.html for all non-file routes
  try {
    const htmlPath = path.join(process.cwd(), 'vue3/dist/index.html')
    const html = fs.readFileSync(htmlPath, 'utf-8')
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
