# @sarthak61199/react-smart-image

An ergonomic, lightweight React component for smart, responsive images with optional BlurHash and LQIP placeholders.

## Features

- Responsive `srcset`/`sizes` generation from simple `breakpoints`
- Optional placeholders:
  - `blurhash` using the `blurhash` decoder
  - `lqip` via a low‑quality background image
- Works with any image CDN via a `transformUrl` function
- Types included, ESM and CJS builds, tree‑shakable
- Viewport‑based powered by Intersection Observer

## Installation

```bash
npm install @sarthak61199/react-smart-image
```

Peer dependency:

- `react` >= 16.8.0

## Quick start

```tsx
import { Image } from "@sarthak61199/react-smart-image";

export default function Example() {
  return (
    <Image
      src="https://images.example.com/photo.jpg"
      alt="Sunset over the hills"
      width={1200}
      height={800}
      breakpoints={{ 320: 320, 768: 768, 1024: 1024, 1440: 1440 }}
      placeholder="blurhash"
      blurhash="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
      transformUrl={(src, w) => `${src}?w=${w}&fit=cover`}
      style={{ objectFit: "cover", borderRadius: 8 }}
    />
  );
}
```

## API

```ts
type Breakpoints = Record<string, number>;

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number;
  height?: number;
  breakpoints?: Breakpoints; // { minViewportWidth: outputWidth }
  placeholder?: "blurhash" | "lqip" | "none";
  blurhash?: string; // required when placeholder = "blurhash"
  priority?: boolean; // eager vs lazy loading
  transformUrl?: (src: string, width?: number) => string; // adapt to your CDN
  deferUntilInView?: boolean; // only start loading when visible in viewport
}
```

### Notes

- When `width` and `height` are provided, the component sets `aspect-ratio` to reserve layout space and prevent CLS.
- `transformUrl` receives the original `src` and each `breakpoint` width, and should return the URL for that width. If omitted, a `?w={width}` parameter is appended.
- `placeholder="lqip"` uses a background image `${src}?lqip` behind the main image while it loads.
- Set `priority` to `true` to make the image load eagerly.
- Set `deferUntilInView` to `true` to avoid assigning `src`/`srcSet`/`sizes` until the image is inside the viewport (via Intersection Observer with a default `rootMargin` of `0px 0px 200px 0px`).

## Examples

Basic responsive image with CDN parameters:

```tsx
<Image
  src="https://cdn.example.com/img.jpg"
  alt="Sample"
  width={1200}
  height={800}
  breakpoints={{ 640: 640, 1024: 1024, 1440: 1440 }}
  transformUrl={(src, w) => `${src}?w=${w}&fit=cover&auto=format`}
/>
```

LQIP placeholder:

```tsx
<Image
  src="https://cdn.example.com/img.jpg"
  alt="Sample"
  placeholder="lqip"
/>
```

BlurHash placeholder:

```tsx
<Image
  src="https://cdn.example.com/img.jpg"
  alt="Sample"
  placeholder="blurhash"
  blurhash="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
/>
```

Viewport‑based loading:

```tsx
<Image
  src="https://cdn.example.com/img.jpg"
  alt="Sample"
  width={1200}
  height={800}
  breakpoints={{ 640: 640, 1024: 1024, 1440: 1440 }}
  deferUntilInView
/>
```

Advanced: use the `useInView` hook directly

```tsx
import { useInView, Image } from "@sarthak61199/react-smart-image";

function Custom() {
  const [ref, inView] = useInView({ rootMargin: "0px 0px 300px 0px", threshold: 0 });
  return (
    <Image
      ref={ref as any}
      src="https://cdn.example.com/img.jpg"
      alt="Sample"
      deferUntilInView={!inView}
    />
  );
}
```

## TypeScript

Types are bundled. You can import them as:

```ts
import type { ImageProps, Breakpoints } from "@sarthak61199/react-smart-image";
```

## Build

The package ships with both ESM and CJS builds and is tree‑shakable. Types are generated alongside the build output.

## License

MIT © @sarthak61199/react-smart-image contributors


