import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Upload, ArrowLeft, ArrowRight, BookOpen } from "lucide-react"
import Image from "next/image"
import FaceBlurProcessor from "@/components/FaceBlurProcessor"
import { Question, Law } from './types'
import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Copy, Check } from 'lucide-react';
import { generateComplaintContent } from '@/lib/api';
interface HeaderProps {
    isCompleted: boolean
    userAnswers: any[]
    showAnswerReview: boolean
    setShowAnswerReview: (show: boolean) => void
}

export const Header: React.FC<HeaderProps> = ({
    isCompleted,
    userAnswers,
    showAnswerReview,
    setShowAnswerReview
}) => (
    <div className="bg-gradient-to-br from-primary via-primary to-secondary text-primary-foreground p-6 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
        <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1 shadow-lg border border-white/20">
                    <Image
                        src="/dongdaemun-logo.png"
                        alt="동대문구 로고"
                        width={32}
                        height={32}
                        className="object-contain"
                        priority
                    />
                </div>
                <div>
                    <h1 className="font-bold text-base tracking-tight">동대문구 스마트 민원 서비스</h1>
                    <p className="text-xs opacity-90 font-medium">AI가 민원 작성을 쉽고 빠르게 도와드립니다</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {isCompleted && userAnswers.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAnswerReview(!showAnswerReview)}
                        className="text-white hover:bg-white/20 transition-all duration-200 text-xs"
                    >
                        답변 확인 ({userAnswers.length})
                    </Button>
                )}
            </div>
        </div>

        {showAnswerReview && (
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 max-h-40 overflow-y-auto">
                <h3 className="font-semibold text-sm mb-3">입력한 답변들</h3>
                <div className="space-y-2">
                    {userAnswers.map((answer: any, index: number) => (
                        <div key={index} className="text-xs bg-white/10 rounded-lg p-2">
                            <div className="font-medium opacity-90">{answer.question.split("\n")[0]}</div>
                            <div className="text-white/80 mt-1">{answer.answer}</div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
)

interface QuestionDisplayProps {
    currentQuestion: Question
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ currentQuestion }) => (
    <div className="flex items-center gap-6 mb-6 animate-fade-in w-full">
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 p-1">
                <Image
                    src="/dongdaemun-mascot.png"
                    alt="동대문구 마스코트"
                    width={72}
                    height={72}
                    className="object-contain"
                    priority
                />
            </div>
            <Badge
                variant="outline"
                className="text-xs font-medium px-3 py-1 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-primary/20 shadow-sm"
            >
                AI 도우미
            </Badge>
        </div>

        <div className="flex-1 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 leading-relaxed whitespace-pre-wrap" style={{ whiteSpace: 'pre-wrap' }}>
                {currentQuestion.question}
            </h2>
            {currentQuestion.subtitle && (
                currentQuestion.id === "privacy-agreement" ? (
                    <div className="max-h-60 overflow-y-auto bg-blue-50/50 border border-blue-200/50 rounded-2xl p-4 animate-fade-in-up">
                        <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-wrap">{currentQuestion.subtitle}</p>
                    </div>
                ) : currentQuestion.id === "notes-agreement" ? (
                    <div className="bg-blue-50/50 border border-blue-200/50 rounded-2xl p-4 animate-fade-in-up">
                        <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-wrap">{currentQuestion.subtitle}</p>
                    </div>
                ) : (
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{currentQuestion.subtitle}</p>
                )
            )}
        </div>
    </div>
)

interface ProgressIndicatorProps {
    questions: Question[]
    currentQuestionIndex: number
    isCompleted: boolean
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
    questions,
    currentQuestionIndex,
    isCompleted
}) => {
    if (questions.length <= 1 || isCompleted || currentQuestionIndex === 0) return null

    return (
        <div className="bg-card/80 backdrop-blur-sm p-4 border-t border-border/50">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-3 w-full max-w-[800px] mx-auto">
                <span className="font-semibold">진행률</span>
                <span className="font-mono bg-primary/10 px-3 py-1 rounded-full text-primary">
                    {currentQuestionIndex}/{questions.length - 1}
                </span>
            </div>
            <div className="w-full bg-background rounded-full h-2 shadow-inner border border-border/30 max-w-[800px] mx-auto">
                <div
                    className="bg-gradient-to-r from-primary via-secondary to-accent h-2 rounded-full transition-all duration-700 shadow-sm relative overflow-hidden"
                    style={{
                        width: `${(currentQuestionIndex / (questions.length - 1)) * 100}%`,
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>
            </div>
        </div>
    )
}

interface NavigationButtonsProps {
    currentQuestionIndex: number
    canMoveToNext: boolean
    isCompleted: boolean
    moveToPreviousQuestion: () => void
    moveToNextAnsweredQuestion: () => void
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
    currentQuestionIndex,
    canMoveToNext,
    isCompleted,
    moveToPreviousQuestion,
    moveToNextAnsweredQuestion
}) => {
    if ((currentQuestionIndex === 0 && !canMoveToNext) || isCompleted) return null

    return (
        <div className="flex items-center gap-3 justify-center mt-6">
            {currentQuestionIndex > 0 && (
                <button onClick={moveToPreviousQuestion} className="nav-bubble flex items-center gap-2 group">
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    <span className="font-medium">이전</span>
                </button>
            )}
            {canMoveToNext && (
                <button onClick={moveToNextAnsweredQuestion} className="nav-bubble flex items-center gap-2 group">
                    <span className="font-medium">다음</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
            )}
        </div>
    )
}

interface LawSectionProps {
    relatedLaws: Law[]
    onLawClick: (law: Law) => void
}

export const LawSection: React.FC<LawSectionProps> = ({ relatedLaws, onLawClick }) => (
    <div className="bg-blue-50/50 border border-blue-200/50 rounded-2xl p-4 animate-fade-in-up w-full">
        <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <BookOpen className="h-4 w-4" />
            관련 법령 참고
        </h4>
        <div className="space-y-2">
            {relatedLaws.map((law, index) => (
                <button
                    key={index}
                    onClick={() => onLawClick(law)}
                    className="w-full text-left p-3 bg-white/80 hover:bg-white border border-blue-200/50 hover:border-blue-300 rounded-xl transition-all duration-200 hover:shadow-sm animate-fade-in-up"
                    style={{
                        animationDelay: `${index * 150}ms`,
                        animationFillMode: 'both'
                    }}
                >
                    <div className="text-xs font-medium text-blue-800 mb-1">{law.title}</div>
                    <div className="text-xs text-blue-700 leading-relaxed">{law.content}</div>
                    <div className="text-xs text-blue-600 mt-2 font-medium">클릭하여 초안 작성 →</div>
                </button>
            ))}
        </div>
    </div>
)

interface BookmarkletSectionProps {
    bookmarklet: { url: string; code: string } | null
    isGenerating: boolean
    errorMsg: string | null
    copyText: (text: string) => Promise<void>
}

export const BookmarkletSection: React.FC<BookmarkletSectionProps> = ({
    bookmarklet,
    isGenerating,
    errorMsg,
    copyText
}) => (
    <div className="mt-4 space-y-3 animate-fade-in-up">
        {isGenerating && (
            <div className="p-3 rounded-xl border bg-card text-sm">
                북마클릿을 생성 중입니다...
            </div>
        )}
        {errorMsg && (
            <div className="p-3 rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm">
                {errorMsg}
            </div>
        )}
        {bookmarklet && (
            <div className="p-3 rounded-2xl border bg-card space-y-3">
                <div className="text-sm font-medium">북마클릿이 준비되었습니다.</div>

                <a
                    href={bookmarklet.url}
                    onClick={(e) => e.preventDefault()}
                    draggable
                    onDragStart={(e) => {
                        const url = bookmarklet.url;
                        const name = '구청장에게 바란다';
                        try {
                            e.dataTransfer?.setData('text/uri-list', url);
                            e.dataTransfer?.setData('text/plain', url);
                            e.dataTransfer?.setData('text/html', `<a href="${url}">${name}</a>`);
                            try {
                                e.dataTransfer?.setData('text/x-moz-url', `${url}\n${name}`);
                            } catch { }
                            if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copyLink';

                            try {
                                const ghost = document.createElement('div');
                                ghost.textContent = `🔖 ${name}`;
                                ghost.style.padding = '6px 10px';
                                ghost.style.fontSize = '12px';
                                ghost.style.background = '#fff';
                                ghost.style.border = '1px solid #ddd';
                                ghost.style.borderRadius = '8px';
                                ghost.style.boxShadow = '0 2px 6px rgba(0,0,0,.15)';
                                document.body.appendChild(ghost);
                                e.dataTransfer?.setDragImage(ghost, 10, 10);
                                setTimeout(() => document.body.removeChild(ghost), 0);
                            } catch { }
                        } catch (_) { }
                    }}
                    className="block w-full text-center px-4 py-3 rounded-xl border-2 border-dashed hover:border-primary/60 hover:bg-card/80 transition-all text-sm font-medium select-none"
                    title="이 링크를 북마크바로 끌어다 놓으세요"
                    aria-label="구청장에게 바란다 북마클릿"
                >
                    🔖 구청장에게 바란다
                </a>

                <div className="flex gap-2">
                    <Button
                        onClick={() => copyText(bookmarklet.url)}
                        className="flex-1 rounded-xl"
                    >
                        링크 복사
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => copyText(bookmarklet.code)}
                        className="flex-1 rounded-xl"
                    >
                        코드 복사
                    </Button>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                    <p>북마크바가 보이지 않으면 <span className="font-mono">Ctrl/⌘ + Shift + B</span>로 표시하세요.</p>
                    <p>일부 브라우저/환경에서는 보안 정책 때문에 자동 복사가 제한될 수 있어요. 이 경우 드래그 저장을 이용해 주세요.</p>
                </div>
            </div>
        )}
    </div>
)

interface AIContentGeneratorProps {
    situation: string;
    title: string;
    selectedLaw: string;
    onContentGenerated: (content: string) => void;
    onSkip: () => void;
}

export function AIContentGenerator({
    situation,
    title,
    selectedLaw,
    onContentGenerated,
    onSkip
}: AIContentGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const generateContent = async () => {
        if (!situation || !title || !selectedLaw) {
            setError('필요한 정보가 부족합니다. 이전 단계를 완료해주세요.');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setGeneratedContent('');

        try {
            const stream = await generateComplaintContent({
                situation,
                title,
                law: selectedLaw
            });

            const reader = stream.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                setGeneratedContent(prev => prev + chunk);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'AI 생성 중 오류가 발생했습니다.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generatedContent);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('복사 실패:', err);
        }
    };

    const handleUseContent = () => {
        onContentGenerated(generatedContent);
    };

    useEffect(() => {
        // 컴포넌트 마운트 시 자동으로 생성 시작
        if (situation && title && selectedLaw) {
            generateContent();
        }
    }, []);

    return (
        <div className="space-y-4 animate-fade-in-up">
            {/* AI 생성 헤더 */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                        AI 민원 내용 생성
                    </h3>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                    입력하신 정보를 바탕으로 AI가 민원 내용을 작성해드립니다.
                </p>
            </div>

            {/* 생성 중 상태 */}
            {isGenerating && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-purple-200 dark:border-purple-700 p-6">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-700 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <div className="text-center">
                            <p className="font-medium text-purple-900 dark:text-purple-100">
                                AI가 민원 내용을 생성하고 있습니다...
                            </p>
                            <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                                잠시만 기다려주세요
                            </p>
                        </div>
                        {generatedContent && (
                            <div className="w-full mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg max-h-40 overflow-y-auto">
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {generatedContent}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 생성 완료 상태 */}
            {!isGenerating && generatedContent && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-green-200 dark:border-green-700 p-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-green-900 dark:text-green-100">
                                ✨ AI 생성 완료
                            </h4>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleCopy}
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl"
                                >
                                    {isCopied ? (
                                        <>
                                            <Check className="h-4 w-4 mr-1" />
                                            복사됨
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4 mr-1" />
                                            복사
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={generateContent}
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl"
                                >
                                    <RefreshCw className="h-4 w-4 mr-1" />
                                    다시 생성
                                </Button>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 max-h-64 overflow-y-auto">
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {generatedContent}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={handleUseContent}
                                className="flex-1 h-12 rounded-2xl shadow-lg"
                            >
                                <Sparkles className="h-4 w-4 mr-2" />
                                이 내용으로 사용하기
                            </Button>
                            <Button
                                onClick={onSkip}
                                variant="outline"
                                className="flex-1 h-12 rounded-2xl"
                            >
                                직접 작성하기
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* 에러 상태 */}
            {error && !isGenerating && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    <div className="mt-3 flex gap-3">
                        <Button
                            onClick={generateContent}
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                        >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            다시 시도
                        </Button>
                        <Button
                            onClick={onSkip}
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                        >
                            건너뛰기
                        </Button>
                    </div>
                </div>
            )}

            {/* 초기 상태 (아직 생성 전) */}
            {!isGenerating && !generatedContent && !error && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 text-center">
                    <Sparkles className="h-12 w-12 mx-auto mb-3 text-purple-500" />
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        AI가 민원 내용 작성을 도와드릴 수 있습니다
                    </p>
                    <div className="flex gap-3">
                        <Button
                            onClick={generateContent}
                            className="flex-1 h-12 rounded-2xl shadow-lg"
                        >
                            <Sparkles className="h-4 w-4 mr-2" />
                            AI 생성 시작
                        </Button>
                        <Button
                            onClick={onSkip}
                            variant="outline"
                            className="flex-1 h-12 rounded-2xl"
                        >
                            직접 작성하기
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}