import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, Copy, Check } from 'lucide-react';
import { generateComplaintContent } from '@/lib/api';

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