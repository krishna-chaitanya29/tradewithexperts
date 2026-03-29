export type TradeResult = "hit" | "sl" | "open";

export type TradeEntry = {
  id: string;
  date: string;
  entry_price: number;
  target: number;
  target_1?: number | null;
  target_2?: number | null;
  target_3?: number | null;
  stop_loss: number;
  result: TradeResult;
  points: number;
  notes?: string | null;
  screenshot_url?: string | null;
  created_at?: string;
};

export type MonthlySummary = {
  id: string;
  month: string;
  summary_text?: string | null;
  created_at?: string;
};

export type SiteSettingKey =
  | "notice_text"
  | "telegram_url"
  | "whatsapp_url"
  | "total_calls"
  | "win_rate"
  | "avg_monthly_return"
  | "hero_text"
  | "about_text"
  | "how_we_trade_text"
  | "home_alerts_html"
  | "home_offer_url"
  | "home_section_order"
  | "template_nifty_target"
  | "template_nifty_sl"
  | "template_banknifty_target"
  | "template_banknifty_sl"
  | "template_finnifty_target"
  | "template_finnifty_sl";

export type SiteSetting = {
  key: SiteSettingKey | string;
  value: string;
  updated_at?: string;
};

export type ContentBlock = {
  id: string;
  block_key: string;
  content_html: string;
  updated_at?: string;
};

export type MarketBias = "bullish" | "bearish" | "sideways";

export type DailyAnalysis = {
  id: string;
  date: string;
  title: string;
  content_html: string;
  market_bias: MarketBias;
  key_levels: string;
  posted_at?: string;
  updated_at?: string;
};

export type LiveTradeStatus = "pending" | "live" | "target_hit" | "sl_hit" | "closed";

export type MessageType = "info" | "success" | "warning" | "celebration";

export type LiveTrade = {
  id: string;
  date: string;
  instrument: string;
  trade_type: "BUY" | "SELL";
  entry_price: number;
  target_price: number;
  stop_loss: number;
  current_price?: number | null;
  status: LiveTradeStatus;
  points_result?: number | null;
  admin_message?: string | null;
  message_type?: MessageType | null;
  posted_at?: string;
  updated_at?: string;
  closed_at?: string | null;
};

export type TradeReaction = {
  id: string;
  trade_id: string;
  reaction_type: "analysis" | "update" | "result";
  message: string;
  created_at?: string;
};

export type HeroStats = {
  totalCalls: number;
  winRate: number;
  avgMonthlyReturn: number;
};

export type Profile = {
  id: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  is_admin: boolean;
  created_at?: string;
};
