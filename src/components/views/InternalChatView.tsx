'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import { UserRole, ChatMessage, ChatAttachment, Employee } from '../../types/erp';
import {
  MessageSquare,
  MessageCircle,
  Send,
  Smile,
  AtSign,
  Search,
  Hash,
  Users,
  User,
  Check,
  CheckCheck,
  Sparkles,
  Package,
  Receipt,
  Pin,
  Shield,
  Phone,
  Mail,
  Filter,
  Plus,
  Radio,
  Clock,
  Image as ImageIcon,
  ImagePlus,
  Globe,
  Languages,
  Download,
  X,
  ChevronDown,
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
  icon: string;
  category: 'team' | 'dept';
}

const CHANNELS: ChannelDef[] = [
  {
    id: 'general',
    nameKey: 'channelGeneral',
    icon: '📢',
    category: 'team',
  },
  {
    id: 'sales',
    nameKey: 'channelSales',
    icon: '🛒',
    category: 'dept',
  },
  {
    id: 'warehouse',
    nameKey: 'channelWarehouse',
    icon: '📦',
    category: 'dept',
  },
  {
    id: 'finance',
    nameKey: 'channelFinance',
    icon: '💼',
    category: 'dept',
  },
];

const EMOJIS = ['👍', '❤️', '🔥', '🎉', '👏', '✅', '📦', '💰', '⚡', '🙏', '🚀', '💯'];

