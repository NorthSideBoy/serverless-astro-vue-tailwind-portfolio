<script setup lang="ts">
import { computed } from 'vue'
import { usePreferences } from '@/composables/usePreferences'

/**
 * IdentityPlateSheet — the schematic sheet shared by the live plate and its
 * negative impressions. Every instance gets its own paint-server ids so the
 * ghost gradients, halftone, scanlines and cross-hair texture stay local.
 */
const props = withDefaults(
  defineProps<{
    idPrefix?: string
    tone?: 'normal' | 'ghost'
    glitching?: boolean
    quick?: boolean
  }>(),
  {
    idPrefix: 'ip',
    tone: 'normal',
    glitching: false,
    quick: false,
  },
)

const { locale } = usePreferences()
const plateCopy = computed(() =>
  locale.value === 'es'
    ? {
        header: 'PLACA 00 // IDENTIDAD',
        meta: 'UTC-4 · DESDE 2022 · ESPAÑOL / INGLÉS',
        available: 'DISPONIBLE',
        dossier: 'EXPEDIENTE',
        availability: 'Remoto o local',
      }
    : {
        header: 'PLATE 00 // IDENTITY',
        meta: 'UTC-4 · SINCE 2022 · SPANISH / ENGLISH',
        available: 'AVAILABLE',
        dossier: 'DOSSIER',
        availability: 'Remote or local',
      },
)

const ids = computed(() => {
  const prefix = props.idPrefix
  return {
    cross: `${prefix}-cross`,
    halftone: `${prefix}-halftone`,
    scan: `${prefix}-scan`,
    base: `${prefix}-base`,
  }
})

// Bottom ruler: minor tick every 13u, major every 5th starting at x=124.
const ticks = Array.from({ length: 61 }, (_, i) => {
  const x = 85 + i * 13
  return { x, major: (x - 124) % 65 === 0 }
})
</script>

