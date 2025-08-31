"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Upload, ArrowLeft, ArrowRight, BookOpen } from "lucide-react"
import FaceBlurProcessor from "@/components/FaceBlurProcessor"
import { createBookmarklet, generateMayorDraft } from '@/lib/api'

import { UserAnswer, FormData, Question } from './types'
import {
    INITIAL_QUESTION,
    VIOLATION_TYPE_OPTIONS,
    SAFETY_REPORT_QUESTIONS,
    DONGDAEMUN_REPORT_QUESTIONS,
    MAYOR_REQUEST_QUESTIONS,
    RELATED_LAWS
} from './constants'
import { analyzeSituation, copyText, mapToApiPayload } from './utils'
import {
    Header,
    QuestionDisplay,
    ProgressIndicator,
    NavigationButtons,
    LawSection,
    BookmarkletSection
} from './components'

export default function ComplaintChatbot() {
    
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [currentInput, setCurrentInput] = useState("")
    const [formData, setFormData] = useState<FormData>({
        complaintType: "",
        location: "",
        date: "",
        time: "",
        phone: "",
        phoneNumber: "",
        verificationCode: "",
        name: "",
        title: "",
        content: "",
        vehicleNumber: "",
        shareContent: "",
        personalInfoType: "",
        email: "",
        privacyConsent: "",
        photos: [],
        publicStatus: "",
        notificationMethod: "",
        sameComplaint: "",
        notesAgreement: "",
        privacyAgreement: "",
    })
    const [isTyping, setIsTyping] = useState(false)
    const [showOptions, setShowOptions] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)
    const [slideDirection, setSlideDirection] = useState<"left" | "right">("right")
    const [questions, setQuestions] = useState<Question[]>([INITIAL_QUESTION])
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
    const [showAnswerReview, setShowAnswerReview] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const [isProcessingImage, setIsProcessingImage] = useState(false)
    const [situationAnalysis, setSituationAnalysis] = useState<string>("")
    const [recommendedService, setRecommendedService] = useState<string>("")
    const [recommendedViolationType, setRecommendedViolationType] = useState<string>("")
    const [aiDraft, setAiDraft] = useState<string>("")
    const [aiDraftLoading, setAiDraftLoading] = useState<boolean>(false);
    const [aiDraftError, setAiDraftError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [showFaceBlurProcessor, setShowFaceBlurProcessor] = useState(false)
    const [bookmarklet, setBookmarklet] = useState<{ url: string; code: string } | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false) // AI 분석 중 상태

    const fileInputRef = useRef<HTMLInputElement>(null)
    const currentQuestion = questions[currentQuestionIndex]

    const moveToNextQuestion = async (answer: string) => {
        setUserAnswers((prev) => [
            ...prev.filter((a) => a.questionId !== currentQuestion.id),
            {
                questionId: currentQuestion.id,
                question: currentQuestion.question,
                answer: answer,
                timestamp: new Date(),
            },
        ])

        setFormData((prev) => ({
            ...prev,
            [currentQuestion.field]: answer,
        }))

        setIsTyping(true)
        setShowOptions(false)

        // AI 분석이 필요한 경우
        if (currentQuestion.id === "situation-input") {
            setIsAnalyzing(true)
        }

        setTimeout(async () => {
            setIsTyping(false)
            setSlideDirection("right")

            if (currentQuestion.id === "situation-input") {
                try {
                    const analysis = await analyzeSituation(answer)
                    setSituationAnalysis(analysis.reason)
                    setRecommendedService(analysis.service)
                    setRecommendedViolationType(analysis.violationType)

                    // 표준 출력 템플릿 (대안 채널 표시 제거)
                    let mainChannel = analysis.service
                    if (analysis.aiRecommendation?.recommendedChannel) {
                        const recommendedOption = analysis.aiRecommendation.options?.find(
                            (opt: any) => opt.id === analysis.aiRecommendation.recommendedChannel
                        )
                        if (recommendedOption) {
                            mainChannel = recommendedOption.title
                        }
                    }
                    const sections: string[] = []
                    sections.push(`판단 사유: "${analysis.reason}"`)
                    sections.push(`추천 민원 창구: ${mainChannel}`)
                    const questionText = sections.join("\n")

                    // 동적으로 옵션 생성 (항상 3개: 1) 메인+선택, 2) 나머지 2개)
                    const options: string[] = []

                    // 채널 명칭 정규화 함수 (공백/특수문자 제거, 소문자 비교 + 한국어 키워드)
                    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "").replace(/[^가-힣a-z0-9]/g, "")
                    const channelKey = (name: string) => {
                        const n = normalize(name)
                        if (n.includes("안전신문고")) return "safety"
                        if (n.includes("새올") || n.includes("전자민원")) return "saeol"
                        if (n.includes("구청장")) return "mayor"
                        return n // 알 수 없는 경우 그대로 반환
                    }
                    const labels: Record<string, string> = {
                        safety: "안전신문고",
                        saeol: "동대문구 새올 전자민원창구",
                        mayor: "구청장에게 바란다",
                    }
                    const order = ["safety", "saeol", "mayor"]

                    const mainKey = channelKey(mainChannel)
                    const primaryLabel = labels[mainKey] ?? mainChannel

                    // 1) 메인 채널 선택 버튼
                    options.push(`${primaryLabel} 선택`)

                    // 2) 나머지 두 채널(중복 제거, 고정 순서) 추가
                    for (const key of order) {
                        if (options.length >= 3) break
                        const label = labels[key]
                        if (!label) continue
                        if (normalize(label) === normalize(primaryLabel)) continue // 메인과 중복 방지
                        if (!options.some(o => normalize(o.replace(/ 선택$/, "")) === normalize(label))) {
                            options.push(label)
                        }
                    }

                    // 혹시 3개가 안 채워졌다면, 남은 기본 채널들로 보충 (중복 방지)
                    if (options.length < 3) {
                        for (const key of order) {
                            if (options.length >= 3) break
                            const label = labels[key]
                            if (!label) continue
                            if (normalize(label) === normalize(primaryLabel)) continue
                            if (!options.some(o => normalize(o.replace(/ 선택$/, "")) === normalize(label))) {
                                options.push(label)
                            }
                        }
                    }
                    setQuestions((prev) => [
                        ...prev,
                        {
                            id: "service-recommendation",
                            question: questionText,
                            inputType: "select",
                            field: "complaintType",
                            options: options,
                        },
                    ])
                } catch (error) {
                    console.error('AI 분석 실패:', error)
                    // 에러 시 기본 메시지
                    setQuestions((prev) => [
                        ...prev,
                        {
                            id: "service-recommendation",
                            question: "AI 분석에 실패했습니다. 직접 민원 창구를 선택해주세요.",
                            inputType: "select",
                            field: "complaintType",
                            options: ["안전신문고", "동대문구 새올 전자민원창구", "구청장에게 바란다"],
                        },
                    ])
                } finally {
                    setIsAnalyzing(false)
                }
                setCurrentQuestionIndex(1)
            } else if (currentQuestion.id === "service-recommendation") {
                // 선택한 서비스에 따라 분기 처리
                const selectedService = answer.replace(" 선택", "") // "선택" 제거

                if (selectedService === "안전신문고" || answer.includes("안전신문고")) {
                    const violationTypeQuestion: Question = {
                        id: "violation-type",
                        question: `자동차·교통 위반 신고 유형을 선택해 주세요.\n\nAI가 분석한 결과, "${recommendedViolationType}"이 가장 적합한 것으로 판단됩니다.`,
                        inputType: "select",
                        field: "complaintType",
                        options: [
                            recommendedViolationType,
                            ...VIOLATION_TYPE_OPTIONS.filter(option => option !== recommendedViolationType)
                        ],
                    }
                    setQuestions([INITIAL_QUESTION, violationTypeQuestion, ...SAFETY_REPORT_QUESTIONS])
                    setCurrentQuestionIndex(2)
                } else if (selectedService === "동대문구 새올 전자민원창구" || answer.includes("동대문구 새올 전자민원창구")) {
                    setQuestions([INITIAL_QUESTION, ...DONGDAEMUN_REPORT_QUESTIONS])
                    setCurrentQuestionIndex(2)
                } else if (selectedService === "구청장에게 바란다" || answer.includes("구청장에게 바란다")) {
                    {
                        // Build explicit question flow for "구청장에게 바란다" in intended order:
                        // 1. 개인정보 동의
                        // 2. 연락처 입력
                        // 3. 이메일 입력
                        // 4. 제목 입력
                        // 5. 민원 내용 입력
                        // 6. AI 응답 생성
                        // 7. 첨부파일
                        // 8. 문자 알림
                        // 9. 공개 여부
                        const mayorQuestions: Question[] = [
                            {
                                id: "mayor-privacy",
                                question: "개인정보 수집·이용에 동의하시나요?",
                                inputType: "select",
                                field: "privacyAgreement",
                                options: ["동의", "비동의"]
                            },
                            {
                                id: "mayor-phone",
                                question: "연락처(휴대폰 번호)를 입력해 주세요. (인증 가능)",
                                inputType: "phone",
                                field: "phoneNumber",
                                placeholder: "010-1234-5678"
                            },
                            {
                                id: "mayor-email",
                                question: "이메일 주소를 입력해 주세요.",
                                inputType: "text",
                                field: "email",
                                placeholder: "you@example.com"
                            },
                            {
                                id: "mayor-title",
                                question: "민원 제목을 입력해 주세요.",
                                inputType: "text",
                                field: "title",
                                placeholder: "예) 불법주차로 인한 보행자 안전 위협 신고"
                            },
                            {
                                id: "mayor-content",
                                question: "민원 내용을 작성해 주세요. (관련 법령을 참고할 수 있어요)",
                                inputType: "textarea",
                                field: "content",
                                placeholder: "상황을 구체적으로 작성해 주세요. 날짜/시간/위치/상세 상황 등을 포함하면 좋아요."
                            },
                            {
                                id: "ai-generated-response",
                                question: "AI가 입력하신 내용을 바탕으로 민원 초안을 생성했어요. 검토 후 다음 단계로 진행하세요.",
                                inputType: "ai-generator",
                                field: "shareContent"
                            },
                            {
                                id: "mayor-files",
                                question: "증빙 파일(이미지/영상)을 첨부해 주세요. (얼굴 자동 블러 처리 지원)",
                                inputType: "file",
                                field: "photos"
                            },
                            {
                                id: "mayor-notification-method",
                                question: "답변 알림 방법을 선택하세요. 휴대전화 문자알림을 선택하세요.",
                                inputType: "select",
                                field: "notificationMethod",
                                options: ["신청", "신청 안함"]
                            },
                            {
                                id: "mayor-public-status",
                                question: "본 민원을 공개/비공개 중에서 선택해 주세요.",
                                inputType: "select",
                                field: "publicStatus",
                                options: ["공개", "비공개"]
                            }
                        ]
                        setQuestions([INITIAL_QUESTION, ...mayorQuestions])
                        setCurrentQuestionIndex(2)
                    }
                }
            } else if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex((prev) => prev + 1)
            } else {
                setIsCompleted(true)
                setQuestions((prev) => [
                    ...prev,
                    {
                        id: "completion",
                        question:
                            "민원 작성을 위한 준비가 완료되었습니다! 🎉\n수집된 정보를 바탕으로 구청장에게 바란다에서 민원을 작성하실 수 있습니다.\n초안이 작성 완료되었습니다.",
                        inputType: "select",
                        field: "complaintType",
                        options: ["구청장에게 바란다 바로가기"],
                    },
                ])
                setCurrentQuestionIndex((prev) => prev + 1)
            }

            setTimeout(() => {
                setShowOptions(true)
            }, 300)
        }, 1500)
    }

    const moveToPreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setSlideDirection("left")
            setShowOptions(false)
            setTimeout(() => {
                const prevIndex = currentQuestionIndex - 1
                setCurrentQuestionIndex(prevIndex)
                const previousQuestion = questions[prevIndex]
                const previousAnswer = userAnswers.find((a) => a.questionId === previousQuestion.id)
                if (previousAnswer) {
                    setCurrentInput(previousAnswer.answer)
                } else {
                    setCurrentInput("")
                }
                setTimeout(() => setShowOptions(true), 300)
            }, 200)
        }
    }

    const moveToNextAnsweredQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setSlideDirection("right")
            setShowOptions(false)
            setTimeout(() => {
                const nextIndex = currentQuestionIndex + 1
                setCurrentQuestionIndex(nextIndex)
                const nextQuestion = questions[nextIndex]
                const nextAnswer = userAnswers.find((a) => a.questionId === nextQuestion.id)
                if (nextAnswer) {
                    setCurrentInput(nextAnswer.answer)
                } else {
                    setCurrentInput("")
                }
                setTimeout(() => setShowOptions(true), 300)
            }, 200)
        }
    }

    const canMoveToNext = () => {
        return (
            currentQuestionIndex < questions.length - 1 &&
            userAnswers.some((a) => a.questionId === questions[currentQuestionIndex + 1]?.id)
        )
    }

    const handleSubmit = () => {
        if (!currentInput.trim() && currentQuestion.inputType !== "file") return
        if (currentQuestion.inputType === "select") return
        moveToNextQuestion(currentInput)
        setCurrentInput("")
    }

    const handleOptionSelect = (option: string) => {
        if (option === "안전신문고 바로가기") {
            window.open("https://www.safe182.go.kr/", "_blank")
            return
        }
        if (option === "구청장에게 바란다 바로가기") {
            window.open("https://www.ddm.go.kr/chief/addCvplRceptWebView.do?key=3828&cvplCode=DSTLDR&step=3", "_blank")
            return
        }
        if (option === "북마클릿 생성하기") {
            handleGenerateBookmarklet()
            return
        }
        moveToNextQuestion(option)
    }

    const handleFileUpload = async (files: FileList | null) => {
        if (!files) return

        const fileArray = Array.from(files)
        setUploadedFiles(fileArray)

        const imageFile = fileArray.find(file => file.type.startsWith('image/'))

        if (imageFile) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setSelectedImage(e.target?.result as string)
                setShowFaceBlurProcessor(true)
            }
            reader.readAsDataURL(imageFile)
        } else {
            const fileNames = fileArray.map((f) => f.name).join(", ")
            moveToNextQuestion(`${fileArray.length}개의 파일 업로드 완료: ${fileNames}`)
        }
    }


    const handleGenerateBookmarklet = async () => {
        try {
            setErrorMsg(null)
            setIsGenerating(true)
            const payload = mapToApiPayload(formData)
            const res = await createBookmarklet(payload as any)
            setBookmarklet({
                url: (res as any)?.bookmarkletUrl || "",
                code: (res as any)?.bookmarkletCode || "",
            })
        } catch (e: any) {
            setErrorMsg(e?.message || "생성 중 오류가 발생했습니다.")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleLawClick = (law: typeof RELATED_LAWS[0]) => {
        setCurrentInput(law.draft)
    }

    useEffect(() => {
        setTimeout(() => setShowOptions(true), 1000)
    }, [])
    useEffect(() => {
        const q = questions[currentQuestionIndex];
        if (q?.id === "ai-generated-response") {
            const run = async () => {
                try {
                    setAiDraftError(null);
                    setAiDraftLoading(true);

                    // 상황 요약 필드명 확인: INITIAL_QUESTION.field가 "summary"인지 꼭 확인!
                    const summary = (formData as any).summary || formData.content || "";
                    const title = formData.title || "(제목 미입력)";
                    // 법령 선택 로직 붙이기 전까지는 빈 배열로
                    const legal_basis: string[] = [];

                    const text = await generateMayorDraft({ summary, title, legal_basis });
                    setAiDraft(text && text.trim() ? text : `제목: ${title}\n\n[민원 초안]\n${formData.content || ""}`);
                } catch (e: any) {
                    setAiDraftError(e?.message || "초안 생성 중 오류가 발생했습니다.");
                } finally {
                    setAiDraftLoading(false);
                }
            };
            run();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentQuestionIndex]);
    const renderInputArea = () => {
        if (isAnalyzing) {
            return (
                <div className="mb-6">
                    <div className="flex flex-col items-center gap-3 p-6 bg-blue-50 border border-blue-200 rounded-2xl animate-fade-in">
                        <div className="flex gap-1">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                        </div>
                        <span className="text-sm font-semibold text-blue-800">AI가 상황을 분석하고 있습니다...</span>
                        <span className="text-xs text-blue-600">최적의 민원 창구를 추천해 드릴게요</span>
                    </div>
                </div>
            )
        }

        if (isTyping) {
            return (
                <div className="mb-6">
                    <div className="flex items-center gap-1 p-3">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                        </div>
                        <span className="text-sm text-muted-foreground ml-2">AI 도우미가 입력 중...</span>
                    </div>
                </div>
            )
        }

        // Custom AI preview screen between content and file
        if (currentQuestion.inputType === "ai-generator" && showOptions) {
            const draftText = aiDraft?.trim();

            return (
                <div className="space-y-4 animate-fade-in-up">
                    <div className="p-4 rounded-2xl border-2 bg-card">
                        <h3 className="font-semibold mb-2">🤖 AI 생성 초안</h3>

                        {aiDraftLoading && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2"></div>
                                초안을 생성하고 있습니다...
                            </div>
                        )}

                        {!aiDraftLoading && aiDraftError && (
                            <div className="text-sm text-red-600">{aiDraftError}</div>
                        )}

                        {!aiDraftLoading && !aiDraftError && (
                            <pre className="whitespace-pre-wrap text-sm leading-relaxed">{draftText}</pre>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={() => copyText(draftText || "")}
                            variant="outline"
                            className="flex-1 rounded-2xl"
                            disabled={!draftText}
                        >
                            초안 복사
                        </Button>
                        <Button
                            onClick={() => moveToNextQuestion("AI 초안 확인")}
                            className="flex-1 rounded-2xl shadow-lg"
                        >
                            다음 단계로 진행
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        * 이 초안은 입력하신 상황/제목/내용을 서버에서 생성한 결과입니다. 다음 단계에서 파일 첨부와 개인정보 동의 등을 이어서 진행합니다.
                    </p>
                </div>
            );
        }

        if (currentQuestion.inputType === "select" && showOptions) {
            return (
                <div className="space-y-3">
                    {currentQuestion.options?.map((option, index) => (
                        <button
                            key={option}
                            onClick={() => handleOptionSelect(option)}
                            className={`
        w-full p-4 text-left rounded-2xl border-2 transition-all duration-300
        bg-card hover:bg-card/80 border-border hover:border-primary/50
        shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]
        animate-fade-in-up font-medium text-foreground
    `}
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm">{option}</span>
                                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </button>
                    ))}
                    {currentQuestion.id === "completion" && (
                        <BookmarkletSection
                            bookmarklet={bookmarklet}
                            isGenerating={isGenerating}
                            errorMsg={errorMsg}
                            copyText={copyText}
                        />
                    )}
                </div>
            )
        }

        if (currentQuestion.inputType === "file" && showOptions) {
            if (showFaceBlurProcessor && selectedImage) {
                return (
                    <div className="animate-fade-in-up space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-900 mb-2">🔒 개인정보 보호 처리</h3>
                            <p className="text-sm text-blue-800">
                                업로드된 이미지에서 얼굴을 자동으로 감지하여 블러 처리합니다.
                                처리된 이미지를 다운로드하여 민원 작성 시 사용하세요.
                            </p>
                        </div>

                        <FaceBlurProcessor
                            imageSrc={selectedImage}
                            onProcessingChange={setIsProcessingImage}
                        />

                        <div className="space-y-3">
                            <Button
                                onClick={() => {
                                    setShowFaceBlurProcessor(false)
                                    setSelectedImage(null)
                                    setUploadedFiles([])
                                }}
                                className="w-full h-12 rounded-2xl shadow-lg bg-card text-foreground border-2 border-border font-medium hover:bg-card/80 hover:border-primary/50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                다른 이미지 선택
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowFaceBlurProcessor(false)
                                    setSelectedImage(null)
                                    const fileNames = uploadedFiles.map((f) => f.name).join(", ")
                                    moveToNextQuestion(`${uploadedFiles.length}개의 파일 업로드 완료: ${fileNames}`)
                                }}
                                className="w-full h-12 rounded-2xl shadow-lg bg-card text-foreground border-2 border-border font-medium hover:bg-card/80 hover:border-primary/50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                다음 단계로 진행
                            </Button>
                        </div>
                    </div>
                )
            }

            return (
                <div className="animate-fade-in-up space-y-4">
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessingImage}
                        className="w-full h-32 border-dashed border-2 border-primary/30 hover:border-primary/50 rounded-2xl bg-card hover:bg-card/80 transition-all duration-300 flex flex-col items-center justify-center gap-3 shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                        {isProcessingImage ? (
                            <>
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <span className="font-medium text-foreground">개인정보 보호용으로 변환 중...</span>
                            </>
                        ) : (
                            <>
                                <Upload className="h-8 w-8 text-primary" />
                                <span className="text-sm font-medium text-foreground">파일 선택 또는 드래그</span>
                                <span className="text-xs text-muted-foreground">개인정보 보호용으로 변환됩니다</span>
                            </>
                        )}
                    </button>

                    {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                            {uploadedFiles.map((file, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-card rounded-xl border">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-medium">{file.name}</span>
                                    <Badge variant="secondary" className="text-xs">
                                        보호용
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )
        }

        if (currentQuestion.inputType === "textarea" && showOptions) {
            if (currentQuestion.id === "situation-input") {
                return (
                    <div className="space-y-3 animate-fade-in-up">
                        <div className="space-y-3">
                            <textarea
                                value={currentInput}
                                onChange={(e) => setCurrentInput(e.target.value)}
                                placeholder={currentQuestion.placeholder || "상황을 자세히 설명해 주세요..."}
                                className="w-full h-32 p-4 text-sm rounded-2xl border-2 focus:border-primary/50 resize-none bg-card"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && e.ctrlKey) {
                                        handleSubmit()
                                    }
                                }}
                            />
                            <div className="flex justify-between items-center text-xs text-muted-foreground w-full">
                                <span className="font-semibold">Ctrl + Enter로 전송</span>
                                <span className="font-mono bg-primary/10 px-3 py-1 rounded-full text-primary">
                                    {currentInput.length}/500
                                </span>
                            </div>
                            <Button
                                onClick={handleSubmit}
                                className="w-full h-12 rounded-2xl shadow-lg"
                                disabled={!currentInput.trim()}
                            >
                                <Send className="h-4 w-4 mr-2" />
                                <span className="text-sm">상황 분석하기</span>
                            </Button>
                        </div>
                    </div>
                )
            }

            // 신고 내용 작성 화면에서만 관련 법령 섹션 표시
            return (
                <div className="space-y-3 animate-fade-in-up">
                    <LawSection relatedLaws={RELATED_LAWS} onLawClick={handleLawClick} />

                    <div className="space-y-3">
                        <textarea
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            placeholder={currentQuestion.placeholder || "상황을 자세히 설명해 주세요..."}
                            className="w-full h-32 p-4 text-sm rounded-2xl border-2 focus:border-primary/50 resize-none bg-card"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && e.ctrlKey) {
                                    handleSubmit()
                                }
                            }}
                        />
                        <div className="flex justify-between items-center text-xs text-muted-foreground w-full">
                            <span className="font-semibold">Ctrl + Enter로 전송</span>
                            <span className="font-mono bg-primary/10 px-3 py-1 rounded-full text-primary">
                                {currentInput.length}/500
                            </span>
                        </div>
                        <Button
                            onClick={handleSubmit}
                            className="w-full h-12 rounded-2xl shadow-lg"
                            disabled={!currentInput.trim()}
                        >
                            <Send className="h-4 w-4 mr-2" />
                            <span className="text-sm">내용 작성 완료</span>
                        </Button>
                    </div>
                </div>
            )
        }

        if (!["select", "file", "textarea"].includes(currentQuestion.inputType) && showOptions) {
            return (
                <div className="space-y-3 animate-fade-in-up">
                    <div className="flex gap-3">
                        <Input
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            placeholder={currentQuestion.placeholder || "답변을 입력하세요..."}
                            className="flex-1 h-12 sm:h-14 text-sm rounded-2xl border-2 focus:border-primary/50"
                            type={
                                currentQuestion.inputType === "date"
                                    ? "date"
                                    : currentQuestion.inputType === "time"
                                        ? "time"
                                        : currentQuestion.inputType === "phone"
                                            ? "tel"
                                            : "text"
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSubmit()
                                }
                            }}
                        />
                        <Button
                            onClick={handleSubmit}
                            size="icon"
                            className="h-12 sm:h-14 w-12 sm:w-14 rounded-2xl shadow-lg"
                            disabled={!currentInput.trim()}
                        >
                            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                    </div>
                </div>
            )
        }

        return null
    }

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-muted/20">
            {/* Header */}
            <Header
                isCompleted={isCompleted}
                userAnswers={userAnswers}
                showAnswerReview={showAnswerReview}
                setShowAnswerReview={setShowAnswerReview}
            />

            {/* Question Slide Container */}
            <div className="flex-1 relative overflow-y-auto">
                <div
                    className={`w-full h-full transition-transform duration-500 ease-out ${slideDirection === "right" ? "animate-slide-in-right" : "animate-slide-in-left"
                        }`}
                    key={currentQuestionIndex}
                >
                    <div className="min-h-full flex flex-col justify-center p-4 sm:p-6 w-full max-w-[800px] mx-auto">
                        {/* Question */}
                        <div className="space-y-4">
                            <QuestionDisplay currentQuestion={currentQuestion} />

                            {/* Input Area */}
                            <div className="space-y-4">{renderInputArea()}</div>

                            {/* Navigation Buttons */}
                            <NavigationButtons
                                currentQuestionIndex={currentQuestionIndex}
                                canMoveToNext={canMoveToNext()}
                                isCompleted={isCompleted}
                                moveToPreviousQuestion={moveToPreviousQuestion}
                                moveToNextAnsweredQuestion={moveToNextAnsweredQuestion}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Indicator */}
            <ProgressIndicator
                questions={questions}
                currentQuestionIndex={currentQuestionIndex}
                isCompleted={isCompleted}
            />
        </div>
    )
}