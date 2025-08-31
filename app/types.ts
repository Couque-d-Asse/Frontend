export interface UserAnswer {
    questionId: string
    question: string
    answer: string
    timestamp: Date
}

export interface FormData {
    complaintType: string
    location: string
    date: string
    time: string
    phone: string
    phoneNumber: string
    verificationCode: string
    name: string
    title: string
    content: string
    vehicleNumber: string
    shareContent: string
    personalInfoType: string
    email: string
    privacyConsent: string
    photos: File[]
    publicStatus: string
    notificationMethod: string
    sameComplaint: string
    notesAgreement: string
    privacyAgreement: string
}

// types.ts 수정
export interface Question {
    id: string;
    question: string;
    subtitle?: string;  // 이 줄 추가 (선택적 속성)
    inputType: "text" | "textarea" | "select" | "date" | "time" | "phone" | "file" | "ai-generator";
    field: keyof FormData;
    placeholder?: string;
    options?: string[];
}

export interface Law {
    title: string
    content: string
    draft: string
}

export interface SituationAnalysis {
    service: string
    reason: string
    violationType: string
    aiRecommendation?: any // AI 서버 응답 저장용
}

export interface AIGenerationState {
    isGenerating: boolean;
    generatedContent: string;
    error: string | null;
}

export interface AIGeneratedComplaint {
    title: string
    content: string
    category: string
    keywords: string[]
    tone: 'formal' | 'polite' | 'assertive'
    estimatedProcessingTime?: string
}