import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../Components/AuthContext';
import { io } from 'socket.io-client';
import { Send, Globe2, Loader2, ArrowLeft } from 'lucide-react';
import Navbar from '../Components/Navbar';
import { Link } from 'react-router-dom';

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'mr', name: 'Marathi' },
    { code: 'bn', name: 'Bengali' }
];

const Chat = () => {
    const { user, token } = useContext(AuthContext);
    const [contacts, setContacts] = useState([]);
    const [activeContact, setActiveContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // The language the currently logged-in user wants to read messages in
    const [preferredLanguage, setPreferredLanguage] = useState('en');

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Initial contacts load
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/chat/contacts`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setContacts(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchContacts();
    }, [token]);

    // Setup Socket.io
    useEffect(() => {
        if (!token) return;

        socketRef.current = io(`${import.meta.env.VITE_API_URL}`);

        socketRef.current.on('receive_message', (msg) => {
            // We only append if this message belongs to the current active chat
            if (activeContact && (
                msg.sender._id === activeContact.user._id ||
                msg.receiver._id === activeContact.user._id
            )) {
                setMessages(prev => [...prev, msg]);
                scrollToBottom();
            }

            // TODO: Also update the `contacts` sidebar with latest message
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [token, activeContact]);

    // Load messages when selecting a contact
    useEffect(() => {
        const loadMessages = async () => {
            if (!activeContact) return;
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/chat/${activeContact.user._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessages(res.data);
                scrollToBottom();
            } catch (err) {
                console.error(err);
            }
        };
        loadMessages();
    }, [activeContact, token]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !activeContact) return;

        setSending(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/chat/send`, {
                receiverId: activeContact.user._id,
                text: inputText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // The socket will receive it, but we can optimistically append it
            setMessages(prev => [...prev, res.data]);
            setInputText('');
            scrollToBottom();
        } catch (err) {
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    // Helper: Gets the text to display based on selected preferredLanguage
    const getDisplayText = (msg) => {
        // Did the user send it? Show original text.
        if (msg.sender._id === user._id) return msg.originalText;

        // Incoming message: try to find translation
        if (preferredLanguage === 'en') return msg.originalText;

        if (msg.translatedText && msg.translatedText[preferredLanguage]) {
            return msg.translatedText[preferredLanguage];
        }

        // Fallback
        return msg.originalText;
    };

    return (
        <div className="min-h-screen pb-0 flex flex-col">
            <Navbar />

            <div className="flex-1 max-w-6xl w-full mx-auto p-4 pt-24 flex h-[calc(100vh-80px)]">

                {/* Sidebar - Contacts */}
                <div className={`w-full md:w-1/3 flex flex-col glass-card border-r-0 md:border-r border-white/10 rounded-r-none md:rounded-l-2xl ${activeContact ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-xl font-bold">Messages</h2>

                        {/* Translation Settings Toggle */}
                        <div className="relative group">
                            <button className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-teal-400">
                                <Globe2 size={20} />
                            </button>
                            <div className="absolute right-0 top-10 w-48 bg-gray-900 border border-white/10 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50">
                                <p className="text-xs text-gray-400 px-2 pb-2 mb-1 border-b border-white/10 font-bold uppercase">Incoming Language</p>
                                {LANGUAGES.map(lang => (
                                    <button
                                        key={lang.code}
                                        onClick={() => setPreferredLanguage(lang.code)}
                                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${preferredLanguage === lang.code ? 'bg-teal-500/20 text-teal-400' : 'hover:bg-white/5'}`}
                                    >
                                        {lang.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        {loading ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-teal-500" /></div>
                        ) : contacts.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">No conversations yet. Book an appointment to message your doctor.</div>
                        ) : (
                            contacts.map((contact, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setActiveContact(contact)}
                                    className={`p-4 border-b border-white/5 cursor-pointer flex items-center gap-3 hover:bg-teal-500/10 transition-colors ${activeContact?.user?._id === contact.user._id ? 'bg-teal-500/10 border-l-4 border-l-teal-500' : ''}`}
                                >
                                    <div className="relative">
                                        <img src={contact.user.profileImage?.url || `https://ui-avatars.com/api/?name=${contact.user.name}&background=14b8a6&color=fff`} className="w-12 h-12 rounded-full border border-white/10" alt="avatar" />
                                        {contact.unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#030712]">{contact.unreadCount}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="font-bold text-sm truncate text-white">{contact.user.name}</h4>
                                            <span className="text-[10px] text-gray-500">{new Date(contact.lastMessage.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 truncate w-[90%]">{getDisplayText(contact.lastMessage)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Chat Window */}
                <div className={`w-full md:w-2/3 flex flex-col glass-card border-l-0 md:rounded-r-2xl md:rounded-l-none relative ${!activeContact ? 'hidden md:flex items-center justify-center bg-black/20' : 'flex'}`}>

                    {!activeContact ? (
                        <div className="text-center text-gray-500 flex flex-col items-center">
                            <Globe2 size={48} className="mb-4 opacity-20" />
                            <p className="text-lg">Select a conversation to start messaging</p>
                            <p className="text-sm mt-2">MaaCare supports real-time multilingual translation.</p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-white/10 flex items-center gap-4 bg-white/5 z-10 sticky top-0">
                                <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setActiveContact(null)}>
                                    <ArrowLeft size={24} />
                                </button>
                                <img src={activeContact.user.profileImage?.url || `https://ui-avatars.com/api/?name=${activeContact.user.name}&background=14b8a6&color=fff`} className="w-10 h-10 rounded-full" alt="avatar" />
                                <div>
                                    <h3 className="font-bold">{activeContact.user.name}</h3>
                                    <p className="text-xs text-teal-400">{activeContact.user.role}</p>
                                </div>
                                <div className="ml-auto">
                                    <span className="text-xs font-bold px-2 py-1 bg-teal-500/20 text-teal-300 rounded-full border border-teal-500/30 flex items-center gap-1">
                                        Reading in {LANGUAGES.find(l => l.code === preferredLanguage)?.name}
                                    </span>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                                {messages.map((msg, i) => {
                                    const isMe = msg.sender._id === user._id;
                                    const showTranslationAlert = !isMe && preferredLanguage !== 'en' && msg.translatedText && msg.translatedText[preferredLanguage];

                                    return (
                                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] rounded-2xl p-3 shadow-lg ${isMe ? 'bg-teal-600 rounded-tr-sm text-white' : 'bg-[#1e293b] rounded-tl-sm border border-white/10'}`}>
                                                <p className="text-sm">{getDisplayText(msg)}</p>

                                                <div className="flex justify-between items-center mt-1 gap-4">
                                                    {showTranslationAlert ? (
                                                        <span className="text-[9px] text-teal-400/70 border border-teal-400/20 px-1.5 rounded bg-teal-400/10">Translated</span>
                                                    ) : <span></span>}
                                                    <span className={`text-[10px] ${isMe ? 'text-teal-200' : 'text-gray-500'}`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="p-4 border-t border-white/10 bg-white/5">
                                <form onSubmit={sendMessage} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-black/40 border border-white/10 rounded-full px-5 flex items-center text-sm outline-none focus:border-teal-500 transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!inputText.trim() || sending}
                                        className="w-12 h-12 bg-teal-600 hover:bg-teal-500 rounded-full flex items-center justify-center transition-all disabled:opacity-50 shrink-0"
                                    >
                                        {sending ? <Loader2 size={18} className="animate-spin text-white" /> : <Send size={18} className="text-white ml-1" />}
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Chat;
