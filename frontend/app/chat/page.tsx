"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useRouter } from "next/navigation";

interface Message {
    role: "user" | "bot";
    content: string;
}

export default function ChatPage() {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load messages from localStorage on mount
    useEffect(() => {
        const savedMessages = localStorage.getItem("chatHistory");
        if (savedMessages) {
            try {
                setMessages(JSON.parse(savedMessages));
            } catch (e) {
                console.error("Failed to parse chat history", e);
            }
        } else {
            // Default welcome message if no history
            setMessages([{ role: "bot", content: "Hello! I am Dr. Chatbot. How can I help you today?" }]);
        }
    }, []);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem("chatHistory", JSON.stringify(messages));
        }
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Optional: clear chat history on logout? 
        // localStorage.removeItem("chatHistory"); 
        router.push("/");
    };

    const handleNewChat = () => {
        const initialMsg: Message = { role: "bot", content: "Hello! I am Dr. Chatbot. How can I help you today?" };
        setMessages([initialMsg]);
        localStorage.removeItem("chatHistory");
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        try {
            const res = await fetch(`${API_URL}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage.content }),
            });

            if (!res.ok) throw new Error("Failed to fetch response");

            const data = await res.json();
            const botMessage: Message = { role: "bot", content: data.response };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "bot", content: "Sorry, I'm having trouble connecting to the server. Is it running?" },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        Dr
                    </div>
                    <h1 className="font-bold text-xl text-gray-800 dark:text-white">Dr. Chatbot</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase mb-3">History</h2>
                    <div className="space-y-2">
                        <button
                            onClick={handleNewChat}
                            className="w-full text-left px-3 py-2 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium truncate"
                        >
                            New Chat
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm truncate">
                            Previous Chat #1
                        </button>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors"
                    >
                        <span className="text-sm font-medium">Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col h-full relative">
                {/* Mobile Header */}
                <header className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                    <h1 className="font-bold text-lg text-gray-800 dark:text-white">Dr. Chatbot</h1>
                    <button onClick={handleLogout} className="text-sm text-blue-600">Logout</button>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${msg.role === "user"
                                    ? "bg-blue-600 text-white rounded-br-none"
                                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-none"
                                    }`}
                            >
                                <div className={`text-sm leading-relaxed ${msg.role === "bot" ? "markdown-body" : ""}`}>
                                    {msg.role === "bot" ? (
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-2 mb-1" {...props} />,
                                                h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-3 mb-1" {...props} />,
                                                h3: ({ node, ...props }) => <h3 className="text-md font-bold mt-2 mb-1 text-blue-600 dark:text-blue-400" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc ml-4 my-1" {...props} />,
                                                li: ({ node, ...props }) => <li className="mb-0.5" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask Dr. Chatbot..."
                            className="flex-1 w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full p-3 transition-colors flex items-center justify-center shadow-md"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A2.001 2.001 0 005.692 10 2.001 2.001 0 003.693 11.836L2.28 16.761a.75.75 0 00.95.826l14.75-5.25a.75.75 0 000-1.414L3.105 2.289z" />
                            </svg>
                        </button>
                    </form>
                    <p className="text-center text-xs text-gray-500 mt-2">
                        AI responses can be inaccurate. Always consult a real doctor.
                    </p>
                </div>
            </main >
        </div >
    );
}
