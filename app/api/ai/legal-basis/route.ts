import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:8000'

    try {
        const body = await request.json()

        // AI 서버로 요청 전달
        const response = await fetch(`${AI_SERVER_URL}/api/legal-basis/candidates`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        })

        if (!response.ok) {
            console.error('AI Server error:', response.status)
            throw new Error(`AI Server responded with ${response.status}`)
        }

        const data = await response.json()
        return NextResponse.json(data)

    } catch (error) {
        console.error('Legal basis proxy error:', error)

        // 에러 시 기본 응답 반환
        return NextResponse.json({
            keywords: [],
            candidates: [],
            basis: [],
            summary: ""
        })
    }
}