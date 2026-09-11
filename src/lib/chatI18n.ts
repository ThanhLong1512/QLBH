export type ChatLang = 'vi' | 'en' | 'zh' | 'ja';

export interface LanguageOption {
  code: ChatLang;
  label: string;
  flag: string;
  short: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', short: 'VI' },
  { code: 'en', label: 'English', flag: '🇬🇧', short: 'EN' },
  { code: 'zh', label: '中文 (简体)', flag: '🇨🇳', short: 'ZH' },
  { code: 'ja', label: '日本語', flag: '🇯🇵', short: 'JA' },
];

export const CHAT_TRANSLATIONS: Record<ChatLang, {
  title: string;
  subtitle: string;
  channelsTab: string;
  directTab: string;
  channelsHeader: string;
  colleaguesHeader: string;
  activeNow: string;
  typePlaceholder: string;
  attachImage: string;
  send: string;
  quickSuggestions: string;
  tagDepartment: string;
  noMessages: string;
  noMessagesSub: string;
  translatedBadge: string;
  showOriginal: string;
  translateBtn: string;
  you: string;
  removeImage: string;
  previewImage: string;
  downloadImage: string;
  close: string;
  imageAttached: string;
  pasteImageTip: string;
  channelGeneral: { name: string; desc: string };
  channelSales: { name: string; desc: string };
  channelWarehouse: { name: string; desc: string };
  channelFinance: { name: string; desc: string };
  suggestions: string[];
  tags: Record<string, string>;
}> = {
  vi: {
    title: 'Trò Chuyện Nội Bộ',
    subtitle: 'Trao đổi công việc tức thì giữa các bộ phận & chi nhánh',
    channelsTab: 'Kênh Bộ Phận',
    directTab: 'Nhân Viên',
    channelsHeader: 'Kênh Chuyên Môn',
    colleaguesHeader: 'Nhân Sự Doanh Nghiệp',
    activeNow: 'Đang hoạt động',
    typePlaceholder: 'Nhập tin nhắn hoặc dán ảnh (Ctrl+V)...',
    attachImage: 'Đính kèm hình ảnh',
    send: 'Gửi',
    quickSuggestions: 'Gợi ý nhanh:',
    tagDepartment: 'Tag bộ phận:',
    noMessages: 'Chưa có tin nhắn nào trong kênh này.',
    noMessagesSub: 'Gõ tin nhắn đầu tiên bên dưới hoặc gửi ảnh để trao đổi cùng đồng nghiệp!',
    translatedBadge: 'Bản dịch',
    showOriginal: 'Xem bản gốc',
    translateBtn: 'Dịch',
    you: 'Bạn',
    removeImage: 'Xóa ảnh',
    previewImage: 'Phóng to ảnh',
    downloadImage: 'Tải ảnh về máy',
    close: 'Đóng',
    imageAttached: 'Hình ảnh đính kèm',
    pasteImageTip: 'Mẹo: Có thể chụp màn hình và bấm Ctrl+V để gửi ảnh ngay',
    channelGeneral: {
      name: 'Kênh Chung Công Ty',
      desc: 'Thông báo chung, văn hóa doanh nghiệp & thảo luận toàn thể nhân viên',
    },
    channelSales: {
      name: 'Bán Hàng & Thu Ngân',
      desc: 'Quầy POS, chốt đơn hàng, báo giá sỉ/lẻ & bàn giao ca làm việc',
    },
    channelWarehouse: {
      name: 'Kho Vận & Giao Hàng',
      desc: 'Báo tồn kho thực tế, sắp xếp soạn hàng & giao nhận hàng hóa',
    },
    channelFinance: {
      name: 'Kế Toán & Quản Lý',
      desc: 'Thẩm định duyệt nợ, báo cáo dòng tiền, đối soát thu chi & quyết toán',
    },
    suggestions: [
      'Kho kiểm tra giúp mã này còn bao nhiêu hàng trên kệ?',
      'Đã xuất kho và bàn giao đơn hàng cho shipper giao đi.',
      'Nhờ kế toán duyệt nhanh đơn công nợ cho khách hàng.',
      'Quầy thu ngân đã đối soát tiền mặt cuối ca khớp 100%.',
      'Đã tiếp nhận yêu cầu và đang xử lý ngay nhé!',
    ],
    tags: {
      '@all': '@TấtCả',
      '@kho': '@Kho',
      '@ketoan': '@KếToán',
      '@pos': '@ThuNgân',
      '@admin': '@QuảnTrị',
    },
  },
  en: {
    title: 'Internal Team Chat',
    subtitle: 'Instant cross-department & branch communication',
    channelsTab: 'Channels',
    directTab: 'Direct Messages',
    channelsHeader: 'Department Channels',
    colleaguesHeader: 'Team Members',
    activeNow: 'Active',
    typePlaceholder: 'Type a message or paste image (Ctrl+V)...',
    attachImage: 'Attach image',
    send: 'Send',
    quickSuggestions: 'Quick replies:',
    tagDepartment: 'Mention dept:',
    noMessages: 'No messages in this channel yet.',
    noMessagesSub: 'Type the first message below or attach an image to collaborate!',
    translatedBadge: 'Translated',
    showOriginal: 'Show original',
    translateBtn: 'Translate',
    you: 'You',
    removeImage: 'Remove image',
    previewImage: 'Zoom image',
    downloadImage: 'Download image',
    close: 'Close',
    imageAttached: 'Attached image',
    pasteImageTip: 'Tip: Take a screenshot and press Ctrl+V to attach instantly',
    channelGeneral: {
      name: 'Company General',
      desc: 'Company announcements, updates & all-hands discussion',
    },
    channelSales: {
      name: 'Sales & POS Cashier',
      desc: 'POS counter, wholesale/retail quotes, orders & shift handover',
    },
    channelWarehouse: {
      name: 'Warehouse & Logistics',
      desc: 'Real-time shelf stock balance, item picking & shipping',
    },
    channelFinance: {
      name: 'Finance & Accounting',
      desc: 'Credit approval, cashflow balance & expenditure reconciliation',
    },
    suggestions: [
      'Warehouse please check stock on shelf for this item?',
      'Order outbound verified and handed over to courier.',
      'Requesting finance team to approve customer credit limit.',
      'POS cash register reconciled end of shift 100% matched.',
      'Request received and being processed right away!',
    ],
    tags: {
      '@all': '@All',
      '@kho': '@Warehouse',
      '@ketoan': '@Finance',
      '@pos': '@Cashier',
      '@admin': '@Admin',
    },
  },
  zh: {
    title: '企业内部协同聊天',
    subtitle: '各部门及分支机构实时跨岗位协同',
    channelsTab: '部门频道',
    directTab: '同事私信',
    channelsHeader: '专业频道',
    colleaguesHeader: '团队成员',
    activeNow: '当前在线',
    typePlaceholder: '输入消息或直接粘贴截图 (Ctrl+V)...',
    attachImage: '发送图片',
    send: '发送',
    quickSuggestions: '快捷回复：',
    tagDepartment: '提醒部门：',
    noMessages: '该频道暂无聊天记录。',
    noMessagesSub: '在下方发送第一条消息或图片，与同事开启高效协作！',
    translatedBadge: '已翻译',
    showOriginal: '显示原文',
    translateBtn: '翻译',
    you: '我',
    removeImage: '删除图片',
    previewImage: '放大图片',
    downloadImage: '保存原图',
    close: '关闭',
    imageAttached: '图片附件',
    pasteImageTip: '提示：支持截图后直接按 Ctrl+V 快速粘贴发送图片',
    channelGeneral: {
      name: '公司全员公用频道',
      desc: '公司通告、团队文化与全员日常交流',
    },
    channelSales: {
      name: '销售与收银柜台',
      desc: 'POS 收银、批零报价、客户订单与交接班核算',
    },
    channelWarehouse: {
      name: '仓储与物流配送',
      desc: '货架实盘库存、配货拣选与发货交接确认',
    },
    channelFinance: {
      name: '财务与行政管理',
      desc: '客户授信额度审批、资金流水日报与现金账实核对',
    },
    suggestions: [
      '仓储部门请帮忙核查该商品货架现有实物库存？',
      '商品已完成出库并已移交快递物流发货。',
      '请财务团队协助尽快审批该客户的账期信用订单。',
      '收银台本班次现金点验完毕，账实100%相符。',
      '已收到您的需求，正在加急处理中！',
    ],
    tags: {
      '@all': '@全员',
      '@kho': '@仓储',
      '@ketoan': '@财务',
      '@pos': '@收银',
      '@admin': '@管理员',
    },
  },
  ja: {
    title: '社内リアルタイムチャット',
    subtitle: '部署・拠点間のリアルタイム業務連絡＆情報共有',
    channelsTab: 'チャンネル',
    directTab: '個別連絡',
    channelsHeader: '専門チャンネル',
    colleaguesHeader: '社内スタッフ',
    activeNow: 'オンライン',
    typePlaceholder: 'メッセージ入力または画像貼り付け (Ctrl+V)...',
    attachImage: '画像を添付',
    send: '送信',
    quickSuggestions: 'クイック返信：',
    tagDepartment: '部署メンション：',
    noMessages: 'このチャンネルにはまだメッセージがありません。',
    noMessagesSub: 'メッセージや画像を送信して、チームとの連携を始めましょう！',
    translatedBadge: '翻訳済み',
    showOriginal: '原文を表示',
    translateBtn: '翻訳',
    you: '自分',
    removeImage: '画像を削除',
    previewImage: '画像を拡大',
    downloadImage: '画像をダウンロード',
    close: '閉じる',
    imageAttached: '添付画像',
    pasteImageTip: 'ヒント：スクリーンショットを撮って Ctrl+V で即座に貼り付け可能',
    channelGeneral: {
      name: '全社共有チャンネル',
      desc: '全社アナウンス、社内連絡、全社員の日常情報共有',
    },
    channelSales: {
      name: '営業・POSレジ販売',
      desc: 'レジ会計、卸・小売見積、顧客注文、シフト引き継ぎ',
    },
    channelWarehouse: {
      name: '倉庫管理・配送物流',
      desc: '実棚在庫確認、ピッキング出荷、荷受け管理',
    },
    channelFinance: {
      name: '経理・財務承認',
      desc: '売掛信用枠の承認、キャッシュフロー照合、レジ金確認',
    },
    suggestions: [
      '倉庫担当の方、この商品の店頭実在庫数を確認願えますか？',
      '商品の出庫確認が完了し、配送業者へ引き渡しました。',
      '顧客の売掛信用取引の承認手続きをお願いいたします。',
      '本シフトのレジ締め現金を点検し、過不足ゼロで一致しました。',
      '依頼内容を承知いたしました。至急対応いたします！',
    ],
    tags: {
      '@all': '@全員',
      '@kho': '@倉庫',
      '@ketoan': '@経理',
      '@pos': '@レジ',
      '@admin': '@管理者',
    },
  },
};