<template>
  <svg
    viewBox="0 0 960 1200"
    class="identity-plate"
    :class="{
      'identity-plate--ghost': tone === 'ghost',
      'is-glitching': glitching,
      'is-glitching--quick': quick,
    }"
    focusable="false"
  >
    <defs>
      <pattern :id="ids.cross" width="22" height="22" patternUnits="userSpaceOnUse">
        <rect x="10" y="11" width="3" height="1" fill="var(--c-ink)" opacity="0.06" />
        <rect x="11" y="10" width="1" height="3" fill="var(--c-ink)" opacity="0.06" />
      </pattern>
      <pattern :id="ids.halftone" width="8" height="8" patternUnits="userSpaceOnUse">
        <circle cx="4" cy="5" r="2.2" fill="var(--plate-dot)" />
      </pattern>
      <pattern :id="ids.scan" width="4" height="4" patternUnits="userSpaceOnUse">
        <rect width="4" height="1" fill="var(--plate-scan)" opacity="0.22" />
      </pattern>
      <linearGradient :id="ids.base" x1="185" y1="0" x2="785" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="var(--plate-g1)" />
        <stop offset="1" stop-color="var(--plate-g2)" />
      </linearGradient>
    </defs>

    <!-- sheet ground + cross-hair texture -->
    <rect width="960" height="1200" fill="var(--plate-bg)" />
    <rect width="960" height="1200" :fill="`url(#${ids.cross})`" />

    <!-- registration frame -->
    <g class="ip-jolt ip-jolt--frame">
      <rect
        x="22.5"
        y="22.5"
        width="915"
        height="1155"
        fill="none"
        stroke="var(--plate-border)"
        stroke-width="1"
      />
    </g>

    <!-- header -->
    <g class="ip-jolt ip-jolt--header">
      <text x="72" y="78" class="ip-mono ip-head" fill="var(--c-soft)">
        {{ plateCopy.header }}
      </text>
      <text x="570" y="92" class="ip-seal ip-header-seal" fill="var(--c-soft)" text-anchor="middle">
        構
      </text>
      <text x="888" y="76" class="ip-mono ip-ccs" fill="var(--plate-muted)" text-anchor="end">
        CCS · VE
      </text>
      <line x1="72" y1="100.5" x2="888" y2="100.5" stroke="var(--plate-line)" stroke-width="1" />
    </g>

    <!-- monogram window -->
    <g class="ip-jolt ip-jolt--window">
      <rect
        x="72.5"
        y="140.5"
        width="815"
        height="499"
        fill="none"
        stroke="var(--plate-line)"
        stroke-width="1"
      />
      <!-- monogram: real type, gradient fill + halftone dot overlay -->
      <text x="480" y="534" class="ip-monogram" :fill="`url(#${ids.base})`" text-anchor="middle">
        NSB
      </text>
      <text x="480" y="534" class="ip-monogram" :fill="`url(#${ids.scan})`" text-anchor="middle">
        NSB
      </text>
      <text
        x="480"
        y="534"
        class="ip-monogram"
        :fill="`url(#${ids.halftone})`"
        text-anchor="middle"
      >
        NSB
      </text>
      <g
        class="ip-jolt ip-jolt--ruler"
        stroke="var(--plate-border)"
        stroke-width="1"
        opacity="0.85"
      >
        <line
          v-for="tick in ticks"
          :key="tick.x"
          :x1="tick.x + 0.5"
          :y1="tick.major ? 630 : 634"
          :x2="tick.x + 0.5"
          y2="640"
        />
      </g>

      <line x1="72" y1="676.5" x2="888" y2="676.5" stroke="var(--plate-line)" stroke-width="1" />
    </g>

    <!-- dossier lines -->
    <g class="ip-jolt ip-jolt--dossier">
      <g class="ip-jolt ip-jolt--details">
        <g class="ip-details-wide">
          <text x="72" y="748" class="ip-mono ip-role" fill="var(--c-soft)">
            BACKEND-LEANING FULL STACK DEVELOPER
          </text>
          <text x="72" y="800" class="ip-mono ip-meta" fill="var(--plate-muted)">
            {{ plateCopy.meta }}
          </text>
        </g>
        <g class="ip-details-narrow">
          <text x="72" y="734" class="ip-mono ip-role" fill="var(--c-soft)">BACKEND-LEANING</text>
          <text x="72" y="778" class="ip-mono ip-role" fill="var(--c-soft)">
            FULL STACK DEVELOPER
          </text>
          <text x="72" y="824" class="ip-mono ip-meta" fill="var(--plate-muted)">
            {{ plateCopy.meta }}
          </text>
        </g>
      </g>

      <line x1="72" y1="856.5" x2="888" y2="856.5" stroke="var(--plate-line)" stroke-width="1" />

      <g class="ip-jolt ip-jolt--facts">
        <g class="ip-details-wide">
          <g class="ip-mono ip-label" fill="var(--plate-muted)">
            <text x="72" y="920">BASE</text>
            <text x="345" y="920">{{ plateCopy.available }}</text>
            <text x="617" y="920">{{ plateCopy.dossier }}</text>
          </g>
          <g class="ip-mono ip-value" fill="var(--c-soft)">
            <text x="72" y="954">Caracas, VE</text>
            <text x="345" y="954">{{ plateCopy.availability }}</text>
            <text x="617" y="954">2026 · 0417</text>
          </g>
        </g>
        <g class="ip-details-narrow">
          <g class="ip-mono ip-label" fill="var(--plate-muted)">
            <text x="72" y="920">BASE</text>
            <text x="480" y="920">{{ plateCopy.available }}</text>
            <text x="72" y="1020">{{ plateCopy.dossier }}</text>
          </g>
          <g class="ip-mono ip-value" fill="var(--c-soft)">
            <text x="72" y="961">Caracas, VE</text>
            <text x="480" y="961">{{ plateCopy.availability }}</text>
            <text x="72" y="1061">2026 · 0417</text>
          </g>
        </g>
      </g>
    </g>

    <!-- blind stamp: the plain seal, struck inside its own hairline box -->
    <g class="ip-jolt ip-jolt--stamp">
      <rect
        x="710.5"
        y="1038.5"
        width="165"
        height="58"
        fill="none"
        stroke="var(--plate-seal)"
        stroke-width="1"
      />
      <text x="795" y="1086" class="ip-seal ip-stamp" fill="var(--plate-seal)" text-anchor="middle">
        設計
      </text>

      <line x1="72" y1="1108.5" x2="888" y2="1108.5" stroke="var(--plate-line)" stroke-width="1" />
    </g>
  </svg>
