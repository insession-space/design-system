import { SideNav as SideNavPrimitiveParts } from './components/side-nav.tsx';
import SideNavAccount from './ui-kit/side-nav-account.tsx';

// SideNav の parts を1つの名前空間に合流させる（#79）。
//
// Root / Brand / Group / Item は components/ の純粋 leaf、Account は UserLabel と Menu を
// 束ねる複合なので ui-kit/ にある。components/ は ui-kit/ を参照しない（依存の向きを一方向に
// 保つ）ため、合流はどちらのレイヤーにも属さないここで行う。呼び出し側から見た形は
// `<SideNav.Root>` … `<SideNav.Account>` の1系統で変わらない。
export const SideNav = {
  ...SideNavPrimitiveParts,
  Account: SideNavAccount,
};
