'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import { UserRole, ChatMessage, ChatAttachment } from '../../types/erp';
import {
  MessageSquare,
  MessageCircle,
  Send,
  Smile,
  AtSign,
  X,
  Minimize2,
  Maximize2,
  ChevronDown,
  Hash,
  Users,
  User,
  Check,
  CheckCheck,
  Sparkles,
  Paperclip,
  Package,
  Receipt,
  Search,
  Pin,
  ExternalLink,
  Image as ImageIcon,
  ImagePlus,
  Globe,
  Languages,
  Download,
} from 'lucide-react';
import {
  ChatLang,
  SUPPORTED_LANGUAGES,
  CHAT_TRANSLATIONS,
  translateMessage,
} from '../../lib/chatI18n';

interface ChannelDef {
  id: string;
  nameKey: 'channelGeneral' | 'channelSales' | 'channelWarehouse' | 'channelFinance';
  shortName: string;
  icon: string;
  badgeRole?: UserRole;
}

const CHANNELS: ChannelDef[] = [
  {
    id: 'general',
    nameKey: 'channelGeneral',
    shortName: 'Chung',
    icon: '📢',
  },
  {
    id: 'sales',
    nameKey: 'channelSales',
    shortName: 'Bán Hàng',
    icon: '🛒',
  },
  {
    id: 'warehouse',
    nameKey: 'channelWarehouse',
    shortName: 'Kho Vận',
    icon: '📦',
  },
  {
    id: 'finance',
    nameKey: 'channelFinance',
    shortName: 'Kế Toán',
    icon: '💼',
  },
];

const EMOJIS = ['👍', '❤️', '🔥', '🎉', '👏', '✅', '📦', '💰', '⚡', '🙏'];

