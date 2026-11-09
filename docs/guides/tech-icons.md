# Technology Icons

This guide covers how the Stack renders technology marks: the build-time
Simple Icons resolver, the optional R2 `customIcon`, and the checks that keep
the tiles correct.

## How it works

```text
Firestore technologies/{id}
  ├── icon: "typescript"          → Simple Icons resolver (build time)
  └── customIcon: "/images/..."   → R2 SVG rendered as a CSS mask
                ↓
StackSection.vue → TechIcon.vue → <svg> or masked <span>
                ↓
Static HTML; no client lookup, no hydration
```

`TechIcon` priority:

1. `customIcon` (R2 mask, inherits `currentColor` and the tile hover color)
2. resolved Simple Icons path (inline SVG path)
3. `FileCode2` generic fallback

`customIcon` takes precedence over `icon`. `icon` remains the library key and
fallback metadata, but it is not used when `customIcon` is present.

## Add a technology with a library icon

1. Create the document in the `technologies` Firestore collection with an
   `icon` key, a `stackGroupId`, hover colors and the usual metadata.
2. Run the build.
3. Read the build log:

```text
[tech-icons] "tailwind" (tailwind) resolved to tailwindcss
[tech-icons] No Simple Icons match for "my-tech" (my-tech-key)
```

- An info line means a fuzzy match was used. Verify the mark.
- A warning means there was no match. Do not add an alias to the resolver; add
  a `customIcon` instead.
- No line means the key matched an exact slug or title.

## Add a custom icon

1. **Prepare the SVG.** Use a `0 0 24 24` viewBox and a transparent
   background. Remove `<script>`, `<foreignObject>`, `on*` attributes and
   external `href` references. The mask uses the SVG alpha; colors are ignored
   and the mark renders monochrome.
2. **Upload it to R2.**
   - Key: `images/tech-icons/<slug>.svg`
   - `Content-Type: image/svg+xml`
   - `Cache-Control: public, max-age=31536000, immutable`
3. **Allow CORS.** The bucket must allow `GET` and `HEAD` from the site origin
   so `mask-image` can load the SVG. The current bucket uses `*` for public
   media.
4. **Reference it in Firestore.**
   ```json
   {
     "customIcon": "/images/tech-icons/<slug>.svg"
   }
   ```
   The path is relative, lowercase, ends in `.svg`, and is resolved through
   `PUBLIC_MEDIA_URL` at build time. Only Stack technologies use `customIcon`.
5. **Rebuild.** The build HEAD-checks the object. A missing object, non-SVG
   response, CORS failure or network failure logs:

   ```text
   [tech-icons] custom icon unavailable for "node": https://.../node.svg
   ```

   and the tile falls back to `FileCode2`. It does not substitute the library
   icon, because the custom mark is authoritative.
6. **Verify.** The tile must expose `data-tech-icon="<key>"` and the hover
   color must change in both themes.

## Current custom marks

| Key | R2 key | Reason |
| --- | --- | --- |
| node | `images/tech-icons/node.svg` | First Simple Icons match is not Node.js |
| fish | `images/tech-icons/fish.svg` | First Simple Icons match is not Fish shell |
| jwt | `images/tech-icons/jwt.svg` | No reliable normalized match |
| playwright | `images/tech-icons/playwright.svg` | Simple Icons 16 does not ship it |

## Reference

| Field | Rule |
| --- | --- |
| `icon` | Optional string, library key for the build resolver |
| `customIcon` | Optional lowercase `/images/...svg` path; Stack only |
| Stack requirement | One of `icon` or `customIcon` |
| Resolver | Normalize, search slug/title, first scored match, no aliases |
| Diagnostics | Warning for no match, info for fuzzy match |
| Custom check | Build-time `HEAD`; warning and `FileCode2` fallback |
| Mask | `mask-image`; `currentColor`; hover color; monochrome alpha |
| R2 cache | `public, max-age=31536000, immutable` |
| R2 CORS | `GET`/`HEAD` from the site origin |

## Troubleshooting

- **Wrong icon:** add a `customIcon`; do not add a resolver alias.
- **Tile shows a generic file icon:** check the `customIcon` warning in the
  build, then the R2 key, content type, CORS and object existence.
- **Square block instead of a shape:** the SVG has a background `rect`; upload
  a transparent SVG.
- **Icon color does not change:** the SVG is loaded as a mask, so the alpha is
  used and `currentColor` supplies the color. A multi-color SVG becomes
  monochrome by design.
- **`mask-image` does not load:** check CORS and the media domain. A missing
  object is caught at build time.

## CMS and security

The future `/admin` CMS must reuse `technologySchema` server-side (Admin SDK,
Cloud Function or Worker), sanitize the SVG before uploading to R2, and keep
the `technologies` collection closed to client writes. Do not store raw SVG
markup in Firestore and never render it with `v-html` or `set:html`.

Simple Icons is CC0; the brand marks remain trademarks of their owners.

## Verify

```sh
npm run check
npm test
npm run test:browser
npm run build
```
