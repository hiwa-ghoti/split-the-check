/** Shared types for the app. Add domain models here as features grow. */

export type HealthStatus = {
  status: "ok";
  appName: string;
};

export type {
  Expense,
  Member,
  MemberBalance,
  Session,
  Settlement,
  Transfer,
} from "./warikan";