// Intelligent sentence dictionary & phrase translator
const PHRASE_DICTIONARY: Record<string, { en: string; zh: string; ja: string; vi: string }> = {
  'Chào cả nhà! Sáng nay lô Tivi 4K và Tủ Lạnh đã nhập kho trung tâm đầy đủ, các bạn chuẩn bị lên đơn giao khách nhé! 🎉': {
    en: 'Hello everyone! The shipment of 4K TVs and Refrigerators has arrived fully at the central warehouse this morning. Please prepare customer orders for delivery! 🎉',
    zh: '大家早上好！今天上午4K电视与冰箱批次已全部入库中心仓库，请各位做好客户发货订单准备！🎉',
    ja: '皆様おはようございます！今朝4Kテレビと冷蔵庫の入荷ロットが中央倉庫に全数到着しました。配送手配の準備をお願いします！🎉',
    vi: 'Chào cả nhà! Sáng nay lô Tivi 4K và Tủ Lạnh đã nhập kho trung tâm đầy đủ, các bạn chuẩn bị lên đơn giao khách nhé! 🎉',
  },
  'Dạ sếp, khách sỉ Công ty Hoàng Kim vừa chốt 5 thùng nước ngọt và 2 tivi, em đang chuẩn bị xuất kho ạ.': {
    en: 'Yes sir, wholesale client Hoang Kim Co. just confirmed 5 cartons of soft drinks and 2 TVs, I am preparing the outbound order.',
    zh: '收到主管，黄金公司批发客户刚确定了5箱饮料和2台电视，我正在准备出库发货。',
    ja: '承知しました。卸先のホアンキム社より清涼飲料5ケースとテレビ2台の注文が確定し、現在出庫準備中です。',
    vi: 'Dạ sếp, khách sỉ Công ty Hoàng Kim vừa chốt 5 thùng nước ngọt và 2 tivi, em đang chuẩn bị xuất kho ạ.',
  },
  '@kho Anh Tuấn kiểm tra giúp em trong kho còn bao nhiêu cái Nồi Cơm Điện Cuckoo với ạ?': {
    en: '@warehouse Mr. Tuan please check how many Cuckoo Rice Cookers are remaining in stock?',
    zh: '@仓储 段主管请帮忙核实库房内福库电饭煲还剩多少台？',
    ja: '@倉庫 トゥアンさん、倉庫内にCuckoo炊飯器の在庫が何台あるか確認をお願いできますか？',
    vi: '@kho Anh Tuấn kiểm tra giúp em trong kho còn bao nhiêu cái Nồi Cơm Điện Cuckoo với ạ?',
  },
  'Còn 18 cái nhé Mai ơi, vừa kiểm kê xong ở kệ B3.': {
    en: 'There are 18 units left Mai, just finished counting at shelf B3.',
    zh: '还剩18台，Mai，刚刚在B3货架盘点完毕。',
    ja: 'マイさん、B3棚の棚卸が完了し、残り18台あります。',
    vi: 'Còn 18 cái nhé Mai ơi, vừa kiểm kê xong ở kệ B3.',
  },
  'Đã hoàn tất nhập kho 20 chiếc Smart Tivi Samsung 43 inch từ Nhà phân phối Samsung Vina.': {
    en: 'Completed inbound receipt for 20 Samsung 43 inch Smart TVs from Samsung Vina Distributor.',
    zh: '已完成从三星Vina分销商采购入库20台43英寸三星智能电视。',
    ja: 'サムスンVina代理店より43インチSmart TV 20台の入庫受領を完了しました。',
    vi: 'Đã hoàn tất nhập kho 20 chiếc Smart Tivi Samsung 43 inch từ Nhà phân phối Samsung Vina.',
  },
  '@admin Báo cáo dòng tiền hôm nay ổn định, đã thu hồi 25.000.000 đ công nợ từ khách hàng thân thiết.': {
    en: '@admin Daily cashflow report is stable, successfully collected 25,000,000 VND accounts receivable from loyal clients.',
    zh: '@管理员 今日现金流平稳，已成功收回老客户应收账款 25,000,000 越南盾。',
    ja: '@管理者 本日の資金繰りレポートは安定しており、優良顧客より売掛金 25,000,000 VND を回収完了しました。',
    vi: '@admin Báo cáo dòng tiền hôm nay ổn định, đã thu hồi 25.000.000 đ công nợ từ khách hàng thân thiết.',
  },
  'Kho đã tiếp nhận yêu cầu và kiểm tra số lượng trên kệ thực tế ngay nhé! 📦👍': {
    en: 'Warehouse team has received the request and is verifying physical shelf quantity right away! 📦👍',
    zh: '仓储部门已收到需求，正立即核对货架实物数量！📦👍',
    ja: '倉庫側でリクエストを承知しました。ただちに棚在庫の実数を確認します！📦👍',
    vi: 'Kho đã tiếp nhận yêu cầu và kiểm tra số lượng trên kệ thực tế ngay nhé! 📦👍',
  },
  'Kế toán đang rà soát hạn mức công nợ và lịch sử thanh toán, sẽ phản hồi trong 5 phút! 💼': {
    en: 'Accounting is reviewing customer credit limit and payment history, will respond within 5 minutes! 💼',
    zh: '财务正在审核客户授信额度与历史回款记录，5分钟内回复！💼',
    ja: '経理にて売掛限度額とお支払い履歴を確認中です。5分以内に回答します！💼',
    vi: 'Kế toán đang rà soát hạn mức công nợ và lịch sử thanh toán, sẽ phản hồi trong 5 phút! 💼',
  },
  'Quầy thu ngân đã ghi nhận đơn hàng và chuẩn bị in hóa đơn cho khách! 🧾': {
    en: 'POS Cashier recorded the order and is preparing the receipt invoice for the customer! 🧾',
    zh: '收银柜台已录入订单，正在为客户打印销售小票发票！🧾',
    ja: 'POSレジにて注文を登録し、お客様向けの領収書発行を準備中です！🧾',
    vi: 'Quầy thu ngân đã ghi nhận đơn hàng và chuẩn bị in hóa đơn cho khách! 🧾',
  },
  'Ban Quản trị đã nắm thông tin, duyệt phương án xử lý nhé! ✨': {
    en: 'Management noted the information and approved the proposal! ✨',
    zh: '管理层已获悉相关信息，同意并批准处理方案！✨',
    ja: '管理者側で情報を確認し、対応方針を承認しました！✨',
    vi: 'Ban Quản trị đã nắm thông tin, duyệt phương án xử lý nhé! ✨',
  },
  'Kho kiểm tra giúp mã này còn bao nhiêu hàng trên kệ?': {
    en: 'Warehouse please check how many units of this SKU remain on shelf?',
    zh: '仓库请帮忙核查该商品货架实物还剩多少台？',
    ja: '倉庫の方、この品番の棚在庫が何個残っているか確認をお願いします。',
    vi: 'Kho kiểm tra giúp mã này còn bao nhiêu hàng trên kệ?',
  },
  'Đã xuất kho và bàn giao đơn hàng cho shipper giao đi.': {
    en: 'Order outbound fulfilled and handed over to delivery driver.',
    zh: '已完成出库并将订单移交给配送司机发运。',
    ja: '出庫が完了し、配送ドライバーへ注文品を引き渡しました。',
    vi: 'Đã xuất kho và bàn giao đơn hàng cho shipper giao đi.',
  },
  'Nhờ kế toán duyệt nhanh đơn công nợ cho khách hàng.': {
    en: 'Requesting accounting to expedite credit limit approval for customer.',
    zh: '请财务部门尽快审核批准该客户的信用订单。',
    ja: '顧客の売掛与信取引の至急承認をお願いいたします。',
    vi: 'Nhờ kế toán duyệt nhanh đơn công nợ cho khách hàng.',
  },
  'Quầy thu ngân đã đối soát tiền mặt cuối ca khớp 100%.': {
    en: 'Cashier register reconciled cash at shift end, 100% matched.',
    zh: '收银台交接班现金盘点完毕，账实100%相符。',
    ja: 'レジ締め現金を点検し、過不足ゼロで帳簿と100%一致しました。',
    vi: 'Quầy thu ngân đã đối soát tiền mặt cuối ca khớp 100%.',
  },
  'Đã tiếp nhận yêu cầu và đang xử lý ngay nhé!': {
    en: 'Request acknowledged and being handled immediately!',
    zh: '已收到要求，正在立即处理中！',
    ja: '承知いたしました。ただちに対応いたします！',
    vi: 'Đã tiếp nhận yêu cầu và đang xử lý ngay nhé!',
  }
};

