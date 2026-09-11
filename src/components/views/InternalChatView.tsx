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
  Clock
} from 'lucide-react';

interface ChannelDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  category: 'team' | 'dept';
}

const CHANNELS: ChannelDef[] = [
  {
    id: 'general',
    name: 'Kênh Chung Công Ty',
    desc: 'Thông báo chung, văn hóa doanh nghiệp & thảo luận toàn thể nhân viên',
    icon: '📢',
    category: 'team',
  },
  {
    id: 'sales',
    name: 'Bán Hàng & Thu Ngân',
    desc: 'Quầy POS, chốt đơn hàng, báo giá sỉ/lẻ & bàn giao ca làm việc',
    icon: '🛒',
    category: 'dept',
  },
  {
    id: 'warehouse',
    name: 'Kho Vận & Giao Hàng',
    desc: 'Báo tồn kho thực tế, sắp xếp soạn hàng & giao nhận hàng hóa',
    icon: '📦',
    category: 'dept',
  },
  {
    id: 'finance',
    name: 'Kế Toán & Quản Lý',
    desc: 'Thẩm định duyệt nợ, báo cáo dòng tiền, đối soát thu chi & quyết toán',
    icon: '💼',
    category: 'dept',
  },
];

const EMOJIS = ['👍', '❤️', '🔥', '🎉', '👏', '✅', '📦', '💰', '⚡', '🙏', '🚀', '💯'];

const QUICK_TAGS = [
  { tag: '@all', label: '@TấtCả', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400' },
  { tag: '@kho', label: '@Kho', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' },
  { tag: '@ketoan', label: '@KếToán', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' },
  { tag: '@pos', label: '@ThuNgân', color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400' },
  { tag: '@admin', label: '@QuảnTrị', color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400' },
];

const QUICK_TEMPLATES = [
  'Kho kiểm tra giúp mã này còn bao nhiêu hàng trên kệ?',
  'Đã xuất kho và bàn giao đơn hàng cho shipper giao đi.',
  'Nhờ kế toán duyệt nhanh đơn công nợ cho khách hàng.',
  'Quầy thu ngân đã đối soát tiền mặt cuối ca khớp 100%.',
  'Đã tiếp nhận yêu cầu và đang xử lý ngay nhé!',
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
  const currentChannel = CHANNELS.find((c) => c.id === activeChatChannelId) || {
    id: activeChatChannelId,
    name: activeChatChannelId.startsWith('dm_') ? 'Tin Nhắn Trực Tiếp' : 'Kênh Thảo Luận',
    desc: 'Hội thoại nội bộ doanh nghiệp',
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

  const getRoleBadge = (msgRole: UserRole) => {
    switch (msgRole) {
      case 'admin':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">Quản Trị</span>;
      case 'manager':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">Quản Lý</span>;
      case 'cashier':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">Thu Ngân</span>;
      case 'warehouse':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">Thủ Kho</span>;
      case 'accountant':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">Kế Toán</span>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full p-6 space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Phòng Chat Nội Bộ Doanh Nghiệp</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Trực tuyến realtime
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kênh trao đổi công việc tức thời giữa Thu ngân, Thủ kho, Kế toán và Ban điều hành
          </p>
        </div>

        {/* Current user profile preview */}
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
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Navigation tab switch */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-3 pt-2 gap-2">
            <button
              onClick={() => setSidebarTab('channels')}
              className={`pb-2 px-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                sidebarTab === 'channels'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Kênh Thảo Luận ({CHANNELS.length})
            </button>
            <button
              onClick={() => setSidebarTab('direct')}
              className={`pb-2 px-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                sidebarTab === 'direct'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Tin Nhắn Trực Tiếp ({employees.length})
            </button>
          </div>

          {/* List content */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sidebarTab === 'channels' ? (
              <>
                <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Kênh Chuyên Môn
                </div>
                {CHANNELS.map((ch) => {
                  const isActive = activeChatChannelId === ch.id;
                  const unread = chatMessages.filter(
                    (m) => m.channelId === ch.id && m.senderId !== (currentUser?.id || 'usr_admin_01')
                  ).length;

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
                          <div className="text-xs truncate">{ch.name}</div>
                          <div
                            className={`text-[10px] truncate ${
                              isActive ? 'text-indigo-100 opacity-90' : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {ch.desc}
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
                  Nhân Sự Trong Doanh Nghiệp
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
                    Đang hoạt động
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
                <p className="text-sm font-semibold">Kênh này chưa có trao đổi nào.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Nhập nội dung vào thanh chat bên dưới để gửi tin nhắn đầu tiên!
                </p>
              </div>
            ) : (
              currentMessages.map((msg) => {
                const isMe = msg.senderId === (currentUser?.id || 'usr_admin_01');

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1 px-1 text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {isMe ? 'Bạn' : msg.senderName}
                      </span>
                      {!isMe && getRoleBadge(msg.senderRole)}
                      <span className="text-[11px] text-slate-400">{msg.timestamp}</span>
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
                          {msg.tag}
                        </span>
                      )}

                      <span className="whitespace-pre-wrap text-sm">{msg.content}</span>

                      {/* Attachments preview */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2.5 space-y-1.5">
                          {msg.attachments.map((att, attIdx) => (
                            <div
                              key={attIdx}
                              className={`p-2.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold border ${
                                isMe
                                  ? 'bg-white/10 border-white/20 text-white'
                                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {att.type === 'order' && <Receipt className="w-4 h-4 text-amber-400 shrink-0" />}
                              {att.type === 'product' && <Package className="w-4 h-4 text-indigo-400 shrink-0" />}
                              <span>{att.title}</span>
                              {att.code && (
                                <span className="font-mono text-[10px] opacity-80 shrink-0">
                                  ({att.code})
                                </span>
                              )}
                            </div>
                          ))}
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
            <span className="text-xs font-bold text-slate-400 shrink-0">Gợi ý phản hồi nhanh:</span>
            {QUICK_TEMPLATES.map((tmpl, idx) => (
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
              <span className="text-xs text-slate-400 shrink-0 font-medium">Gửi tag tới:</span>
              {QUICK_TAGS.map((t) => (
                <button
                  key={t.tag}
                  onClick={() => setSelectedTag(selectedTag === t.tag ? null : t.tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedTag === t.tag
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : `${t.color} hover:opacity-80`
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Input field */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Gõ tin nhắn gửi tới ${currentChannel.name}... (Nhấn Enter để gửi)`}
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />

                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-500 cursor-pointer transition-colors"
                  title="Biểu tượng cảm xúc"
                >
                  <Smile className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleSend}
                disabled={!inputContent.trim()}
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold flex items-center gap-2 shadow-sm hover:shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <span>Gửi</span>
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
    </div>
  );
};