</template>

<style scoped>
.identity-plate {
  --plate-bg: #0a1014;
  --plate-border: #2b3a42;
  --plate-line: #192329;
  --plate-seal: #405966;
  --plate-muted: #7c8a93;
  --plate-g1: #00b9e9;
  --plate-g2: #00d4d4;
  --plate-dot: #42ffff;
  --plate-scan: #003d56;

  display: block;
  width: 100%;
  height: auto;

  --ip-jolt-scale: 1;
  --ip-burst-duration: 640ms;
}

:root[data-theme='light'] .identity-plate {
  --plate-bg: #eef3f5;
  --plate-border: #a9bcc6;
  --plate-line: #cddae1;
  --plate-seal: #8ba4b0;
  --plate-muted: #526b77;
  --plate-g1: #016f97;
  --plate-g2: #007586;
  --plate-dot: #0092c7;
  --plate-scan: #bed9e2;
}

/*
 * Negative impression. It borrows the theme's own ink: light on the dark
 * ground, deep ink on the light paper. The sheet stays transparent so the live
 * plate keeps reading through the tear. The extra specificity clears the
 * composed light-theme palette above.
 */
:root[data-theme] .identity-plate--ghost {
  --plate-bg: transparent;
  --plate-border: var(--c-ink);
  --plate-line: var(--c-ink);
  --plate-seal: var(--c-ink);
  --plate-muted: var(--c-ink);
  --plate-g1: var(--c-ink);
  --plate-g2: var(--c-soft);
  --plate-dot: var(--c-ink);
  --plate-scan: var(--c-ink);
  --c-soft: var(--c-ink);
}

.ip-mono {
  font-family: var(--font-mono);
  font-weight: 500;
}

.ip-head {
  font-size: 30px;
  letter-spacing: 0.5px;
}

.ip-ccs {
  font-size: 24px;
  letter-spacing: 2px;
}

.ip-role {
  font-size: 30px;
  letter-spacing: 2.6px;
}

.ip-meta {
  font-size: 22px;
  letter-spacing: 2.9px;
}

.ip-label {
  font-size: 16px;
  letter-spacing: 2.5px;
}

.ip-value {
  font-size: 22px;
  letter-spacing: 0.5px;
}

.ip-seal {
  font-family: var(--font-seal);
  font-size: 46px;
  font-weight: 500;
  line-height: 1;
}

.ip-stamp {
  font-size: 46px;
  letter-spacing: 4px;
  opacity: 0.85;
}

.ip-monogram {
  font-family: var(--font-serif);
  font-size: 310px;
  font-weight: 900;
  letter-spacing: 8px;
}

.ip-details-narrow {
  display: none;
}

@media (max-width: 767px) {
  .ip-details-wide {
    display: none;
  }

  .ip-details-narrow {
    display: inline;
  }

  .ip-head,
  .ip-ccs {
    font-size: 34px;
  }

  .ip-header-seal {
    transform: translateX(64px);
  }

  .ip-role,
  .ip-meta {
    font-size: 32px;
  }

  .ip-label,
  .ip-value {
    font-size: 35px;
  }
}

/*
 * Misregistration burst: the mechanical jolts are stepped, not eased, so the
 * sheet reads like a plotter losing register rather than a soft screen effect.
 * All groups finish on their original transform.
 */
