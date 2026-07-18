import { createContext, useContext } from 'react';

// プロフィールモーダルをどこからでも開くための注入点(コールバックのみ。#637)。
// UI leaf には「開く関数の型」だけを置き、実際に UserProfile を描画する Provider は
// apps/web が供給する(UserProfile を持つ @in-session/account を import できるのは
// apps/web 側のため。leaf(ui) は account を import しない=ui-is-leaf 制約を保つ)。
// uid 未指定=自己プロフィール、uid 指定=他人の公開プロフィールを開く。
export type OpenProfile = (uid?: string) => void;

const noopOpenProfile: OpenProfile = () => {};

export const ProfileModalContext = createContext<OpenProfile>(noopOpenProfile);

// 通知・フォロー一覧・参加者カード等の各導線から呼ぶ。Provider 未設定時は no-op。
export function useOpenProfile(): OpenProfile {
  return useContext(ProfileModalContext);
}
