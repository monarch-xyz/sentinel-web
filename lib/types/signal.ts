export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';

export interface SignalFilter {
  field: string;
  op: FilterOperator;
  value: string | number | boolean | Array<string | number>;
}

export interface SignalScope {
  chains: number[];
  markets?: string[];
  addresses?: string[];
  protocol?: 'morpho' | 'all';
}

export interface TimeWindow {
  duration: string;
}

export type ComparisonOperator = '>' | '<' | '>=' | '<=' | '==' | '!=';
export type NumericInput = number | string;
export type RawEventKind =
  | 'erc20_transfer'
  | 'erc20_approval'
  | 'erc721_transfer'
  | 'erc721_approval'
  | 'erc721_approval_for_all'
  | 'erc4626_deposit'
  | 'erc4626_withdraw'
  | 'contract_event'
  | 'swap';
export type RawEventProtocol = 'uniswap_v2' | 'uniswap_v3';

export interface PublicStateRef {
  protocol: string;
  entity_type: string;
  field: string;
  filters: SignalFilter[];
}

export interface ThresholdCondition {
  type: 'threshold';
  metric?: string;
  state_ref?: PublicStateRef;
  operator: ComparisonOperator;
  value: NumericInput;
  window?: TimeWindow;
  filters?: SignalFilter[];
  chain_id?: number;
  market_id?: string;
  contract_address?: string;
  address?: string;
}

export interface ChangeCondition {
  type: 'change';
  metric?: string;
  state_ref?: PublicStateRef;
  direction: 'increase' | 'decrease' | 'any';
  by: { percent: number } | { absolute: NumericInput };
  window?: TimeWindow;
  chain_id?: number;
  market_id?: string;
  contract_address?: string;
  address?: string;
}

export interface GroupCondition {
  type: 'group';
  addresses: string[];
  window?: TimeWindow;
  logic?: 'AND' | 'OR';
  requirement: {
    count: number;
    of: number;
  };
  conditions: SignalCondition[];
}

export interface AggregateCondition {
  type: 'aggregate';
  aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count';
  metric: string;
  operator: ComparisonOperator;
  value: NumericInput;
  window?: TimeWindow;
  filters?: SignalFilter[];
  chain_id?: number;
  market_id?: string;
  contract_address?: string;
}

export interface RawEventSpec {
  kind: RawEventKind;
  contract_addresses?: string[];
  signature?: string;
  protocols?: RawEventProtocol[];
}

export interface RawEventsCondition {
  type: 'raw-events';
  aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count';
  operator: ComparisonOperator;
  value: number;
  field?: string;
  window?: TimeWindow;
  filters?: SignalFilter[];
  chain_id?: number;
  event: RawEventSpec;
}

export type SignalCondition =
  | ThresholdCondition
  | ChangeCondition
  | GroupCondition
  | AggregateCondition
  | RawEventsCondition;

export interface SignalDefinition {
  scope: SignalScope;
  conditions: SignalCondition[];
  logic?: 'AND' | 'OR';
  window: TimeWindow;
}

export type SignalRepeatPolicyMode = 'cooldown' | 'post_first_alert_snooze' | 'until_resolved';

export interface CooldownRepeatPolicy {
  mode: 'cooldown';
  cooldown_minutes?: number;
}

export interface PostFirstAlertSnoozeRepeatPolicy {
  mode: 'post_first_alert_snooze';
  snooze_minutes: number;
}

export interface UntilResolvedRepeatPolicy {
  mode: 'until_resolved';
}

export type SignalRepeatPolicy =
  | CooldownRepeatPolicy
  | PostFirstAlertSnoozeRepeatPolicy
  | UntilResolvedRepeatPolicy;

export interface IntervalSchedule {
  kind: 'interval';
  interval_seconds: number;
}

export interface CronSchedule {
  kind: 'cron';
  expression: string;
}

export type SignalSchedule = IntervalSchedule | CronSchedule;

export interface ScheduleTrigger {
  type: 'schedule';
  schedule: SignalSchedule;
}

export interface ExternalTrigger {
  type: 'external';
}

export interface IrukaSignalTrigger {
  type: 'iruka_signal';
  id: string;
}

export type SignalTrigger = ScheduleTrigger | ExternalTrigger | IrukaSignalTrigger;

export interface TelegramSignalDelivery {
  type: 'telegram';
}

export type SignalDelivery = TelegramSignalDelivery;

export interface SignalMetadata {
  description?: string;
  repeat_policy?: SignalRepeatPolicy;
}

export interface PublicSignalEnvelope {
  version: string;
  name: string;
  triggers: SignalTrigger[];
  definition: SignalDefinition;
  delivery: SignalDelivery[];
  metadata?: SignalMetadata;
}

export interface SignalRecord {
  id: string;
  user_id?: string;
  version: string;
  name: string;
  triggers: SignalTrigger[];
  definition: SignalDefinition;
  delivery: SignalDelivery[];
  metadata?: SignalMetadata | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_triggered_at?: string | null;
  last_evaluated_at?: string | null;
}

export type CreateSignalRequest = PublicSignalEnvelope;

export interface UpdateSignalRequest {
  version?: string;
  name?: string;
  triggers?: SignalTrigger[];
  definition?: SignalDefinition;
  delivery?: SignalDelivery[];
  metadata?: SignalMetadata;
  is_active?: boolean;
}

export interface SignalConditionExplanation {
  conditionIndex: number;
  conditionType: string;
  triggered: boolean;
  summary: string;
  matchedAddresses?: string[];
  window?: string;
  operator?: string;
  leftValue?: unknown;
  rightValue?: unknown;
  [key: string]: unknown;
}

export interface SignalEvaluationMetadata {
  logic?: 'AND' | 'OR';
  scope?: SignalScope;
  repeat_policy?: SignalRepeatPolicy;
  condition_results?: SignalConditionExplanation[];
  conditions_met?: SignalConditionExplanation[];
  [key: string]: unknown;
}

export interface SignalRunLogEntry {
  id: string;
  signal_id: string;
  evaluated_at: string;
  triggered: boolean;
  conclusive: boolean;
  in_cooldown: boolean;
  notification_attempted: boolean;
  notification_success?: boolean | null;
  webhook_status?: number | null;
  error_message?: string | null;
  evaluation_duration_ms?: number | null;
  delivery_duration_ms?: number | null;
  logic?: 'AND' | 'OR';
  scope?: SignalScope;
  condition_results?: SignalConditionExplanation[];
  conditions_met?: SignalConditionExplanation[];
  metadata?: SignalEvaluationMetadata | null;
  created_at: string;
}

export interface SignalNotificationPayload {
  scope?: SignalScope;
  conditions_met?: SignalConditionExplanation[];
  context?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface SignalNotificationLogEntry {
  id: string;
  signal_id: string;
  triggered_at: string;
  payload: SignalNotificationPayload;
  webhook_status?: number | null;
  error_message?: string | null;
  retry_count: number;
  evaluation_duration_ms?: number | null;
  delivery_duration_ms?: number | null;
  conditions_met?: SignalConditionExplanation[];
  created_at: string;
  delivered_at?: string | null;
}

export interface SignalHistoryResponse {
  signal_id: string;
  evaluations: SignalRunLogEntry[];
  notifications: SignalNotificationLogEntry[];
  count?: {
    evaluations: number;
    notifications: number;
  };
}

export type SignalLogsResponse = SignalHistoryResponse;