@media (prefers-reduced-motion: no-preference) {
  .identity-plate.is-glitching {
    animation: ip-sheet-burst var(--ip-burst-duration) steps(1, end) both;
  }

  .identity-plate.is-glitching--quick {
    --ip-jolt-scale: 0.5;
    --ip-burst-duration: 360ms;
  }

  .identity-plate.is-glitching .ip-jolt {
    will-change: transform;
  }

  .identity-plate.is-glitching .ip-jolt--frame {
    animation: ip-jolt-frame var(--ip-burst-duration) steps(1, end) both;
  }

  .identity-plate.is-glitching .ip-jolt--header {
    animation: ip-jolt-header var(--ip-burst-duration) steps(1, end) both;
  }

  .identity-plate.is-glitching .ip-jolt--window {
    animation: ip-jolt-window var(--ip-burst-duration) steps(1, end) both;
  }

  .identity-plate.is-glitching .ip-jolt--ruler {
    animation: ip-jolt-ruler var(--ip-burst-duration) steps(1, end) both;
  }

  .identity-plate.is-glitching .ip-jolt--dossier {
    animation: ip-jolt-dossier var(--ip-burst-duration) steps(1, end) both;
  }

  .identity-plate.is-glitching .ip-jolt--details {
    animation: ip-jolt-details var(--ip-burst-duration) steps(1, end) both;
  }

  .identity-plate.is-glitching .ip-jolt--facts {
    animation: ip-jolt-facts var(--ip-burst-duration) steps(1, end) both;
  }

  .identity-plate.is-glitching .ip-jolt--stamp {
    animation: ip-jolt-stamp var(--ip-burst-duration) steps(1, end) both;
  }
}

@keyframes ip-sheet-burst {
  0%,
  100% {
    transform: translate(0, 0);
  }

  7% {
    transform: translate(calc(4px * var(--ip-jolt-scale)), calc(-2px * var(--ip-jolt-scale)));
  }

  19% {
    transform: translate(calc(-5px * var(--ip-jolt-scale)), calc(2px * var(--ip-jolt-scale)));
  }

  33% {
    transform: translate(calc(3px * var(--ip-jolt-scale)), calc(1px * var(--ip-jolt-scale)));
  }

  49% {
    transform: translate(calc(-3px * var(--ip-jolt-scale)), 0);
  }

  63% {
    transform: translate(calc(2px * var(--ip-jolt-scale)), calc(-1px * var(--ip-jolt-scale)));
  }

  76% {
    transform: translate(0, 0);
  }
}

@keyframes ip-jolt-frame {
  0%,
  100% {
    transform: translate(0, 0);
  }

  17% {
    transform: translate(calc(4px * var(--ip-jolt-scale)), calc(-2px * var(--ip-jolt-scale)));
  }

  35% {
    transform: translate(calc(-5px * var(--ip-jolt-scale)), calc(2px * var(--ip-jolt-scale)));
  }

  53% {
    transform: translate(calc(3px * var(--ip-jolt-scale)), 0);
  }

  69% {
    transform: translate(0, 0);
  }
}

@keyframes ip-jolt-header {
  0%,
  100% {
    transform: translate(0, 0);
  }

  7% {
    transform: translate(calc(18px * var(--ip-jolt-scale)), calc(-6px * var(--ip-jolt-scale)));
  }

  16% {
    transform: translate(calc(-10px * var(--ip-jolt-scale)), calc(3px * var(--ip-jolt-scale)));
  }

  27% {
    transform: translate(calc(24px * var(--ip-jolt-scale)), calc(-2px * var(--ip-jolt-scale)));
  }

  40% {
    transform: translate(calc(-7px * var(--ip-jolt-scale)), calc(2px * var(--ip-jolt-scale)));
  }

  54% {
    transform: translate(calc(6px * var(--ip-jolt-scale)), 0);
  }

  67% {
    transform: translate(0, 0);
  }
}

@keyframes ip-jolt-window {
  0%,
  100% {
    transform: translate(0, 0);
  }

  9% {
    transform: translate(calc(-14px * var(--ip-jolt-scale)), calc(4px * var(--ip-jolt-scale)));
  }

  19% {
    transform: translate(calc(20px * var(--ip-jolt-scale)), calc(-1px * var(--ip-jolt-scale)));
  }

  31% {
    transform: translate(calc(-26px * var(--ip-jolt-scale)), calc(5px * var(--ip-jolt-scale)));
  }

  45% {
    transform: translate(calc(12px * var(--ip-jolt-scale)), calc(-3px * var(--ip-jolt-scale)));
  }

  58% {
    transform: translate(calc(-5px * var(--ip-jolt-scale)), calc(1px * var(--ip-jolt-scale)));
  }

  72% {
    transform: translate(0, 0);
  }
}

