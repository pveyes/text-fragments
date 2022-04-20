# text-fragments

> [Text Fragments](https://web.dev/text-fragments) and [Selection](https://developer.mozilla.org/en-US/docs/Web/API/Selection) utilities.

## Features

- Normalized Selection
- Create excerpt from selected text
- Efficient Text Fragments generation
- Lightweight (~1kB minified gzipped)
- Optional React Bindings

## APIs

### Selection

This is not intended to be a one-stop shop for `Selection` and `Range`, but rather few useful function related to Text Fragments generation. For selection-related utilities, it will use `LiteSelection` with type as follows

```ts
interface LiteSelection {
  anchorNode: Node | null;
  anchorOffset: number;
  focusNode: Node | null;
  focusOffset: number;
}
```

#### `getSelection(): LiteSelection | null`

This function return a normalized `Selection` in the form of `LiteSelection`, or `null` if it's a collapsed selection or not a range selection.

```ts
import { getSelection } from 'text-fragments';

const selection = getSelection();

if (selection) {
  // do something with the selection
}
```

Because this is normalized, you can be sure that `anchorNode` is always point to the element before `focusNode`, and in case where it points to the same node, `anchorOffset` will always be less than `focusOffset`.

#### `getSelectedText(selection: LiteSelection, options?: SelectedTextOptions): string`

Return the text inside a selection. It accepts an optional `options` that you can use to pass `maxLength` or `moreTextIndicator`. This can be useful to create an excerpt or limit the

```ts
import { getSelection, getSelectedText } from 'text-fragments';

const selection = getSelection();
const text = getSelection(selection, {
  maxLength: 100, // defaults to infinity / ignored
  moreTextIndicator: '', // defaults to ...
});
```

### Text Fragments

There are 2 main function to generate Text Fragments, one with hash & one without. The algorithm used to generate Text Fragments is optimized for smallest string possible with the high chance of correctly highlighting a text. It might highlight the wrong portion of the text but the chances are pretty slim.

#### `getTextFragmentsWithHash(selection: LiteSelection): string`

Return text fragments string in the form of location hash. You can immediately use this by appending to current URL

```ts
import { getSelection, getTextFragmentsWithHash } from 'text-fragments';

const selection = getSelection();
const hash = getTextFragmentsWithHash(selection);
const url = window.location.href + hash;
// do something with the url
```

#### `getTextFragments(selection: LiteSelection): string`

Same as before, but without the `#:~:text=` [prefix](https://web.dev/text-fragments/#textstart).

```ts
import { getSelection, getTextFragmentsWithHash } from 'text-fragments';

const selection = getSelection();
const textFragments = getTextFragments(selection);
```

### Optional React bindings

There's also an optional React binding in the form of hooks that you can import via `text-fragments/react`

#### `useSelection(): LiteSelection | null`

The value returned by `useSelection` automatically reflects current selection and updates whenever user changes their selection in the document.

```tsx
import { getSelectedText } from 'text-fragments';
import { useSelection } from 'text-fragments/react';

const selection = useSelection();

return (
  <div>
    {selection && <p>Currently selecting {getSelectedText(selection)}</p>}
  </div>
);
```

#### `useTextFragments(options?: { includeHash: boolean }): string | null`

Get Text Fragments based on current selection. Similar to `useSelection` this value is automatically updated.

```tsx
import { useTextFragments } from 'text-fragments/react';

const hash = useTextFragments({ includeHash: true });

function handleShare() {
  window.open(window.location.href + hash);
}

return (
  <div>
    <button onClick={handleShare}>Preview</button>
    <Paragraph />
  </div>
);
```

## Related Projects

If you want a more robust library you can use `fragment-generation-utils` from [`text-fragments-polyfill`](https://github.com/GoogleChromeLabs/text-fragments-polyfill). It weighs in about 7kB minified gzipped.

## License

MIT