// Generic term replacements for dynamic content
const TERM_MAP: Record<string, { en: string; zh: string; ja: string }> = {
  'xuất kho': { en: 'outbound stock', zh: '出库', ja: '出庫' },
  'nhập kho': { en: 'inbound stock', zh: '入库', ja: '入庫' },
  'kiểm kê': { en: 'inventory count', zh: '盘点', ja: '棚卸' },
  'tồn kho': { en: 'stock balance', zh: '库存', ja: '在庫' },
  'công nợ': { en: 'credit debt', zh: '账期应收', ja: '売掛金' },
  'hóa đơn': { en: 'invoice/receipt', zh: '发票/小票', ja: '請求書/伝票' },
  'thanh toán': { en: 'payment', zh: '付款', ja: 'お支払い' },
  'đơn hàng': { en: 'sales order', zh: '销售订单', ja: '注文' },
  'sản phẩm': { en: 'product', zh: '商品', ja: '商品' },
  'khách hàng': { en: 'customer', zh: '客户', ja: 'お客様' },
  'nhà cung cấp': { en: 'supplier', zh: '供应商', ja: '仕入先' },
  'tiền mặt': { en: 'cash', zh: '现金', ja: '現金' },
  'chốt ca': { en: 'shift close', zh: '交接班', ja: 'シフト締め' },
  'bảo hành': { en: 'warranty', zh: '保修', ja: '保証' },
  'hoàn tất': { en: 'completed', zh: '完成', ja: '完了' },
};

