// @insession/design-system — UI の公開窓口。外部はここ経由で import する。
// components/ と icons/ が純粋 leaf のプリミティブ、ui-kit/ がそれらを束ねた複合コンポーネント。

export { MOBILE_LAYOUT_MQ } from './breakpoints.ts';
export {
  Accordion,
  AccordionItem,
  type AccordionItemProps,
  type AccordionProps,
} from './components/accordion.tsx';
export {
  type AvatarProps,
  AvatarStack,
  type AvatarStackPerson,
  type AvatarStackProps,
  type AvatarStatus,
  default as Avatar,
} from './components/avatar.tsx';
export {
  Badge,
  type BadgeProps,
  type BadgeTone,
  CountChip,
  type CountChipProps,
} from './components/badge.tsx';
export {
  type BottomSheetProps,
  type BottomSheetSnapPoint,
  default as BottomSheet,
} from './components/bottom-sheet.tsx';
export {
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
  default as Button,
} from './components/button.tsx';
export { type CheckboxProps, default as Checkbox } from './components/checkbox.tsx';
export { type ChipAvatar, type ChipProps, default as Chip } from './components/chip.tsx';
export {
  ColorInput,
  type ColorInputProps,
  type ColorSwatch,
  ColorSwatchGroup,
  type ColorSwatchGroupProps,
} from './components/color-input.tsx';
export { type ComposerProps, default as Composer } from './components/composer.tsx';
export {
  type ConfirmModalProps,
  type ConfirmTone,
  default as ConfirmModal,
} from './components/confirm-modal.tsx';
export { default as EmptyNote, type EmptyNoteProps } from './components/empty-note.tsx';
export {
  default as IconButton,
  type IconButtonProps,
  type IconButtonVariant,
} from './components/icon-button.tsx';
export {
  default as Input,
  FIELD_BOX_BASE,
  FIELD_CONTROL,
  FIELD_LABEL,
  fieldBoxState,
  fieldLabelColor,
  type InputProps,
} from './components/input.tsx';
export {
  type Align,
  type Breakpoint,
  Center,
  type CenterProps,
  COLUMNS_CLASS,
  type Columns,
  Container,
  type ContainerProps,
  type ContainerSize,
  Divider,
  type DividerOrientation,
  type DividerProps,
  GAP_CLASS,
  type Gap,
  Grid,
  type GridProps,
  HStack,
  type HStackProps,
  type Justify,
  type Responsive,
  Spacer,
  type SpacerProps,
  Stack,
  type StackDirection,
  type StackProps,
  VStack,
  type VStackProps,
} from './components/layout.tsx';
export {
  default as Link,
  type LinkProps,
  type LinkVariant,
  linkClass,
} from './components/link.tsx';
export {
  default as LogoMark,
  type LogoMarkProps,
  type LogoMarkVariant,
} from './components/logo-mark.tsx';
export { default as Lozenge, type LozengeProps, type LozengeTone } from './components/lozenge.tsx';
export {
  Menu,
  type MenuCheckboxItemProps,
  type MenuGroupLabelProps,
  type MenuGroupProps,
  type MenuItemProps,
  type MenuPlainItemProps,
  type MenuPlainListProps,
  type MenuPopupProps,
  type MenuPortalProps,
  type MenuPositionerProps,
  type MenuRadioGroupProps,
  type MenuRadioItemProps,
  type MenuRootProps,
  type MenuSeparatorProps,
  type MenuSubmenuRootProps,
  type MenuSubmenuTriggerProps,
  type MenuTriggerProps,
} from './components/menu.tsx';
export {
  Modal,
  type ModalBackdropProps,
  type ModalBodyProps,
  type ModalCloseProps,
  type ModalDescriptionProps,
  type ModalFooterProps,
  type ModalPopupProps,
  type ModalPortalProps,
  type ModalRootProps,
  type ModalTitleProps,
  type ModalTriggerProps,
  type ModalVariant,
} from './components/modal.tsx';
export {
  AppBar,
  type AppBarProps,
  Footer,
  type FooterProps,
  PageHeader,
  type PageHeaderProps,
  PageLayout,
  type PageLayoutProps,
  type PageScroll,
  Toolbar,
  type ToolbarProps,
} from './components/page.tsx';
export {
  POPOVER_POPUP_BASE,
  POPOVER_POPUP_PADDING,
  POPOVER_POPUP_SCROLL,
  POPOVER_POSITIONER_BASE,
  Popover,
  type PopoverArrowProps,
  type PopoverCloseProps,
  type PopoverDescriptionProps,
  type PopoverPopupProps,
  type PopoverPortalProps,
  type PopoverPositionerProps,
  type PopoverRootProps,
  type PopoverTitleProps,
  type PopoverTriggerProps,
} from './components/popover.tsx';
export {
  type OpenProfile,
  ProfileModalContext,
  useOpenProfile,
} from './components/profile-modal.tsx';
export { Radio, type RadioGroupProps, type RadioItemProps } from './components/radio.tsx';
export { default as RingTimer, type RingTimerProps } from './components/ring-timer.tsx';
export { default as SearchField, type SearchFieldProps } from './components/search-field.tsx';
export {
  default as SegmentedControl,
  type SegmentedControlItem,
  type SegmentedControlProps,
} from './components/segmented-control.tsx';
export type {
  SideNavBrandProps,
  SideNavGroupProps,
  SideNavItemProps,
  SideNavItemState,
  SideNavRootProps,
} from './components/side-nav.tsx';
export { default as Slider, type SliderProps } from './components/slider.tsx';
export { default as Spinner, type SpinnerProps } from './components/spinner.tsx';
export {
  default as SplitModal,
  type SplitModalItem,
  type SplitModalProps,
} from './components/split-modal.tsx';
export {
  StatusBadge,
  type StatusBadgeProps,
  StatusDot,
  type StatusDotProps,
  type StatusTone,
} from './components/status.tsx';
export {
  default as StepFlow,
  type StepFlowProps,
  type StepFlowStep,
} from './components/step-flow.tsx';
export { default as Stepper, type StepperProps } from './components/stepper.tsx';
export {
  Card,
  type CardProps,
  type Elevation,
  Panel,
  type PanelProps,
  Paper,
  type PaperProps,
  Surface,
  type SurfacePadding,
  type SurfaceProps,
  type SurfaceRadius,
} from './components/surface.tsx';
export {
  Tabs,
  type TabsListProps,
  type TabsPanelProps,
  type TabsRootProps,
  type TabsTabProps,
} from './components/tabs.tsx';
export { default as Textarea, type TextareaProps } from './components/textarea.tsx';
export {
  Toast,
  type ToastData,
  type ToastProviderProps,
  type ToastTone,
  type ToastVariant,
  type ToastViewportProps,
} from './components/toast.tsx';
export { default as Toggle, type ToggleProps } from './components/toggle.tsx';
export {
  ToggleGroup,
  type ToggleGroupProps,
  ToolButton,
  type ToolButtonProps,
} from './components/toggle-group.tsx';
export { default as UploadTile, type UploadTileProps } from './components/upload-tile.tsx';
export { default as AppleIcon } from './icons/apple-icon.tsx';
export { default as GoogleIcon } from './icons/google-icon.tsx';
export { default as Icon, type IconName, type IconProps } from './icons/icon.tsx';
export { default as PersonIcon } from './icons/person-icon.tsx';
export { SideNav } from './side-nav-parts.ts';
export {
  FeedItem,
  FeedItemAttachment,
  type FeedItemAttachmentProps,
  type FeedItemProps,
} from './ui-kit/feed-item.tsx';
export {
  default as MessageItem,
  type MessageItemAction,
  type MessageItemProps,
  type MessageItemReaction,
} from './ui-kit/message-item.tsx';
export type {
  SideNavAccountItem,
  SideNavAccountProps,
} from './ui-kit/side-nav-account.tsx';
export {
  default as UserLabel,
  type UserLabelProps,
  type UserLabelSize,
} from './ui-kit/user-label.tsx';