const QUICK_TAGS = [
  { tag: '@all', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400' },
  { tag: '@kho', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' },
  { tag: '@ketoan', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' },
  { tag: '@pos', color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400' },
  { tag: '@admin', color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400' },
];

export const InternalChatView: React.FC = () => {
  const {
    chatMessages,
    sendChatMessage,
    addMessageReaction,
    activeChatChannelId,
    setActiveChatChannelId,
    markChannelAsRead,
    currentUser,
    employees,
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
  const [searchFilter, setSearchFilter] = useState('');
  const [sidebarTab, setSidebarTab] = useState<'channels' | 'direct'>('channels');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto scroll & mark as read
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    markChannelAsRead(activeChatChannelId);
  }, [chatMessages, activeChatChannelId, markChannelAsRead]);

  // Current channel info
  const matchedCh = CHANNELS.find((c) => c.id === activeChatChannelId);
  const currentChannel = matchedCh
    ? {
        id: matchedCh.id,
        name: t[matchedCh.nameKey].name,
        desc: t[matchedCh.nameKey].desc,
        icon: matchedCh.icon,
        category: matchedCh.category,
      }
    : {
        id: activeChatChannelId,
        name: activeChatChannelId.startsWith('dm_') ? 'Tin Nhắn Riêng' : 'Kênh Thảo Luận',
        desc: t.subtitle,
        icon: '💬',
        category: 'team' as const,
      };

  // Filter messages for current channel
  const currentMessages = chatMessages.filter((m) => {
    if (m.channelId !== activeChatChannelId) return false;
    if (!searchFilter.trim()) return true;
    return (
      m.content.toLowerCase().includes(searchFilter.toLowerCase()) ||
      m.senderName.toLowerCase().includes(searchFilter.toLowerCase())
    );
  });

  // Image processing with canvas compression
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

  const getRoleBadge = (msgRole: UserRole) => {
    switch (msgRole) {
      case 'admin':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            Quản Trị
          </span>
        );
      case 'manager':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            Quản Lý
          </span>
        );
      case 'cashier':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
            Thu Ngân
          </span>
        );
      case 'warehouse':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            Thủ Kho
          </span>
        );
      case 'accountant':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            Kế Toán
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full p-6 space-y-6" onPaste={handlePaste}>
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>{t.title}</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t.activeNow}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.subtitle}</p>
        </div>

        {/* Top Controls: Language Switcher & User Profile */}
        <div className="flex items-center gap-3">
          {/* LANGUAGE SELECTOR */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Chuyển đổi ngôn ngữ / Switch Language"
            >
              <Globe className="w-4 h-4 text-indigo-500" />
              <span className="text-sm">{SUPPORTED_LANGUAGES.find((l) => l.code === chatLang)?.flag}</span>
              <span>{SUPPORTED_LANGUAGES.find((l) => l.code === chatLang)?.label}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 py-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Ngôn Ngữ / Language
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSetLang(lang.code)}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-indigo-50 dark:hover:bg-slate-700/60 transition-colors cursor-pointer ${
                      chatLang === lang.code
                        ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-slate-700/40'
                        : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span className="flex-1">{lang.label}</span>
                    {chatLang === lang.code && (
                      <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User profile preview */}
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {currentUser?.name?.charAt(0) || 'L'}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{currentUser?.name || 'Lê Thanh Long'}</span>
                {getRoleBadge(role || 'admin')}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {currentUser?.email || 'admin@nexus-erp.vn'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DUAL-PANE CHAT CONTAINER */}
      <div className="h-[750px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* LEFT PANE: CHANNELS & MEMBERS */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 bg-slate-50/70 dark:bg-[#0B0F19]/60">
          {/* Search bar */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Tìm tin nhắn hoặc nhân viên..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Sub-tabs: Channels vs Colleagues */}
          <div className="px-3 pt-3 flex gap-2 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setSidebarTab('channels')}
              className={`flex-1 pb-2 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                sidebarTab === 'channels'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t.channelsTab}
            </button>
            <button
              onClick={() => setSidebarTab('direct')}
              className={`flex-1 pb-2 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                sidebarTab === 'direct'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t.directTab}
            </button>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {sidebarTab === 'channels' ? (
              <>
                <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {t.channelsHeader}
                </div>
                {CHANNELS.map((ch) => {
                  const isActive = activeChatChannelId === ch.id;
                  const unread = chatMessages.filter(
                    (m) =>
                      m.channelId === ch.id && m.senderId !== (currentUser?.id || 'usr_admin_01')
                  ).length;
                  const chInfo = t[ch.nameKey];

                  return (
                    <button
                      key={ch.id}
                      onClick={() => {
                        setActiveChatChannelId(ch.id);
                        markChannelAsRead(ch.id);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-xs font-bold'
                          : 'hover:bg-slate-200/70 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base shrink-0">{ch.icon}</span>
                        <div className="min-w-0">
                          <div className="text-xs truncate">{chInfo.name}</div>
                          <div
                            className={`text-[10px] truncate ${
                              isActive
                                ? 'text-indigo-100 opacity-90'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {chInfo.desc}
                          </div>
                        </div>
                      </div>
                      {unread > 0 && !isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shrink-0">
                          {unread}
                        </span>
                      )}
                    </button>
                  );
                })}
              </>
            ) : (
              <>
                <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {t.colleaguesHeader}
                </div>
                {employees.map((emp) => {
                  const dmId = `dm_${emp.id}`;
                  const isActive = activeChatChannelId === dmId;

                  return (
                    <button
                      key={emp.id}
                      onClick={() => {
                        setActiveChatChannelId(dmId);
                        markChannelAsRead(dmId);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-xs font-bold'
                          : 'hover:bg-slate-200/70 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs">
                            {emp.name.charAt(0)}
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs truncate">{emp.name}</div>
                          <div
                            className={`text-[10px] truncate ${
                              isActive ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {emp.roleTitle} • {emp.branch}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* RIGHT PANE: CHAT STREAM & COMPOSER */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/30 dark:bg-[#0B0F19]/30">
          {/* Channel top banner */}
          <div className="px-6 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentChannel.icon}</span>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{currentChannel.name}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t.activeNow}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{currentChannel.desc}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:inline">
                {currentMessages.length} tin nhắn
              </span>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {currentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500">
                <MessageCircle className="w-12 h-12 stroke-1 mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-semibold">{t.noMessages}</p>
                <p className="text-xs text-slate-400 mt-1">{t.noMessagesSub}</p>
              </div>
            ) : (
              currentMessages.map((msg) => {
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
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1 px-1 text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {isMe ? t.you : msg.senderName}
                      </span>
                      {!isMe && getRoleBadge(msg.senderRole)}
                      <span className="text-[11px] text-slate-400">{msg.timestamp}</span>

                      {/* Translate button */}
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
                      className={`relative max-w-xl px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white rounded-tr-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-tl-xs'
                      }`}
                    >
                      {msg.tag && (
                        <span
                          className={`inline-block mr-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isMe
                              ? 'bg-white/20 text-white'
                              : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                          }`}
                        >
                          {t.tags[msg.tag] || msg.tag}
                        </span>
                      )}

                      {displayedText && (
                        <span className="whitespace-pre-wrap text-sm">{displayedText}</span>
                      )}

                      {/* Translation bar */}
                      {isTranslated && (
                        <div className="mt-1.5 pt-1.5 border-t border-current/15 flex items-center justify-between text-[10px] opacity-85">
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
                        <div className="mt-2.5 space-y-1.5">
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
                                    className="max-h-72 w-auto max-w-full rounded-xl object-contain cursor-pointer shadow-sm hover:opacity-95 transition-all border border-slate-200/40 dark:border-slate-700/40 bg-black/5"
                                  />
                                  <div className="flex items-center justify-between mt-1 text-[11px] opacity-80">
                                    <span className="truncate max-w-xs">{att.title}</span>
                                    <span
                                      className="underline text-[10px] cursor-pointer hover:opacity-100"
                                      onClick={() =>
                                        setPreviewModalImg({
                                          url: att.url!,
                                          title: att.title || 'Hình ảnh',
                                        })
                                      }
                                    >
                                      {t.previewImage}
                                    </span>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={attIdx}
                                className={`p-2.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold border ${
                                  isMe
                                    ? 'bg-white/10 border-white/20 text-white'
                                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {att.type === 'order' && (
                                  <Receipt className="w-4 h-4 text-amber-400 shrink-0" />
                                )}
                                {att.type === 'product' && (
                                  <Package className="w-4 h-4 text-indigo-400 shrink-0" />
                                )}
                                <span>{att.title}</span>
                                {att.code && (
                                  <span className="font-mono text-[10px] opacity-80 shrink-0">
                                    ({att.code})
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Reactions display & hover react bar */}
                    <div className="flex items-center gap-1.5 mt-1.5 px-1">
                      {msg.reactions &&
                        Object.entries(msg.reactions).map(([emoji, users]) => {
                          if (users.length === 0) return null;
                          const userReacted = users.includes(currentUser?.id || 'usr_admin_01');

                          return (
                            <button
                              key={emoji}
                              onClick={() => addMessageReaction(msg.id, emoji)}
                              className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 border transition-all cursor-pointer ${
                                userReacted
                                  ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-950/60 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-bold'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                              }`}
                              title={`${users.length} người đã phản hồi`}
                            >
                              <span>{emoji}</span>
                              <span>{users.length}</span>
                            </button>
                          );
                        })}

                      {/* Quick react hover bar */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-1">
                        {['👍', '❤️', '🔥', '✅'].map((emo) => (
                          <button
                            key={emo}
                            onClick={() => addMessageReaction(msg.id, emo)}
                            className="p-1 rounded text-xs hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-transform hover:scale-125"
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

          {/* Quick reply templates */}
          <div className="px-6 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-xs font-bold text-slate-400 shrink-0">{t.quickSuggestions}</span>
            {t.suggestions.map((tmpl, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputContent(tmpl);
                  if (inputRef.current) inputRef.current.focus();
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                {tmpl}
              </button>
            ))}
          </div>

          {/* COMPOSER BAR */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
            {/* Tag selector chips */}
            <div className="flex items-center gap-2 mb-2.5 overflow-x-auto no-scrollbar">
              <span className="text-xs text-slate-400 shrink-0 font-medium">{t.tagDepartment}</span>
              {QUICK_TAGS.map((tagItem) => (
                <button
                  key={tagItem.tag}
                  onClick={() =>
                    setSelectedTag(selectedTag === tagItem.tag ? null : tagItem.tag)
                  }
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
              <div className="mb-2.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between gap-3 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-indigo-300 dark:border-indigo-700 shrink-0 bg-black/10">
                    <img
                      src={selectedImage.previewUrl}
                      alt={selectedImage.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {selectedImage.title}
                    </div>
                    <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                      {t.imageAttached} • {t.pasteImageTip}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title={t.removeImage}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Input field */}
            <div className="flex items-center gap-2.5">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              {/* Attach Image Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-3 rounded-xl border transition-all cursor-pointer shrink-0 ${
                  selectedImage
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-600 dark:text-indigo-400'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
                title={t.attachImage}
              >
                <ImagePlus className="w-5 h-5" />
              </button>

              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.typePlaceholder}
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />

                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-500 cursor-pointer transition-colors"
                  title="Emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleSend}
                disabled={!inputContent.trim() && !selectedImage}
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold flex items-center gap-2 shadow-sm hover:shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <span>{t.send}</span>
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Emoji popover */}
            {showEmojiPicker && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5">
                {EMOJIS.map((emo) => (
                  <button
                    key={emo}
                    onClick={() => {
                      setInputContent((prev) => prev + emo);
                      setShowEmojiPicker(false);
                      if (inputRef.current) inputRef.current.focus();
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-lg cursor-pointer transition-transform hover:scale-125"
                  >
                    {emo}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FULLSCREEN IMAGE LIGHTBOX MODAL */}
      {previewModalImg && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewModalImg(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5 truncate max-w-md">
                <ImageIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-sm font-semibold truncate">{previewModalImg.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewModalImg.url}
                  download={previewModalImg.title || 'chat-image.jpg'}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
                  title={t.downloadImage}
                >
                  <Download className="w-4 h-4" />
                  <span>{t.downloadImage}</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewModalImg(null)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 transition-colors"
                  title={t.close}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/50">
              <img
                src={previewModalImg.url}
                alt={previewModalImg.title}
                className="max-h-[78vh] max-w-full object-contain rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
