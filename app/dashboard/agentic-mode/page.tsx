"use client"
import React, { useEffect, useState, useRef } from 'react';
import {
    Plus,
    PanelLeft,
    Sparkles,
    Copy,
    ThumbsUp,
    ThumbsDown,
    Bookmark,
    SendHorizontal,
    X,
    Loader2,
    Database,
    BookOpen,
    HelpCircle,
    Users,
    Trash2,
    ChevronRight,
    MessageSquare,
    Zap
} from 'lucide-react';
import Image from 'next/image';
import { GiSparkles } from 'react-icons/gi';
import { BiBookmark, BiBookOpen, BiBrain, BiChevronDown, BiCopy, BiSend } from 'react-icons/bi';
import { useRouter } from 'next/navigation';
import { FiThumbsDown, FiThumbsUp } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatDB, Message, Conversation } from '@/lib/db/chat-db';
import { openRouterService, ChatMessage } from '@/lib/services/openrouter';
import { examApi } from '@/lib/api/exams';
import { subjectApi } from '@/lib/api/subjects';
import { questionApi } from '@/lib/api/questions';
import { classApi } from '@/lib/api/classes';
import { v4 as uuidv4 } from 'uuid';
import { ScaleLoader } from 'react-spinners';
import { useSearchParams } from 'next/navigation';

const CONTEXT_OPTIONS = [
    { id: 'exams', label: 'Exams', icon: <BookOpen size={14} />, api: examApi },
    { id: 'subjects', label: 'Subjects', icon: <BiBookOpen size={14} />, api: subjectApi },
    { id: 'questions', label: 'Questions', icon: <HelpCircle size={14} />, api: questionApi },
    { id: 'classes', label: 'Classes', icon: <Users size={14} />, api: classApi },
];

