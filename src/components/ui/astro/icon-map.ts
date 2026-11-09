import type { AstroComponent } from '@lucide/astro'
import ArrowDown from '@lucide/astro/icons/arrow-down'
import ArrowLeft from '@lucide/astro/icons/arrow-left'
import ArrowRight from '@lucide/astro/icons/arrow-right'
import ArrowUp from '@lucide/astro/icons/arrow-up'
import ArrowUpRight from '@lucide/astro/icons/arrow-up-right'
import Check from '@lucide/astro/icons/check'
import CircleCheck from '@lucide/astro/icons/circle-check'
import Code from '@lucide/astro/icons/code'
import Copy from '@lucide/astro/icons/copy'
import Database from '@lucide/astro/icons/database'
import Download from '@lucide/astro/icons/download'
import Layers from '@lucide/astro/icons/layers'
import Mail from '@lucide/astro/icons/mail'
import Menu from '@lucide/astro/icons/menu'
import Moon from '@lucide/astro/icons/moon'
import Plug from '@lucide/astro/icons/plug'
import ShieldCheck from '@lucide/astro/icons/shield-check'
import Sun from '@lucide/astro/icons/sun'
import Terminal from '@lucide/astro/icons/terminal'
import Webhook from '@lucide/astro/icons/webhook'
import X from '@lucide/astro/icons/x'
import type { UiIconName } from '@/components/ui/icon-names'

export const uiIconComponents = {
  'arrow-down': ArrowDown,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'arrow-up': ArrowUp,
  'arrow-up-right': ArrowUpRight,
  check: Check,
  'circle-check': CircleCheck,
  code: Code,
  copy: Copy,
  database: Database,
  download: Download,
  layers: Layers,
  mail: Mail,
  menu: Menu,
  moon: Moon,
  plug: Plug,
  'shield-check': ShieldCheck,
  sun: Sun,
  terminal: Terminal,
  webhook: Webhook,
  x: X,
} satisfies Record<UiIconName, AstroComponent>