const QUICK_TAGS = [
  { tag: '@all', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400' },
  { tag: '@kho', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' },
  { tag: '@ketoan', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' },
  { tag: '@pos', color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400' },
  { tag: '@admin', color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400' },
];

export const InternalChatWidget: React.FC<{ onExpandToView?: () => void }> = ({ onExpandToView }) => {
  const {
    chatMessages,
    sendChatMessage,
    addMessageReaction,
    unreadChatCount,
    markChannelAsRead,
    isChatOpen,
    setIsChatOpen,
    activeChatChannelId,
    setActiveChatChannelId,
    currentUser,
    role,
  } = useERP();

  // Language state
  const [chatLang, setChatLang] = useState<ChatLang>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('nexus_chat_lang') as ChatLang) || 'vi';
    }
    return 'vi';
  });
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Translation per message
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, boolean>>({});

  const t = CHAT_TRANSLATIONS[chatLang] || CHAT_TRANSLATIONS.vi;

  const handleSetLang = (newLang: ChatLang) => {
    setChatLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexus_chat_lang', newLang);
    }
    setShowLangMenu(false);
  };

  const toggleTranslate = (msgId: string) => {
    setTranslatedMessages((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  // Image Uploading State
  const [selectedImage, setSelectedImage] = useState<{
    file?: File;
    previewUrl: string;
    title: string;
  } | null>(null);

  // Lightbox Modal Image Preview
  const [previewModalImg, setPreviewModalImg] = useState<{ url: string; title: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [inputContent, setInputContent] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto scroll to bottom when messages in active channel change
  useEffect(() => {
    if (isChatOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      markChannelAsRead(activeChatChannelId);
    }
  }, [chatMessages, activeChatChannelId, isChatOpen, isMinimized, markChannelAsRead]);

  // Current channel info
  const matchedCh = CHANNELS.find((c) => c.id === activeChatChannelId);
  const currentChannel = matchedCh
    ? {
        id: matchedCh.id,
        name: t[matchedCh.nameKey].name,
        shortName: matchedCh.shortName,
        desc: t[matchedCh.nameKey].desc,
        icon: matchedCh.icon,
      }
    : {
        id: activeChatChannelId,
        name: activeChatChannelId.startsWith('dm_') ? '💬 ' + t.directTab : '📢 ' + t.channelsTab,
        shortName: 'Chat',
        desc: t.subtitle,
        icon: '💬',
      };

  // Filter messages for current channel
  const channelMessages = chatMessages.filter((m) => {
    const matchesChannel = m.channelId === activeChatChannelId;
    if (!matchesChannel) return false;
    if (!searchQuery.trim()) return true;
    return (
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.senderName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Image processing & canvas compression (< 350KB)
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rawUrl = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setSelectedImage({
            file,
            previewUrl: compressed,
            title: file.name || 'Ảnh đính kèm',
          });
        } else {
          setSelectedImage({
            file,
            previewUrl: rawUrl,
            title: file.name || 'Ảnh đính kèm',
          });
        }
      };
      img.src = rawUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          processImageFile(file);
        }
      }
    }
  };

  // Handle Send
  const handleSend = () => {
    if (!inputContent.trim() && !selectedImage) return;

    const attachments: ChatAttachment[] = [];
    if (selectedImage) {
      attachments.push({
        type: 'image',
        title: selectedImage.title,
        url: selectedImage.previewUrl,
      });
    }

    sendChatMessage(
      activeChatChannelId,
      inputContent.trim(),
      selectedTag || undefined,
      attachments.length > 0 ? attachments : undefined
    );

    setInputContent('');
    setSelectedImage(null);
    setSelectedTag(null);
    setShowEmojiPicker(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Toggle open
  const handleToggleOpen = () => {
    if (!isChatOpen) {
      setIsChatOpen(true);
      setIsMinimized(false);
      markChannelAsRead(activeChatChannelId);
    } else {
      setIsChatOpen(false);
    }
  };

  const getRoleBadge = (msgRole: UserRole) => {
    switch (msgRole) {
      case 'admin':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
            Quản Trị
          </span>
        );
      case 'manager':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
            Quản Lý
          </span>
        );
      case 'cashier':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400">
            Thu Ngân
          </span>
        );
      case 'warehouse':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
            Thủ Kho
          </span>
        );
      case 'accountant':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
            Kế Toán
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON (Bottom-right) */}
      {!isChatOpen && (
        <button
          onClick={handleToggleOpen}
          aria-label={t.title}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-white transition-transform group-hover:rotate-6" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {unreadChatCount}
              </span>
            )}
          </div>
          <span className="text-xs font-bold tracking-wide hidden sm:inline">{t.title}</span>
          {unreadChatCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
              {unreadChatCount}
            </span>
          )}
        </button>
      )}

      {/* FLOATING CHATBOX WINDOW */}
      {isChatOpen && (
        <div
          className={`fixed bottom-6 right-4 sm:right-6 z-50 w-[94vw] sm:w-[480px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-950/20 dark:shadow-black/60 flex flex-col overflow-hidden transition-all duration-200 backdrop-blur-xl ${
            isMinimized ? 'h-[60px]' : 'h-[640px] max-h-[88vh]'
          }`}
          onPaste={handlePaste}
        >
          {/* HEADER */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-sm select-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-base shrink-0 shadow-inner">
                {currentChannel.icon || '💬'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate flex items-center gap-1.5">
                  <span>{currentChannel.name}</span>
                  <span
                    className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
                    title={t.activeNow}
                  />
                </div>
                <div className="text-[10px] text-indigo-100 truncate opacity-90">
                  {currentChannel.desc}
                </div>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1 shrink-0">
              {/* LANGUAGE SELECTOR */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                  title="Chuyển đổi ngôn ngữ / Switch Language"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{SUPPORTED_LANGUAGES.find((l) => l.code === chatLang)?.flag}</span>
                  <span className="font-mono text-[10px]">{chatLang.toUpperCase()}</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {showLangMenu && (
                  <div className="absolute right-0 top-full mt-1.5 w-40 py-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 animate-in fade-in zoom-in-95">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleSetLang(lang.code)}
                        className={`w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-slate-700/60 transition-colors cursor-pointer ${
                          chatLang === lang.code
                            ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-slate-700/40'
                            : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <span className="text-sm">{lang.flag}</span>
                        <span className="flex-1">{lang.label}</span>
                        {chatLang === lang.code && (
                          <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {onExpandToView && (
                <button
                  onClick={() => {
                    setIsChatOpen(false);
                    onExpandToView();
                  }}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  title="Mở toàn màn hình"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title={isMinimized ? 'Phóng to' : 'Thu nhỏ'}
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title={t.close}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MAIN BODY (Only when not minimized) */}
          {!isMinimized && (
            <>
              {/* CHANNEL SWITCHER & TABS */}
              <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                {CHANNELS.map((ch) => {
                  const isChActive = activeChatChannelId === ch.id;
                  const chUnread = chatMessages.filter(
                    (m) => m.channelId === ch.id && m.senderId !== (currentUser?.id || 'usr_admin_01')
                  ).length;
                  const chName = t[ch.nameKey].name;

                  return (
                    <button
                      key={ch.id}
                      onClick={() => {
                        setActiveChatChannelId(ch.id);
                        markChannelAsRead(ch.id);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        isChActive
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60'
                      }`}
                      title={chName}
                    >
                      <span>{ch.icon}</span>
                      <span>{ch.shortName}</span>
                      {chUnread > 0 && !isChActive && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white">
                          {chUnread}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* MESSAGE FEED CONTAINER */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/40 dark:bg-[#0B0F19]/40">
                {channelMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
                    <MessageCircle className="w-10 h-10 mb-2 stroke-1 text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-medium">{t.noMessages}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{t.noMessagesSub}</p>
                  </div>
                ) : (
                  channelMessages.map((msg) => {
                    const isMe = msg.senderId === (currentUser?.id || 'usr_admin_01');
                    const isTranslated = translatedMessages[msg.id];
                    const displayedText = isTranslated
                      ? translateMessage(msg.content, chatLang)
                      : msg.content;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        {/* Sender info */}
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px]">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {isMe ? t.you : msg.senderName}
                          </span>
                          {!isMe && getRoleBadge(msg.senderRole)}
                          <span className="text-slate-400 text-[10px]">{msg.timestamp}</span>

                          {/* Quick translate button on message header */}
                          {msg.content && (
                            <button
                              type="button"
                              onClick={() => toggleTranslate(msg.id)}
                              className={`ml-1 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 transition-all cursor-pointer ${
                                isTranslated
                                  ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold'
                                  : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                              title={isTranslated ? t.showOriginal : `${t.translateBtn} (${chatLang.toUpperCase()})`}
                            >
                              <Languages className="w-3 h-3" />
                              <span>{isTranslated ? t.showOriginal : t.translateBtn}</span>
                            </button>
                          )}
                        </div>

                        {/* Bubble */}
                        <div
                          className={`relative max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                            isMe
                              ? 'bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white rounded-tr-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-tl-xs'
                          }`}
                        >
                          {/* Tag highlight if present */}
                          {msg.tag && (
                            <span
                              className={`inline-block mr-1.5 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                isMe
                                  ? 'bg-white/20 text-white'
                                  : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                              }`}
                            >
                              {t.tags[msg.tag] || msg.tag}
                            </span>
                          )}

                          {/* Text content */}
                          {displayedText && (
                            <span className="whitespace-pre-wrap">{displayedText}</span>
                          )}

                          {/* Translation indicator bar */}
                          {isTranslated && (
                            <div className="mt-1 pt-1 border-t border-current/15 flex items-center justify-between text-[10px] opacity-85">
                              <span className="font-semibold flex items-center gap-1">
                                🌐 {t.translatedBadge} ({chatLang.toUpperCase()})
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleTranslate(msg.id)}
                                className="underline hover:opacity-100 cursor-pointer"
                              >
                                {t.showOriginal}
                              </button>
                            </div>
                          )}

                          {/* Attachments (Image, Order, Product) */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-1.5">
                              {msg.attachments.map((att, attIdx) => {
                                if (att.type === 'image' && att.url) {
                                  return (
                                    <div key={attIdx} className="relative group/img">
                                      <img
                                        src={att.url}
                                        alt={att.title || 'Hình ảnh'}
                                        onClick={() =>
                                          setPreviewModalImg({
                                            url: att.url!,
                                            title: att.title || 'Hình ảnh đính kèm',
                                          })
                                        }
                                        className="max-h-56 w-auto max-w-full rounded-xl object-contain cursor-pointer shadow-sm hover:opacity-95 transition-all border border-slate-200/40 dark:border-slate-700/40 bg-black/5"
                                      />
                                      <div className="flex items-center justify-between mt-1 text-[10px] opacity-75">
                                        <span className="truncate max-w-[180px]">{att.title}</span>
                                        <span className="text-[9px] underline cursor-pointer hover:opacity-100" onClick={() => setPreviewModalImg({ url: att.url!, title: att.title || 'Hình ảnh' })}>
                                          {t.previewImage}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                }

                                return (
                                  <div
                                    key={attIdx}
                                    className={`p-2 rounded-xl flex items-center gap-2 text-[11px] font-semibold border ${
                                      isMe
                                        ? 'bg-white/10 border-white/20 text-white'
                                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                                    }`}
                                  >
                                    {att.type === 'order' && (
                                      <Receipt className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    )}
                                    {att.type === 'product' && (
                                      <Package className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                    )}
                                    <span className="truncate">{att.title}</span>
                                    {att.code && (
                                      <span className="font-mono opacity-80 shrink-0 text-[10px]">
                                        ({att.code})
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Emoji Reactions display & quick react trigger */}
                        <div className="flex items-center gap-1 mt-1 px-1">
                          {msg.reactions &&
                            Object.entries(msg.reactions).map(([emoji, users]) => {
                              if (users.length === 0) return null;
                              const userReacted = users.includes(currentUser?.id || 'usr_admin_01');

                              return (
                                <button
                                  key={emoji}
                                  onClick={() => addMessageReaction(msg.id, emoji)}
                                  className={`px-1.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 border transition-all cursor-pointer ${
                                    userReacted
                                      ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-950/60 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-bold'
                                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                  }`}
                                  title={`${users.length} người đã thả cảm xúc`}
                                >
                                  <span>{emoji}</span>
                                  <span>{users.length}</span>
                                </button>
                              );
                            })}

                          {/* Quick react hover bar */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 ml-1">
                            {['👍', '❤️', '🔥', '✅'].map((emo) => (
                              <button
                                key={emo}
                                onClick={() => addMessageReaction(msg.id, emo)}
                                className="p-0.5 rounded text-[11px] hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                              >
                                {emo}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* QUICK SUGGESTIONS CAROUSEL */}
              <div className="px-3 py-1.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-bold text-slate-400 shrink-0">
                  {t.quickSuggestions}
                </span>
                {t.suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputContent(sug);
                      if (inputRef.current) inputRef.current.focus();
                    }}
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap transition-colors cursor-pointer shrink-0"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {/* INPUT BAR */}
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
                {/* Tag selector chips */}
                <div className="flex items-center gap-1.5 mb-2 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] text-slate-400 shrink-0">{t.tagDepartment}</span>
                  {QUICK_TAGS.map((tagItem) => (
                    <button
                      key={tagItem.tag}
                      onClick={() =>
                        setSelectedTag(selectedTag === tagItem.tag ? null : tagItem.tag)
                      }
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        selectedTag === tagItem.tag
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : `${tagItem.color} hover:opacity-80`
                      }`}
                    >
                      {t.tags[tagItem.tag] || tagItem.tag}
                    </button>
                  ))}
                </div>

                {/* Selected Image Preview Chip */}
                {selectedImage && (
                  <div className="mb-2 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between gap-2 animate-in fade-in zoom-in-95">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-indigo-300 dark:border-indigo-700 shrink-0 bg-black/10">
                        <img
                          src={selectedImage.previewUrl}
                          alt={selectedImage.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                          {selectedImage.title}
                        </div>
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                          {t.imageAttached}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title={t.removeImage}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Input field & buttons */}
                <div className="flex items-center gap-1.5">
                  {/* Hidden File Input for Images */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  {/* Image Attachment Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                      selectedImage
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-600 dark:text-indigo-400'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`}
                    title={t.attachImage}
                  >
                    <ImagePlus className="w-4 h-4" />
                  </button>

                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputContent}
                      onChange={(e) => setInputContent(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t.typePlaceholder}
                      className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />

                    {/* Emoji toggle inside input */}
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-500 cursor-pointer"
                      title="Emoji"
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={handleSend}
                    disabled={!inputContent.trim() && !selectedImage}
                    className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-sm hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
                    title={`${t.send} (Enter)`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Emoji Bar (if opened) */}
                {showEmojiPicker && (
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                    {EMOJIS.map((emo) => (
                      <button
                        key={emo}
                        onClick={() => {
                          setInputContent((prev) => prev + emo);
                          setShowEmojiPicker(false);
                          if (inputRef.current) inputRef.current.focus();
                        }}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-base cursor-pointer transition-transform hover:scale-125"
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* FULLSCREEN IMAGE LIGHTBOX MODAL */}
      {previewModalImg && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewModalImg(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 truncate max-w-md">
                <ImageIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-xs font-semibold truncate">{previewModalImg.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewModalImg.url}
                  download={previewModalImg.title || 'chat-image.jpg'}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title={t.downloadImage}
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewModalImg(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 transition-colors"
                  title={t.close}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-3 flex items-center justify-center bg-black/40">
              <img
                src={previewModalImg.url}
                alt={previewModalImg.title}
                className="max-h-[78vh] max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