const ChatInterface = () => {
    const [user, setUser] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [selectedContext, setSelectedContext] = useState<string[]>([]);
    const [showMentionDropdown, setShowMentionDropdown] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [currentConversationId, setCurrentConversationId] = useState<string>(uuidv4());
    const [fineTuneData, setFineTuneData] = useState<any>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [availableClasses, setAvailableClasses] = useState<any[]>([]);
    const searchParams = useSearchParams(); // 2. Initialize search params
    const initialQueryProcessed = useRef(false); // To prevent double-sending in strict mode

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const storedUser = window.localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);
                // Fetch classes for this user's workspace
                const wId = parsed.workspaceId;
                if (wId) {
                    classApi.list(wId).then(res => {
                        if (res.success && res.data) setAvailableClasses(res.data);
                    }).catch(console.error);
                }
            } catch (error) {
                console.error('Failed to parse user', error);
            }
        }
        loadConversations();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadConversations = async () => {
        const history = await chatDB.getConversations();
        setConversations(history);
        if (history.length > 0) {
            loadMessages(history[0].id);
        }
    };

    const loadMessages = async (id: string) => {
        setCurrentConversationId(id);
        const msgs = await chatDB.getMessages(id);
        setMessages(msgs);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setInputText(value);
        const lastChar = value[value.length - 1];
        if (lastChar === '@') {
            setShowMentionDropdown(true);
        } else if (showMentionDropdown && !value.includes('@')) {
            setShowMentionDropdown(false);
        }
    };

    const addContext = (id: string) => {
        if (!selectedContext.includes(id)) {
            setSelectedContext([...selectedContext, id]);
        }
        setInputText(inputText.replace(/@$/, ''));
        setShowMentionDropdown(false);
        inputRef.current?.focus();
    };

    const removeContext = (id: string) => {
        setSelectedContext(selectedContext.filter(c => c !== id));
    };

    const getWorkspaceId = (): string => {
        if (user?.workspaceId) return user.workspaceId;
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) return JSON.parse(userStr).workspaceId || '';
        } catch (e) { }
        return '';
    };

    const getContextData = async () => {
        const contextPayload: any[] = [];
        const workspaceId = getWorkspaceId();
        for (const ctxId of selectedContext) {
            const option = CONTEXT_OPTIONS.find(o => o.id === ctxId);
            if (option) {
                try {
                    const response = await option.api.list(workspaceId);
                    if (response.success) {
                        contextPayload.push({ type: ctxId, data: response?.data?.slice(0, 5) });
                    }
                } catch (e) {
                    console.error(`Failed to fetch ${ctxId} context`, e);
                }
            }
        }
        return contextPayload;
    };

    const handleSendMessage = async (overrideText?: string) => {
        // Determine the text to send: use the override from navigation or the current input state
        const textToSend = overrideText || inputText;
        if (!textToSend.trim() && selectedContext.length === 0) return;

        // Create the user message object
        const userMsg: Message = {
            id: uuidv4(),
            conversationId: currentConversationId,
            role: 'user',
            content: textToSend, // Use textToSend to ensure query params are captured
            timestamp: Date.now(),
            context: selectedContext
        };

        // Update UI and clear local input states
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setSelectedContext([]);
        setIsStreaming(true);

        // Persist the user message to IndexedDB
        await chatDB.saveMessage(userMsg);

        // If this is the start of a new chat, create and save the conversation
        if (messages.length === 0) {
            const newConv: Conversation = {
                id: currentConversationId,
                title: textToSend.substring(0, 30) || 'New Chat',
                timestamp: Date.now()
            };
            await chatDB.saveConversation(newConv);
            setConversations(prev => [newConv, ...prev]);
        }

        // Fetch related workspace data if @mentions were used
        const contextData = await getContextData();

        // Construct the prompt history for the AI
        const aiMessages: ChatMessage[] = [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            {
                role: 'user',
                content: `User Input: ${userMsg.content}\n\nContext Data Provided: ${JSON.stringify(contextData)}`
            }
        ];

        let aiContent = '';
        const aiMsgId = uuidv4();

        // Trigger the streaming response from the AI service
        await openRouterService.streamChat(aiMessages, (chunk) => {
            aiContent += chunk;
            setMessages(prev => {
                const existingAiMsg = prev.find(m => m.id === aiMsgId);
                if (existingAiMsg) {
                    return prev.map(m => m.id === aiMsgId ? { ...m, content: aiContent } : m);
                } else {
                    return [...prev, {
                        id: aiMsgId,
                        conversationId: currentConversationId,
                        role: 'assistant',
                        content: aiContent,
                        timestamp: Date.now()
                    }];
                }
            });
        });

        setIsStreaming(false);

        // Check for structured actions (like creating an exam) in the AI's response
        const actionMatch = aiContent.match(/\[ACTION:CREATE_EXAM\](.*?)\[\/ACTION\]/);
        if (actionMatch) {
            try {
                const data = JSON.parse(actionMatch[1]);
                setFineTuneData(data);
            } catch (e) {
                console.error("Failed to parse action JSON", e);
            }
        }

        // Persist the final assistant message to IndexedDB
        await chatDB.saveMessage({
            id: aiMsgId,
            conversationId: currentConversationId,
            role: 'assistant',
            content: aiContent,
            timestamp: Date.now()
        });
    };
    useEffect(() => {
        const query = searchParams.get('q');
        if (query && !initialQueryProcessed.current) {
            initialQueryProcessed.current = true;
            // Small delay to ensure DB and User context are initialized
            setTimeout(() => {
                handleSendMessage(query);
            }, 500);
        }
    }, [searchParams]);

    const handleCreateExam = async () => {
        if (!fineTuneData) return;
        const workspaceId = getWorkspaceId();
        const classId = fineTuneData.classId;
        if (!workspaceId) {
            alert('No workspace found. Please log in again.');
            return;
        }
        if (!classId) {
            alert('Please select a class before creating the exam.');
            return;
        }
        setIsStreaming(true);
        try {
            const response = await examApi.create({
                exam_name: fineTuneData.name,
                minutes: Number(fineTuneData.minutes) || 60,
                workspaceId,
                classId,
                visible: true
            });
            if (response.success) {
                const successMsg: Message = {
                    id: uuidv4(),
                    conversationId: currentConversationId,
                    role: 'assistant',
                    content: `✅ Successfully created the exam: **${fineTuneData.name}**!`,
                    timestamp: Date.now()
                };
                setMessages(prev => [...prev, successMsg]);
                await chatDB.saveMessage(successMsg);
                setFineTuneData(null);
            } else {
                alert("Failed to create exam: " + (response as any).message);
            }
        } catch (e: any) {
            console.error("Failed to create exam", e);
            alert('Failed to create exam: ' + (e?.message || 'Unknown error'));
        } finally {
            setIsStreaming(false);
        }
    };

    const startNewChat = () => {
        setCurrentConversationId(uuidv4());
        setMessages([]);
        setFineTuneData(null);
    };

    const userName = user?.user_name || "User";
    const firstLetter = userName.charAt(0).toUpperCase();

    return (
        <div className="flex h-full w-full bg-white text-[#6b6b6b] font-sans overflow-hidden">

            {/* ── Collapsible Sidebar ── */}
            <aside
                className={`flex flex-col border-r border-[#ededed] bg-white transition-all duration-300 ${sidebarOpen ? 'w-60' : 'w-0 overflow-hidden'}`}
            >
                {/* New Chat */}
                <div className="p-4 border-b border-[#ededed]">
                    <button
                        onClick={startNewChat}
                        className="w-full flex items-center justify-center gap-2 border border-[#ededed] rounded py-2 text-[#1a1a1a] hover:border-blue-400 hover:text-blue-500 transition-colors text-sm font-medium"
                    >
                        <Plus size={14} />
                        New Chat
                    </button>
                </div>

                {/* History list */}
                <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                    {conversations.length === 0 ? (
                        <p className="text-xs text-center text-[#6b6b6b] opacity-60 mt-6 px-4">No conversations yet</p>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.id}
                                onClick={() => loadMessages(conv.id)}
                                className={`flex items-center justify-between gap-2 px-3 py-2 rounded cursor-pointer group transition-colors text-sm
                                    ${currentConversationId === conv.id
                                        ? 'bg-blue-500/10 text-blue-500'
                                        : 'text-[#6b6b6b] hover:bg-[#f9f9f9] hover:text-[#1a1a1a]'
                                    }`}
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <MessageSquare size={13} className="shrink-0 opacity-60" />
                                    <span className="truncate">{conv.title}</span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        chatDB.deleteConversation(conv.id).then(loadConversations);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 hover:text-blue-500 transition-all shrink-0"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* ── Main Panel ── */}
            <div className="flex-1 flex flex-col relative min-w-0">

                {/* Header */}
                <header className="flex items-center justify-between px-5 py-3 border-b border-[#ededed] bg-white">
                    <div className="flex items-center gap-3">


                        {/* Mode pill */}
                        <div className="flex items-center gap-2 px-3 py-1.5 border border-[#ededed] rounded hover:border-blue-300 cursor-pointer transition-colors group">
                            <div className="p-1 bg-[#f0f0f0] rounded group-hover:bg-blue-500/10 transition-colors">
                                <BiBrain size={14} className="text-blue-500" />
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-[#1a1a1a] text-sm font-medium">Agentic Mode</span>

                            </div>
                            <BiChevronDown size={13} className="text-[#6b6b6b] ml-0.5" />
                        </div>
                    </div>


                    <div className="flex items-center gap-2">
                        {/* Sidebar toggle */}
                        <button
                            onClick={() => setSidebarOpen(v => !v)}
                            className="p-1.5 rounded hover:bg-[#f0f0f0] text-[#6b6b6b] transition-colors"
                            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                        >
                            <PanelLeft size={16} />
                        </button>
                    </div>
                </header>

                {/* Chat Area */}
                <main className="flex-1 overflow-y-auto max-h-[60vh] scrollbar-hide">
                    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
                        {messages.length === 0 ? (
                            <div className="h-[55vh] flex flex-col items-center justify-center text-center space-y-6">
                                <div className="p-4 bg-[#f0f0f0] rounded-full">
                                    <Image src={'https://avatars.githubusercontent.com/u/225484805?s=200&v=4'} alt='LearningDeckIcon' width={30} height={30} className='rounded-full' />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-semibold text-[#1a1a1a]">How can I help you today?</h2>
                                    <p className="text-[#6b6b6b] max-w-md mx-auto text-sm">
                                        Type <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded text-blue-500 font-mono text-xs">@</code> to add context from your workspace and create exams, subjects, or questions with AI.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 w-full max-w-lg mt-4">
                                    {['Create a science exam for Grade 10', 'Analyse my subject list', 'Draft 5 biology questions', 'List all upcoming classes'].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => setInputText(suggestion)}
                                            className="p-4 bg-white border border-[#ededed] rounded text-sm text-[#6b6b6b] hover:border-blue-300 hover:text-blue-500 transition-colors text-left"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex items-start gap-3 group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {/* AI avatar */}
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded flex items-center justify-center shrink-0">
                                            <Image src={'https://avatars.githubusercontent.com/u/225484805?s=200&v=4'} alt='LearningDeckIcon' width={25} height={25} className='rounded-full' />

                                        </div>
                                    )}


                                    <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'order-1' : ''}`}>
                                        <div className={`
                                            px-4 py-3 rounded leading-relaxed text-sm
                                            ${msg.role === 'user'
                                                ? 'bg-blue-500 text-white rounded-tr-none'
                                                : 'bg-white border border-[#ededed] text-[#6b6b6b] rounded-tl-none'
                                            }
                                        `}>
                                            <div className="prose prose-sm max-w-none">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>

                                                    {msg.content.replace(/\[ACTION:.*?\/ACTION\]/, '')}
                                                </ReactMarkdown>
                                            </div>
                                        </div>

                                        {msg.role === 'assistant' && (
                                            <div className="flex items-center gap-3 pl-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="text-[#6b6b6b] hover:text-blue-500 transition-colors"><BiCopy size={14} /></button>
                                                <button className="text-[#6b6b6b] hover:text-blue-500 transition-colors"><FiThumbsUp size={14} /></button>
                                                <button className="text-[#6b6b6b] hover:text-blue-500 transition-colors"><FiThumbsDown size={14} /></button>
                                                <button className="text-[#6b6b6b] hover:text-blue-500 transition-colors"><BiBookmark size={14} /></button>
                                            </div>
                                        )}
                                    </div>

                                    {/* User avatar */}
                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded bg-[#f0f0f0] flex items-center justify-center text-[#1a1a1a] text-xs font-bold border border-[#ededed] order-2 shrink-0">
                                            {firstLetter}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                        {!isStreaming ? <div ref={messagesEndRef} /> :


                            <div className="flex items-center gap-1.5 italic  text-xs   px-3 py-1 rounded">
                                <ScaleLoader barCount={3} color="#a7a7a7" height={12} width={5} />
                                Thinking…
                            </div>
                        }
                    </div>
                </main>

                {/* Fine-tune Popover */}
                {fineTuneData && (
                    <div className="absolute inset-x-0 bottom-36 mx-auto max-w-2xl px-6">
                        <div className="bg-white border border-[#ededed] rounded p-6 relative shadow">
                            {/* blue left accent */}
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l" />

                            <button
                                onClick={() => setFineTuneData(null)}
                                className="absolute top-4 right-4 text-[#6b6b6b] hover:text-[#1a1a1a] bg-[#f0f0f0] rounded p-1 transition-colors"
                            >
                                <X size={14} />
                            </button>

                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2 bg-[#f0f0f0] rounded">
                                    <Sparkles size={16} className="text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-[#1a1a1a] font-semibold text-sm">Review Questions</h3>
                                    <p className="text-xs text-[#6b6b6b]">Review the generated details before saving</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Exam Name', key: 'name', type: 'text' },
                                    { label: 'Subject', key: 'subject', type: 'text' },
                                    { label: 'Questions', key: 'questions_count', type: 'number' },
                                    { label: 'Duration (mins)', key: 'minutes', type: 'number' },
                                ].map(({ label, key, type }) => (
                                    <div key={key} className="space-y-1">
                                        <label className="text-[10px] font-semibold text-[#6b6b6b] uppercase tracking-wider">{label}</label>
                                        <input
                                            type={type}
                                            value={fineTuneData[key] || ''}
                                            onChange={(e) => setFineTuneData({ ...fineTuneData, [key]: e.target.value })}
                                            className="w-full border border-[#ededed] rounded py-2 px-3 text-sm text-[#1a1a1a] outline-none focus:border-blue-400 transition-colors"
                                        />
                                    </div>
                                ))}
                                <div className="space-y-1 col-span-2">
                                    <label className="text-[10px] font-semibold text-[#6b6b6b] uppercase tracking-wider">Class</label>
                                    <select
                                        value={fineTuneData.classId || ''}
                                        onChange={(e) => setFineTuneData({ ...fineTuneData, classId: e.target.value })}
                                        className="w-full border border-[#ededed] rounded py-2 px-3 text-sm text-[#1a1a1a] outline-none focus:border-blue-400 transition-colors bg-white cursor-pointer"
                                        required
                                    >
                                        <option value="" disabled>Select a class</option>
                                        {availableClasses.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setFineTuneData(null)}
                                    className="px-4 py-2 text-sm text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
                                >
                                    Discard
                                </button>
                                <button
                                    onClick={handleCreateExam}
                                    disabled={isStreaming}
                                    className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/30 px-6 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isStreaming ? 'Creating…' : 'Create Exam'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Input */}
                <footer className="px-6 py-5 border-t border-[#ededed] bg-white">
                    <div className="max-w-3xl mx-auto relative">

                        {/* @ mention dropdown */}
                        {showMentionDropdown && (
                            <div className="absolute bottom-full left-0 mb-3 w-56 bg-white border border-[#ededed] rounded shadow-lg overflow-hidden">
                                <div className="px-4 py-2 border-b border-[#ededed]">
                                    <span className="text-[10px] font-semibold text-[#6b6b6b] uppercase tracking-widest">Workspace Data</span>
                                </div>
                                {CONTEXT_OPTIONS.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => addContext(opt.id)}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#fcfcfc] text-[#6b6b6b] hover:text-blue-500 text-sm transition-colors"
                                    >
                                        <div className="p-1.5 bg-[#f0f0f0] rounded text-blue-500">
                                            {opt.icon}
                                        </div>
                                        <span>{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="bg-white border border-[#ededed] rounded focus-within:border-blue-400 transition-colors overflow-hidden">
                            {/* Context tags */}
                            {selectedContext.length > 0 && (
                                <div className="flex flex-wrap gap-2 px-4 pt-3">
                                    {selectedContext.map(ctx => (
                                        <div key={ctx} className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded px-2.5 py-0.5 text-xs font-medium">
                                            <span>{CONTEXT_OPTIONS.find(o => o.id === ctx)?.label}</span>
                                            <button
                                                onClick={() => removeContext(ctx)}
                                                className="hover:opacity-70 transition-opacity"
                                            >
                                                <X size={11} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <textarea
                                ref={inputRef}
                                value={inputText}
                                onChange={handleInput}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder="Type @ to add context or ask me anything..."
                                className="w-full min-h-[72px] max-h-[260px] bg-transparent text-[#1a1a1a] text-sm leading-relaxed p-4 outline-none resize-none placeholder:text-[#6b6b6b]/60"
                                rows={1}
                            />

                            <div className="flex items-center justify-between px-4 pb-3">
                                <div className="flex items-center gap-1">
                                    <button className="p-1.5 text-[#6b6b6b] hover:text-blue-500 hover:bg-[#f0f0f0] rounded transition-colors">
                                        <Plus size={16} />
                                    </button>
                                    <button className="p-1.5 text-[#6b6b6b] hover:text-blue-500 hover:bg-[#f0f0f0] rounded transition-colors">
                                        <Database size={16} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    {isStreaming && (
                                        <div className="flex items-center gap-1.5 text-blue-500 text-xs font-medium bg-blue-500/10 px-3 py-1 rounded">
                                            <Loader2 size={11} className="animate-spin" />
                                            Thinking…
                                        </div>
                                    )}
                                    <button
                                        disabled={isStreaming}
                                        // Change this to an anonymous function to ensure no arguments (like click events) are passed
                                        onClick={() => handleSendMessage()}
                                        className={`py-2 px-4 rounded text-sm font-medium transition-colors
        ${inputText || selectedContext.length > 0
                                                ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
                                                : 'bg-[#f0f0f0] text-[#6b6b6b]/40 cursor-not-allowed'
                                            }`}
                                    >
                                        <SendHorizontal size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default ChatInterface;