import {
  AppleIcon,
  ColorInput,
  ColorSwatchGroup,
  GoogleIcon,
  Icon,
  UploadTile,
} from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Section } from './tokens';

// #53 の後半プリミティブ。消費側(insession-app)が legacy CSS や打ち消しユーティリティで
// 手組みしていたものを DS に上げたもの。
// ListRow はここに同居していたが廃止し、人の行は UserLabel(href/onClick)へ集約した
// (UserLabel.stories.tsx を参照)。
const meta: Meta = {
  title: 'Inputs/Upload & Color',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const Uploads: Story = {
  render: () => {
    const [picked, setPicked] = useState<string[]>([]);
    return (
      <Section
        title="UploadTile"
        note="破線タイル + 隠しファイル入力。label を面にしているので input.click() は不要。ドラッグ&ドロップにも対応する(dragenter/leave の深さを数えて枠のちらつきを防ぐ)。"
      >
        <div className="grid max-w-160 gap-4 sm:grid-cols-2">
          <UploadTile
            label="スタンプを追加"
            hint="PNG / WebP・1MB まで"
            icon={<Icon name="image" size={24} />}
            accept="image/png,image/webp"
            multiple
            onFiles={(files) => setPicked(files.map((f) => f.name))}
          />
          <UploadTile
            label="カバー画像を選ぶ"
            hint="推奨 1200x400"
            icon={<Icon name="album" size={24} />}
            minHeight={172}
            onFiles={(files) => setPicked(files.map((f) => f.name))}
          />
          <UploadTile
            label="disabled"
            hint="アップロード上限に達しています"
            icon={<Icon name="block" size={24} />}
            disabled
            onFiles={() => {}}
          />
        </div>
        {picked.length > 0 && (
          <p className="mt-4 font-body text-sm text-text-dim">選択: {picked.join(' / ')}</p>
        )}
      </Section>
    );
  },
};

export const Colors: Story = {
  render: () => {
    const [pen, setPen] = useState('#f2694c');
    const [custom, setCustom] = useState('#3bf7a4');
    return (
      <Section
        title="ColorSwatchGroup / ColorInput"
        note="パレット選択と任意色選択。色そのものはトークンではなくデータなので style で当てる。選択中は外リング + わずかな拡大で示す(淡い色の上でチェックが見えなくなるため塗りは変えない)。"
      >
        <div className="flex flex-col gap-5">
          <ColorSwatchGroup
            ariaLabel="ペンの色"
            value={pen}
            onValueChange={(v) => setPen(v as string)}
            swatches={[
              { value: '#1c1c1e', label: 'ブラック' },
              { value: '#f2694c', label: 'コーラル' },
              { value: '#f2a33c', label: 'オレンジ' },
              { value: '#3fae6a', label: 'グリーン' },
              { value: '#3f7fd9', label: 'ブルー' },
              { value: '#7b5cd6', label: 'パープル' },
            ]}
          />
          <div className="flex items-center gap-3">
            <ColorInput
              label="任意の色"
              value={custom}
              onChange={(e) => setCustom(e.currentTarget.value)}
            />
            <span className="font-body text-sm text-text-dim">{custom}</span>
          </div>
          <div className="flex items-center gap-3">
            <ColorSwatchGroup
              ariaLabel="サイズ 20 のパレット"
              size={20}
              defaultValue="#3bf7a4"
              swatches={[
                { value: '#3bf7a4', label: 'ミント' },
                { value: '#12d8c9', label: 'シアン' },
                { value: '#7b2ff7', label: 'バイオレット', disabled: true },
              ]}
            />
            <span className="font-body text-sm text-text-dim">size=20</span>
          </div>
        </div>
      </Section>
    );
  },
};

export const SignInIcons: Story = {
  render: () => (
    <Section
      title="AppleIcon / GoogleIcon"
      note="AppleIcon は currentColor に従う(HIG が黒地=白 / 白地=黒 を要求するため)。GoogleIcon はブランド多色で固定。"
    >
      <div className="flex items-center gap-6">
        <span className="inline-flex items-center gap-2 font-body text-base text-text">
          <AppleIcon /> Apple で続ける
        </span>
        <span className="inline-flex items-center gap-2 font-body text-base text-text">
          <GoogleIcon /> Google で続ける
        </span>
      </div>
    </Section>
  ),
};
