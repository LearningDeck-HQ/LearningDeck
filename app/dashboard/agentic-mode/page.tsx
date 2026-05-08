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
import { BiBookmark, BiBookOpen, BiBrain, BiChevronDown, BiCopy, BiSend, BiSolidShapes } from 'react-icons/bi';
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
import { SiGoogleclassroom } from 'react-icons/si';
import { MdQuiz } from 'react-icons/md';

const CONTEXT_OPTIONS = [
    { id: 'exams', label: 'Exams', icon: <BookOpen size={14} />, api: examApi },
    { id: 'subjects', label: 'Subjects', icon: <BiSolidShapes size={14} />, api: subjectApi },
    { id: 'questions', label: 'Questions', icon: <MdQuiz size={14} />, api: questionApi },
    { id: 'classes', label: 'Classes', icon: <SiGoogleclassroom size={14} />, api: classApi },
];

const ChatInterface = () => {
    const [user, setUser] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [selectedContext, setSelectedContext] = useState<string[]>([]);
    const [showMentionDropdown, setShowMentionDropdown] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [selectedModel, setSelectedModel] = useState('qwen/qwen-2.5-7b-instruct');
    const [currentConversationId, setCurrentConversationId] = useState<string>(uuidv4());
    const [fineTuneData, setFineTuneData] = useState<any>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [availableClasses, setAvailableClasses] = useState<any[]>([]);
    const [availableExams, setAvailableExams] = useState<any[]>([]);
    const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
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
                // Fetch classes and exams for this user's workspace
                const wId = parsed.workspaceId;
                if (wId) {
                    classApi.list(wId).then(res => {
                        if (res.success && res.data) setAvailableClasses(res.data);
                    }).catch(console.error);
                    examApi.list({ workspaceId: wId }).then(res => {
                        if (res.success && res.data) setAvailableExams(res.data);
                    }).catch(console.error);
                    subjectApi.list(wId).then(res => {
                        if (res.success && res.data) setAvailableSubjects(res.data);
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

        // Always inject workspace context so AI uses real IDs
        const workspaceContext = {
            classes: availableClasses.map(c => ({ id: c.id, name: c.name })),
            exams: availableExams.map(e => ({ id: e.id, name: e.exam_name || e.name })),
            subjects: availableSubjects.map(s => ({ id: s.id, name: s.name })),
            mentionedData: contextData,
        };

        // Construct the prompt history for the AI
        const aiMessages: ChatMessage[] = [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            {
                role: 'user',
                content: `User Input: ${userMsg.content}\n\nWorkspace Context (use real IDs from here): ${JSON.stringify(workspaceContext)}`
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
        }, selectedModel);

        setIsStreaming(false);

        // Check for structured actions in the AI's response (multiline-safe regex)
        const actions = [
            { type: 'CREATE_EXAM', tag: /\[ACTION:CREATE_EXAM\]([\s\S]*?)\[\/ACTION\]/ },
            { type: 'ADD_QUESTIONS', tag: /\[ACTION:ADD_QUESTIONS\]([\s\S]*?)\[\/ACTION\]/ },
            { type: 'CREATE_SUBJECT', tag: /\[ACTION:CREATE_SUBJECT\]([\s\S]*?)\[\/ACTION\]/ },
            { type: 'CREATE_CLASS', tag: /\[ACTION:CREATE_CLASS\]([\s\S]*?)\[\/ACTION\]/ },
        ];

        for (const action of actions) {
            const match = aiContent.match(action.tag);
            if (match) {
                try {
                    const data = JSON.parse(match[1].trim());

                    // Robustness: Resolve names to IDs if AI provides names
                    if (action.type === 'ADD_QUESTIONS') {
                        // Resolve examId from name if it looks like a name
                        if (data.examName && !data.examId) {
                            const found = availableExams.find(e =>
                                (e.exam_name || e.name || "").toLowerCase() === data.examName.toLowerCase()
                            );
                            if (found) data.examId = found.id;
                        }
                        // Resolve subjectId from name if it looks like a name
                        if (data.subjectName && !data.subjectId) {
                            const found = availableSubjects.find(s =>
                                s.name.toLowerCase() === data.subjectName.toLowerCase()
                            );
                            if (found) data.subjectId = found.id;
                        }
                        // Resolve classId from exam if missing
                        if (data.examId && !data.classId) {
                            const found = availableExams.find(e => e.id === data.examId);
                            if (found) data.classId = found.classId;
                        }
                    }

                    setFineTuneData({ ...data, actionType: action.type, messageId: aiMsgId });
                    break;
                } catch (e) {
                    console.error(`Failed to parse action JSON for ${action.type}`, e);
                }
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

    const addSystemMessage = async (content: string) => {
        const msg: Message = { id: uuidv4(), conversationId: currentConversationId, role: 'assistant', content, timestamp: Date.now() };
        setMessages(prev => [...prev, msg]);
        await chatDB.saveMessage(msg);
    };

    const updateTaskStatus = (msgId: string) => {
        setMessages(prev => prev.map(m => {
            if (m.id === msgId) {
                let newContent = m.content;
                // Use regex with flexible spacing for task markers
                const doingRegex = /\[\s*\/\s*\]/;
                const pendingRegex = /\[\s+\]/;

                const hasDoing = doingRegex.test(newContent);
                if (hasDoing) {
                    newContent = newContent.replace(doingRegex, '[x]');
                }
                
                // Promote the first pending task to doing
                if (pendingRegex.test(newContent)) {
                    newContent = newContent.replace(pendingRegex, '[/]');
                }

                if (newContent !== m.content) {
                    chatDB.saveMessage({ ...m, content: newContent });
                    return { ...m, content: newContent };
                }
            }
            return m;
        }));
    };

    const handleConfirmAction = async () => {
        if (!fineTuneData) return;
        const workspaceId = getWorkspaceId();
        if (!workspaceId) { alert('No workspace found. Please log in again.'); return; }
        setIsStreaming(true);
        try {
            const { actionType } = fineTuneData;

            if (actionType === 'CREATE_EXAM') {
                if (!fineTuneData.classId) { alert('Please select a class.'); setIsStreaming(false); return; }
                const examName = fineTuneData.exam_name || fineTuneData.name;
                const res = await examApi.create({ exam_name: examName, minutes: Number(fineTuneData.minutes) || 60, workspaceId, classId: fineTuneData.classId, visible: true });
                if (res.success) {
                    if (fineTuneData.messageId) updateTaskStatus(fineTuneData.messageId);
                    await addSystemMessage(`✅ Exam **${examName}** created successfully!`);
                    // Refresh so future ADD_QUESTIONS knows the new exam's ID
                    examApi.list({ workspaceId }).then(r => { if (r.success && r.data) setAvailableExams(r.data); });
                    setFineTuneData(null);
                } else alert('Failed to create exam: ' + (res as any).message);
            }

            else if (actionType === 'ADD_QUESTIONS') {
                if (!fineTuneData.examId) { alert('Please select an exam first.'); setIsStreaming(false); return; }
                if (!fineTuneData.subjectId) { alert('Please select a subject first.'); setIsStreaming(false); return; }

                const questions: any[] = fineTuneData.questions || [];
                if (questions.length === 0) { alert('No questions found to add.'); setIsStreaming(false); return; }
                let added = 0;
                for (const q of questions) {
                    const correctAnswer = q.correct_answer || q.answer || q.correctAnswer;
                    const incorrectAnswers = q.incorrect_answers || q.incorrectAnswers || (q.options || []).filter((o: string) => o !== correctAnswer);

                    const res = await questionApi.create({
                        workspaceId,
                        examId: fineTuneData.examId,
                        subjectId: q.subjectId || fineTuneData.subjectId,
                        classId: q.classId || fineTuneData.classId,
                        type: q.type || 'MULTIPLE_CHOICE',
                        question: q.question || q.text,
                        correct_answer: correctAnswer,
                        incorrect_answers: (q.type === 'MULTIPLE_CHOICE' || !q.type) && Array.isArray(incorrectAnswers)
                            ? incorrectAnswers.filter((a: any) => a && String(a).trim() !== '')
                            : [],
                        explanation: q.explanation || undefined,
                    });
                    if (res.success) added++;
                    else console.error('Failed to add question:', res.message, q);
                    await new Promise(r => setTimeout(r, 150));
                }
                if (fineTuneData.messageId) updateTaskStatus(fineTuneData.messageId);
                await addSystemMessage(`✅ Added **${added}/${questions.length}** questions to **${fineTuneData.examName || 'exam'}** successfully!`);
                setFineTuneData(null);
            }

            else if (actionType === 'CREATE_SUBJECT') {
                // Backend only accepts: { name, workspaceId } — no description field
                const res = await subjectApi.create({ name: fineTuneData.name, workspaceId });
                if (res.success) {
                    if (fineTuneData.messageId) updateTaskStatus(fineTuneData.messageId);
                    await addSystemMessage(`✅ Subject **${fineTuneData.name}** created successfully!`);
                    setFineTuneData(null);
                }
                else alert('Failed to create subject: ' + (res as any).message);
            }

            else if (actionType === 'CREATE_CLASS') {
                const res = await classApi.create({ name: fineTuneData.name, workspaceId });
                if (res.success) {
                    if (fineTuneData.messageId) updateTaskStatus(fineTuneData.messageId);
                    await addSystemMessage(`✅ Class **${fineTuneData.name}** created successfully!`);
                    // Refresh so next exam creation has the new class in the dropdown
                    classApi.list(workspaceId).then(r => { if (r.success && r.data) setAvailableClasses(r.data); });
                    setFineTuneData(null);
                } else alert('Failed to create class: ' + (res as any).message);
            }
        } catch (e: any) {
            console.error('Action failed', e);
            alert('Action failed: ' + (e?.message || 'Unknown error'));
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


                        {/* Mode pill & Model Selector */}
                        <div className="flex items-center gap-2 px-3 py-1.5 border border-[#ededed] rounded hover:border-blue-300 transition-colors group relative">
                            <div className="p-1 bg-[#f0f0f0] rounded group-hover:bg-blue-500/10 transition-colors">
                                <BiBrain size={14} className="text-blue-500" />
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-[#1a1a1a] text-sm font-medium">Agentic Mode</span>
                            </div>
                            <div className="h-4 w-px bg-[#ededed] mx-1" />
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="appearance-none bg-transparent text-xs text-[#6b6b6b] outline-none cursor-pointer pr-4"
                            >
                                <option value="qwen/qwen-2.5-7b-instruct">Qwen 2.5 7B</option>
                                <option value="baidu/cobuddy:free">Cobuddy (Free)</option>

                                <option value="inclusionai/ring-2.6-1t:free">Ring 2.6 (Free)</option>
                                <option value="poolside/laguna-m.1:free">Poolside (Free)</option>
                                <option value="liquid/lfm-2.5-1.2b-instruct:free">Liquid LFM (Free)</option>
                            </select>
                            <BiChevronDown size={13} className="text-[#6b6b6b] absolute right-2 pointer-events-none" />
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
                                                {/* Thinking Section */}
                                                {msg.role === 'assistant' && msg.content.includes('<thinking>') && (
                                                    <div className="mb-3 bg-[#f9f9f9] border border-[#ededed] rounded-lg p-3">
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-[#a1a1a1] uppercase tracking-wider mb-2">
                                                            <BiBrain size={12} className="text-blue-400" />
                                                            Thinking Process
                                                        </div>
                                                        <div className="text-xs text-[#6b6b6b] italic leading-relaxed">
                                                            {msg.content.match(/<thinking>([\s\S]*?)<\/thinking>/)?.[1]}
                                                        </div>
                                                    </div>
                                                )}

                                                 {/* Task List Section */}
                                                 {msg.role === 'assistant' && msg.content.includes('<task_list>') && (
                                                     <div className="mb-4 space-y-1.5">
                                                         {msg.content.match(/<task_list>([\s\S]*?)<\/task_list>/)?.[1].split('\n').filter(t => t.trim()).map((task, i) => {
                                                             const isDone = /\[x\]/i.test(task);
                                                             const isDoing = /\[\/\]/.test(task);
                                                             return (
                                                                 <div key={i} className="flex items-center gap-2.5 text-xs text-[#6b6b6b]">
                                                                     <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors
                                                                         ${isDone ? 'bg-green-500 border-green-500 text-white' : isDoing ? 'border-blue-500 bg-blue-500/10' : 'border-[#ededed]'}
                                                                     `}>
                                                                         {isDone && <Sparkles size={10} />}
                                                                         {isDoing && <Loader2 size={10} className="animate-spin text-blue-500" />}
                                                                     </div>
                                                                     <span className={isDone ? 'line-through opacity-50' : ''}>{task.replace(/\[.\]|\[\s\]/, '').trim()}</span>
                                                                 </div>
                                                             );
                                                         })}
                                                     </div>
                                                 )}

                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {msg.content
                                                        .replace(/<thinking>[\s\S]*?<\/thinking>/g, '')
                                                        .replace(/<task_list>[\s\S]*?<\/task_list>/g, '')
                                                        .replace(/\[ACTION:[\s\S]*?\/ACTION\]/g, '')
                                                        .trim()
                                                    }
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

                {/* Action Popover */}
                {fineTuneData && (() => {
                    const { actionType } = fineTuneData;
                    const titles: Record<string, { title: string; subtitle: string; confirmLabel: string }> = {
                        CREATE_EXAM: { title: 'Review New Exam', subtitle: 'Edit the details below before creating the exam', confirmLabel: 'Create Exam' },
                        ADD_QUESTIONS: { title: 'Review Questions', subtitle: `Adding ${fineTuneData.questions?.length || 0} question${(fineTuneData.questions?.length || 0) === 1 ? '' : 's'}${fineTuneData.examName ? ` to "${fineTuneData.examName}"` : ' — select target exam below'}`, confirmLabel: 'Add Questions' },
                        CREATE_SUBJECT: { title: 'Review New Subject', subtitle: 'Confirm the subject details', confirmLabel: 'Create Subject' },
                        CREATE_CLASS: { title: 'Review New Class', subtitle: 'Confirm the class details', confirmLabel: 'Create Class' },
                    };
                    const meta = titles[actionType] || { title: 'Confirm Action', subtitle: '', confirmLabel: 'Confirm' };
                    return (
                        <div className="absolute inset-x-0 bottom-36 z-30 mx-auto max-w-2xl px-6">
                            <div className="bg-white border border-[#ededed] rounded p-6 relative shadow">
                                <div className="absolute top-0 left-0 w-1 h-full " />
                                <button onClick={() => setFineTuneData(null)} className="absolute top-4 right-4 text-[#6b6b6b] hover:text-[#1a1a1a] bg-[#f0f0f0] rounded p-1 transition-colors"><X size={14} /></button>

                                <div className="flex items-center gap-3 mb-5">
                                    <div className="p-2 bg-blue-500/10 rounded-lg"><Sparkles size={16} className="text-blue-500" /></div>
                                    <div>
                                        <h3 className="text-[#1a1a1a] font-semibold text-sm">{meta.title}</h3>
                                        <p className="text-xs text-[#6b6b6b]">{meta.subtitle}</p>
                                    </div>
                                </div>

                                {/* CREATE_EXAM fields */}
                                {actionType === 'CREATE_EXAM' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        {[{ label: 'Exam Name', key: 'exam_name', altKey: 'name', type: 'text' }, { label: 'Duration (mins)', key: 'minutes', type: 'number' }].map(({ label, key, altKey, type }) => (
                                            <div key={key} className="space-y-1">
                                                <label className="text-[10px] font-semibold text-[#6b6b6b] uppercase tracking-wider">{label}</label>
                                                <input
                                                    type={type}
                                                    value={fineTuneData[key] || (altKey ? fineTuneData[altKey] : '') || ''}
                                                    onChange={(e) => setFineTuneData({ ...fineTuneData, [key]: e.target.value })}
                                                    className="w-full border border-[#ededed] rounded-lg py-2 px-3 text-sm text-[#1a1a1a] outline-none focus:border-blue-400 transition-colors"
                                                />
                                            </div>
                                        ))}
                                        <div className="space-y-1 col-span-2">
                                            <label className="text-[10px] font-semibold text-[#6b6b6b] uppercase tracking-wider">Class</label>
                                            <select value={fineTuneData.classId || ''} onChange={(e) => setFineTuneData({ ...fineTuneData, classId: e.target.value })} className="w-full border border-[#ededed] rounded-lg py-2 px-3 text-sm text-[#1a1a1a] outline-none focus:border-blue-400 transition-colors bg-white cursor-pointer" required>
                                                <option value="" disabled>Select a class</option>
                                                {availableClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* ADD_QUESTIONS fields */}
                                {actionType === 'ADD_QUESTIONS' && (
                                    <div className="space-y-3">
                                        {/* Exam selector — always shown so user can correct AI's pick */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-semibold text-[#6b6b6b] uppercase tracking-wider">Target Exam</label>
                                            <select
                                                value={fineTuneData.examId || ''}
                                                onChange={(e) => {
                                                    const exam = availableExams.find((ex: any) => ex.id === e.target.value);
                                                    setFineTuneData({
                                                        ...fineTuneData,
                                                        examId: e.target.value,
                                                        examName: exam?.exam_name || exam?.name || fineTuneData.examName,
                                                        classId: exam?.classId || fineTuneData.classId
                                                    });
                                                }}
                                                className="w-full border border-[#ededed] rounded-lg py-2 px-3 text-sm text-[#1a1a1a] outline-none focus:border-blue-400 transition-colors bg-white cursor-pointer"
                                            >
                                                <option value="" disabled>Select exam to add questions to</option>
                                                {availableExams.map((ex: any) => (
                                                    <option key={ex.id} value={ex.id}>{ex.exam_name || ex.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-semibold text-[#6b6b6b] uppercase tracking-wider">Subject</label>
                                            <select
                                                value={fineTuneData.subjectId || ''}
                                                onChange={(e) => setFineTuneData({ ...fineTuneData, subjectId: e.target.value })}
                                                className="w-full border border-[#ededed] rounded-lg py-2 px-3 text-sm text-[#1a1a1a] outline-none focus:border-blue-400 transition-colors bg-white cursor-pointer"
                                            >
                                                <option value="" disabled>Select subject</option>
                                                {availableSubjects.map((s: any) => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {/* Questions preview — editable */}
                                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                            {(fineTuneData.questions || []).map((q: any, i: number) => {
                                                const allOptions = [q.correct_answer || q.answer, ...(q.incorrect_answers || (q.options || []).filter((o: string) => o !== q.answer))].filter(Boolean);
                                                return (
                                                    <div key={i} className="bg-[#f9f9f9] border border-[#ededed] rounded-lg p-3">
                                                        <div className="flex items-start gap-2 mb-2">
                                                            <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 rounded px-1.5 py-0.5 shrink-0">Q{i + 1}</span>
                                                            <input
                                                                value={q.question || q.text || ''}
                                                                onChange={(e) => {
                                                                    const qs = [...fineTuneData.questions];
                                                                    qs[i] = { ...qs[i], question: e.target.value, text: e.target.value };
                                                                    setFineTuneData({ ...fineTuneData, questions: qs });
                                                                }}
                                                                className="flex-1 bg-transparent text-xs text-[#1a1a1a] outline-none border-b border-[#ededed] focus:border-blue-400 pb-1"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-1.5">
                                                            {allOptions.map((opt: string, j: number) => (
                                                                <div key={j} className={`text-[11px] px-2 py-1 rounded border ${(q.correct_answer || q.answer) === opt ? 'border-green-400 bg-green-50 text-green-700' : 'border-[#ededed] text-[#6b6b6b]'}`}>
                                                                    {opt}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* CREATE_SUBJECT / CREATE_CLASS fields */}
                                {(actionType === 'CREATE_SUBJECT' || actionType === 'CREATE_CLASS') && (
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-semibold text-[#6b6b6b] uppercase tracking-wider">Name</label>
                                            <input value={fineTuneData.name || ''} onChange={(e) => setFineTuneData({ ...fineTuneData, name: e.target.value })} className="w-full border border-[#ededed] rounded-lg py-2 px-3 text-sm text-[#1a1a1a] outline-none focus:border-blue-400 transition-colors" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-semibold text-[#6b6b6b] uppercase tracking-wider">Description</label>
                                            <textarea value={fineTuneData.description || ''} onChange={(e) => setFineTuneData({ ...fineTuneData, description: e.target.value })} rows={2} className="w-full border border-[#ededed] rounded-lg py-2 px-3 text-sm text-[#1a1a1a] outline-none focus:border-blue-400 transition-colors resize-none" />
                                        </div>
                                    </div>
                                )}

                                <div className="mt-5 flex items-center justify-end gap-3">
                                    <button onClick={() => setFineTuneData(null)} className="px-4 py-2 text-sm text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">Discard</button>
                                    <button onClick={handleConfirmAction} disabled={isStreaming} className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/30 px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                        {isStreaming ? <><Loader2 size={13} className="animate-spin" /> Working…</> : <><Sparkles size={13} />{meta.confirmLabel}</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Input */}
                <footer className="px-6 py-5 border-t border-[#ededed] bg-white">
                    <div className="max-w-3xl mx-auto relative">

                        {/* @ mention dropdown */}
                        {showMentionDropdown && (
                            <div className="absolute bottom-full left-0 mb-3 w-56 py-2 bg-white border border-[#ededed] rounded shadow overflow-hidden">

                                {CONTEXT_OPTIONS.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => addContext(opt.id)}
                                        className="w-full flex items-center gap-3 px-4 py-1 hover:bg-[#fcfcfc] text-[#6b6b6b] hover:text-blue-500 text-xs transition-colors"
                                    >
                                        <div className="p-1 bg-[#f0f0f0] rounded text-blue-500">
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