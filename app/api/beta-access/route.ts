import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const email = formData.get('email')?.toString()
    const name = formData.get('name')?.toString()
    const company = formData.get('company')?.toString()
    const useCase = formData.get('useCase')?.toString()
    
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Beta access API error:', error)
    return NextResponse.json(
      { error: 'Failed to process beta access request' },
      { status: 500 }
    )
  }
}

// Explicitly define allowed methods
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'POST, OPTIONS',
    },
  })
}