@keyframes ip-jolt-ruler {
  0%,
  100% {
    transform: translate(0, 0);
  }

  11% {
    transform: translate(calc(9px * var(--ip-jolt-scale)), calc(-3px * var(--ip-jolt-scale)));
  }

  23% {
    transform: translate(calc(-13px * var(--ip-jolt-scale)), calc(2px * var(--ip-jolt-scale)));
  }

  37% {
    transform: translate(calc(17px * var(--ip-jolt-scale)), calc(-4px * var(--ip-jolt-scale)));
  }

  52% {
    transform: translate(calc(-6px * var(--ip-jolt-scale)), calc(1px * var(--ip-jolt-scale)));
  }

  66% {
    transform: translate(0, 0);
  }
}

@keyframes ip-jolt-dossier {
  0%,
  100% {
    transform: translate(0, 0);
  }

  10% {
    transform: translate(calc(13px * var(--ip-jolt-scale)), calc(-5px * var(--ip-jolt-scale)));
  }

  23% {
    transform: translate(calc(-19px * var(--ip-jolt-scale)), calc(4px * var(--ip-jolt-scale)));
  }

  36% {
    transform: translate(calc(6px * var(--ip-jolt-scale)), calc(-2px * var(--ip-jolt-scale)));
  }

  51% {
    transform: translate(calc(-10px * var(--ip-jolt-scale)), calc(2px * var(--ip-jolt-scale)));
  }

  65% {
    transform: translate(calc(2px * var(--ip-jolt-scale)), 0);
  }

  77% {
    transform: translate(0, 0);
  }
}

@keyframes ip-jolt-details {
  0%,
  100% {
    transform: translate(0, 0);
  }

  13% {
    transform: translate(calc(9px * var(--ip-jolt-scale)), calc(3px * var(--ip-jolt-scale)));
  }

  26% {
    transform: translate(calc(-12px * var(--ip-jolt-scale)), calc(-2px * var(--ip-jolt-scale)));
  }

  41% {
    transform: translate(calc(15px * var(--ip-jolt-scale)), calc(4px * var(--ip-jolt-scale)));
  }

  56% {
    transform: translate(calc(-5px * var(--ip-jolt-scale)), 0);
  }

  70% {
    transform: translate(0, 0);
  }
}

@keyframes ip-jolt-facts {
  0%,
  100% {
    transform: translate(0, 0);
  }

  12% {
    transform: translate(calc(-11px * var(--ip-jolt-scale)), calc(-3px * var(--ip-jolt-scale)));
  }

  25% {
    transform: translate(calc(15px * var(--ip-jolt-scale)), calc(3px * var(--ip-jolt-scale)));
  }

  39% {
    transform: translate(calc(-7px * var(--ip-jolt-scale)), calc(-4px * var(--ip-jolt-scale)));
  }

  54% {
    transform: translate(calc(9px * var(--ip-jolt-scale)), calc(2px * var(--ip-jolt-scale)));
  }

  68% {
    transform: translate(0, 0);
  }
}

@keyframes ip-jolt-stamp {
  0%,
  100% {
    transform: translate(0, 0);
  }

  14% {
    transform: translate(calc(-18px * var(--ip-jolt-scale)), calc(7px * var(--ip-jolt-scale)));
  }

  28% {
    transform: translate(calc(13px * var(--ip-jolt-scale)), calc(-5px * var(--ip-jolt-scale)));
  }

  44% {
    transform: translate(calc(-9px * var(--ip-jolt-scale)), calc(4px * var(--ip-jolt-scale)));
  }

  59% {
    transform: translate(calc(5px * var(--ip-jolt-scale)), 0);
  }

  73% {
    transform: translate(0, 0);
  }
}
</style>
