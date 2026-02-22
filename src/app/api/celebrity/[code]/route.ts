import { NextRequest, NextResponse } from 'next/server'
import { getCelebritiesByCode } from '@/data/celebrities'

/**
 * GET /api/celebrity/[code]
 * Returns celebrity matches for a given pillar code
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { code: string } }
) {
    try {
        const { code } = params

        // Validate code format
        if (!code || code.length === 0) {
            return NextResponse.json(
                { error: 'Pillar code is required' },
                { status: 400 }
            )
        }

        // Get celebrities
        const celebrities = getCelebritiesByCode(code.toUpperCase())

        if (celebrities.length === 0) {
            return NextResponse.json(
                {
                    error: 'No celebrities found for this pillar',
                    code,
                    message: 'Celebrity data is being prepared. Check back soon!'
                },
                { status: 404 }
            )
        }

        return NextResponse.json({
            code,
            celebrities,
            count: celebrities.length
        })

    } catch (error) {
        console.error('Celebrity API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