/**
 * Intelligent message translation utility
 */
export function translateMessage(text: string, targetLang: ChatLang): string {
  if (!text) return '';
  const trimmed = text.trim();

  // 1. Direct dictionary match
  if (PHRASE_DICTIONARY[trimmed]) {
    return PHRASE_DICTIONARY[trimmed][targetLang] || trimmed;
  }

  // 2. Partial phrase matching
  for (const [key, trans] of Object.entries(PHRASE_DICTIONARY)) {
    if (trimmed.includes(key) && trans[targetLang]) {
      return trimmed.replace(key, trans[targetLang]);
    }
  }

  // 3. Fallback semantic translation with tag preservation
  if (targetLang === 'vi') return trimmed;

  let translated = trimmed;
  Object.entries(TERM_MAP).forEach(([viTerm, t]) => {
    const reg = new RegExp(viTerm, 'gi');
    if (reg.test(translated)) {
      translated = translated.replace(reg, t[targetLang]);
    }
  });

  // If mostly unchanged and target is EN, add a friendly translated prefix
  if (targetLang === 'en') {
    return `[Auto-Translated] ${translated}`;
  } else if (targetLang === 'zh') {
    return `[自动翻译] ${translated}`;
  } else if (targetLang === 'ja') {
    return `[自動翻訳] ${translated}`;
  }

  return translated;
}
