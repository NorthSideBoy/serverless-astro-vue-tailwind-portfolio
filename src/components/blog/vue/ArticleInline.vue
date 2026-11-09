<script lang="ts">
import { defineComponent, Fragment, h, type VNodeChild } from 'vue'
import type { PropType } from 'vue'
import type { InlineNode, InlineTextNode } from '@/data/schemas/article'
import { content, type Locale } from '@/data/content'
import { isExternalArticleLink } from '@/components/blog/lib/link'
import UiIcon from '@/components/ui/vue/UiIcon.vue'

function textNode(node: InlineTextNode): VNodeChild {
  return (node.marks ?? []).reduce<VNodeChild>((child, mark) => {
    const spec = {
      strong: ['strong', 'font-semibold text-ink'],
      em: ['em', 'italic text-ink'],
      underline: ['u', 'underline decoration-1 underline-offset-4'],
      strike: ['s', 'line-through'],
      code: [
        'code',
        'rounded-[3px] border border-line bg-sunken px-1.5 py-0.5 font-mono text-[0.86em] text-cyan',
      ],
    }[mark]
    return spec ? h(spec[0]!, { class: spec[1] }, child) : child
  }, node.text)
}

export default defineComponent({
  props: {
    nodes: { type: Array as PropType<InlineNode[]>, required: true },
    locale: { type: String as PropType<Locale>, required: true },
    footnotes: {
      type: Object as PropType<Record<string, number>>,
      required: true,
    },
  },
  setup(props) {
    const parts = (nodes: (InlineNode | InlineTextNode)[]): VNodeChild[] =>
      nodes.map((node) => {
        if (node.type === 'text') return textNode(node)
        if (node.type === 'break') return h('br')
        if (node.type === 'link') {
          const external = isExternalArticleLink(node.href)
          return h(
            'a',
            {
              href: node.href,
              target: external ? '_blank' : undefined,
              rel: external ? 'noopener noreferrer' : undefined,
              class:
                'font-medium text-soft underline decoration-soft/50 decoration-1 underline-offset-4 transition hover:decoration-soft',
            },
            [
              ...parts(node.children),
              ...(external
                ? [
                    h(UiIcon, {
                      name: 'arrow-up-right',
                      size: 11,
                      class: 'mb-0.5 ml-0.5 inline-block',
                    }),
                    h(
                      'span',
                      { class: 'sr-only' },
                      `(${content[props.locale].ui.opensInNewTab})`,
                    ),
                  ]
                : []),
            ],
          )
        }
        const number = props.footnotes[node.id] ?? 0
        return h('sup', { class: 'ml-0.5' }, [
          h(
            'a',
            {
              id: `fnref-${node.id}`,
              href: `#fn-${node.id}`,
              'aria-label': `${content[props.locale].articlePage.footnoteRef} ${number}`,
              class:
                'font-mono text-[0.72em] font-medium text-soft underline decoration-soft/50 underline-offset-2 transition hover:decoration-soft',
            },
            String(number),
          ),
        ])
      })
    return () => h(Fragment, parts(props.nodes))
  },
})
</script>
