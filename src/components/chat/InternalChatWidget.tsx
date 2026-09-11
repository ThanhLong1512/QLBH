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
  ExternalLink
} from 'lucide-react';

interface ChannelDef {
  id: string;
  name: string;
  shortName: string;
  desc: string;
  icon: string;
  badgeRole?: UserRole;
}

const CHANNELS: ChannelDef[] = [
  {
    id: 'general',
    name: '📢 Kênh Chung Công Ty',
    shortName: 'Chung',
    desc: 'Thông báo & thảo luận toàn bộ nhân viên các bộ phận',
    icon: '📢',
  },
  {
    id: 'sales',
    name: '🛒 Bán Hàng & Thu Ngân',
    shortName: 'Bán Hàng',
    desc: 'Quầy POS, báo giá sỉ/lẻ, tư vấn khách & bàn giao ca',
    icon: '🛒',
  },
  {
    id: 'warehouse',
    name: '📦 Kho Vận & Giao Hàng',
    shortName: 'Kho Vận',
    desc: 'Kiểm kê thực tế, chuẩn bị hàng xuất & tiếp nhận nhập kho',
    icon: '📦',
  },
  {
    id: 'finance',
    name: '💼 Kế Toán & Quản Lý',
    shortName: 'Kế Toán',
    desc: 'Phê duyệt hạn mức nợ, đối soát dòng tiền & sổ quỹ',
    icon: '💼',
  },
];

const EMOJIS = ['👍', '❤️', '🔥', '🎉', '👏', '✅', '📦', '💰', '⚡', '🙏'];

const QUICK_TAGS = [
  { tag: '@all', label: '@TấtCả', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400' },
  { tag: '@kho', label: '@Kho', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' },
  { tag: '@ketoan', label: '@KếToán', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' },
  { tag: '@pos', label: '@ThuNgân', color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400' },
  { tag: '@admin', label: '@QuảnTrị', color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400' },
];

const QUICK_SUGGESTIONS = [
  'Kho kiểm tra giúp mã này còn bao nhiêu hàng ạ?',
  'Đã xuất kho và bàn giao cho tài xế giao hàng',
  'Nhờ kế toán duyệt nhanh đơn công nợ cho khách sỉ',
  'Quầy POS đang bàn giao ca, tiền mặt đối soát khớp 100%',
  'Đã tiếp nhận thông tin và xử lý xong nhé!',
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
    employees,
  } = useERP();

  const [inputContent, setInputContent] = useState('');
  const [activeTab, setActiveTab] = useState<'channels' | 'direct'>('channels');
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
  const currentChannel = CHANNELS.find((c) => c.id === activeChatChannelId) || {
    id: activeChatChannelId,
    name: activeChatChannelId.startsWith('dm_') ? '💬 Tin Nhắn Trực Tiếp' : '📢 Kênh Thảo Luận',
    shortName: 'Kênh',
    desc: 'Hội thoại nội bộ',
    icon: '💬',
  };

  // Filter messages for current channel
  const channelMessages = chatMessages.filter((m) => {
    const matchesChannel = m.channelId === activeChatChannelId;
    if (!matchesChannel) return false;
    if (!searchQuery.trim()) return true;
    return m.content.toLowerCase().includes(searchQuery.toLowerCase()) || m.senderName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Handle Send
  const handleSend = () => {
    if (!inputContent.trim()) return;
    sendChatMessage(activeChatChannelId, inputContent.trim(), selectedTag || undefined);
    setInputContent('');
    setSelectedTag(null);
    setShowEmojiPicker(false);
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
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">Quản Trị</span>;
      case 'manager':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">Quản Lý</span>;
      case 'cashier':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400">Thu Ngân</span>;
      case 'warehouse':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">Thủ Kho</span>;
      case 'accountant':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">Kế Toán</span>;
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
          aria-label="Mở Chat Nội Bộ"
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
          <span className="text-xs font-bold tracking-wide hidden sm:inline">Chat Nội Bộ</span>
          {unreadChatCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
              {unreadChatCount} mới
            </span>
          )}
        </button>
      )}

      {/* FLOATING CHATBOX WINDOW */}
      {isChatOpen && (
        <div
          className={`fixed bottom-6 right-4 sm:right-6 z-50 w-[94vw] sm:w-[460px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-950/20 dark:shadow-black/60 flex flex-col overflow-hidden transition-all duration-200 backdrop-blur-xl ${
            isMinimized ? 'h-[60px]' : 'h-[620px] max-h-[85vh]'
          }`}
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
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Trực tuyến" />
                </div>
                <div className="text-[10px] text-indigo-100 truncate opacity-90">
                  {currentChannel.desc}
                </div>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1 shrink-0">
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
                title="Đóng chatbox"
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
                    <p className="text-xs font-medium">Chưa có tin nhắn nào trong kênh này.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Gõ tin nhắn đầu tiên bên dưới để trao đổi cùng đồng nghiệp!</p>
                  </div>
                ) : (
                  channelMessages.map((msg) => {
                    const isMe = msg.senderId === (currentUser?.id || 'usr_admin_01');

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        {/* Sender info */}
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px]">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {isMe ? 'Bạn' : msg.senderName}
                          </span>
                          {!isMe && getRoleBadge(msg.senderRole)}
                          <span className="text-slate-400 text-[10px]">{msg.timestamp}</span>
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
                              {msg.tag}
                            </span>
                          )}

                          <span className="whitespace-pre-wrap">{msg.content}</span>

                          {/* Attachments preview */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {msg.attachments.map((att, attIdx) => (
                                <div
                                  key={attIdx}
                                  className={`p-2 rounded-xl flex items-center gap-2 text-[11px] font-semibold border ${
                                    isMe
                                      ? 'bg-white/10 border-white/20 text-white'
                                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                                  }`}
                                >
                                  {att.type === 'order' && <Receipt className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                                  {att.type === 'product' && <Package className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                                  <span className="truncate">{att.title}</span>
                                  {att.code && <span className="font-mono opacity-80 shrink-0 text-[10px]">({att.code})</span>}
                                </div>
                              ))}
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
                <span className="text-[10px] font-bold text-slate-400 shrink-0">Gợi ý nhanh:</span>
                {QUICK_SUGGESTIONS.map((sug, idx) => (
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
                  <span className="text-[10px] text-slate-400 shrink-0">Tag bộ phận:</span>
                  {QUICK_TAGS.map((t) => (
                    <button
                      key={t.tag}
                      onClick={() => setSelectedTag(selectedTag === t.tag ? null : t.tag)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        selectedTag === t.tag
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : `${t.color} hover:opacity-80`
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Input field & send button */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputContent}
                      onChange={(e) => setInputContent(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Gửi tin nhắn trong ${currentChannel.shortName}...`}
                      className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />

                    {/* Emoji toggle inside input */}
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-500 cursor-pointer"
                      title="Chèn biểu tượng cảm xúc"
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={handleSend}
                    disabled={!inputContent.trim()}
                    className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-sm hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
                    title="Gửi tin nhắn (Enter)"
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
    </>
  );
};
