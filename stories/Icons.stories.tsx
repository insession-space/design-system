import { GoogleIcon, Icon, type IconName, PersonIcon } from '@in-session/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// アイコンギャラリー。Icon(Material Icons 由来の path data 集)の全 IconName を一覧する。
// 実装(foundation/ui/icons/icon.tsx の PATHS/EXTRA_PATHS)とズレないよう、キーの網羅は
// Record<IconName, true> の型チェックに委ねる(足りない/余分なキーがあれば typecheck が落ちる)。
// GoogleIcon / PersonIcon は props 不要の専用 SVG アイコンで、別セクションに含める。
const meta: Meta = {
  title: 'Components/Icons',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

// IconName の全メンバーを網羅する(過不足があれば型エラーになる = 実装との自動同期)。
const ICON_NAME_MAP: Record<IconName, true> = {
  menu: true,
  home: true,
  graphic_eq: true,
  history: true,
  settings: true,
  check: true,
  check_circle: true,
  warning: true,
  edit: true,
  link: true,
  lock: true,
  volume_off: true,
  volume_up: true,
  extension: true,
  apps: true,
  timer: true,
  movie: true,
  group: true,
  sports_esports: true,
  auto_awesome: true,
  play_arrow: true,
  queue_music: true,
  account_circle: true,
  pause: true,
  fast_forward: true,
  videocam: true,
  videocam_off: true,
  mic: true,
  mic_off: true,
  call_end: true,
  call: true,
  help: true,
  screen_share: true,
  stop_screen_share: true,
  logout: true,
  add: true,
  add_link: true,
  add_reaction: true,
  open_in_new: true,
  expand_more: true,
  expand_less: true,
  chat: true,
  reply: true,
  close: true,
  feedback: true,
  album: true,
  image: true,
  send: true,
  delete: true,
  star: true,
  star_outline: true,
  person_add: true,
  notifications: true,
  cd: true,
  cassette: true,
  search: true,
  more_horiz: true,
  info: true,
  music_note: true,
  schedule: true,
  chevron_right: true,
  tag: true,
  play_circle: true,
  login: true,
  add_photo_alternate: true,
  mood: true,
  diversity_3: true,
  waving_hand: true,
  dashboard: true,
  forum: true,
  table_view: true,
  campaign: true,
  inbox: true,
  arrow_forward: true,
  arrow_downward: true,
  filter_list: true,
  swap_vert: true,
  view_column: true,
  download: true,
  upload: true,
  drag_indicator: true,
  chevron_left: true,
  flag: true,
  meeting_room: true,
  pending: true,
  sticker: true,
  picture_in_picture: true,
};

const ICON_NAMES = Object.keys(ICON_NAME_MAP) as IconName[];

export const Gallery: Story = {
  render: () => (
    <>
      <Section
        title={`全アイコン(${ICON_NAMES.length}種)`}
        note="currentColor で親のテキスト色を継承する。name はそのまま Icon の name prop にコピペできる。"
      >
        <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-3">
          {ICON_NAMES.map((name) => (
            <div
              key={name}
              className="flex flex-col items-center gap-2 rounded-card border border-solid border-border bg-tint-5 p-3"
            >
              <Icon name={name} size={24} className="text-text" />
              <code className="text-2xs text-text-faint break-all text-center">{name}</code>
            </div>
          ))}
        </div>
      </Section>
      <Section
        title="専用アイコン"
        note="props 不要の純粋 SVG。GoogleIcon はブランド固定色、PersonIcon は currentColor。"
      >
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <GoogleIcon />
            <code className="text-2xs text-text-faint">GoogleIcon</code>
          </div>
          <div className="flex flex-col items-center gap-2 text-text">
            <PersonIcon />
            <code className="text-2xs text-text-faint">PersonIcon</code>
          </div>
        </div>
      </Section>
    </>
  ),
};
