export type LiteSelection = Pick<
  Selection,
  'anchorNode' | 'anchorOffset' | 'focusNode' | 'focusOffset'
>;

/**
 * ================================================================================
 * Selection utilities
 * ================================================================================
 */
export function getSelection(): LiteSelection | null {
  const currentSelection = document.getSelection();
  if (
    !currentSelection ||
    currentSelection.isCollapsed ||
    currentSelection.type !== 'Range'
  ) {
    return null;
  }

  return normalizeSelectionDirection(currentSelection);
}

export function normalizeSelectionDirection(
  selection: Selection
): LiteSelection {
  const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;

  if (!anchorNode || !focusNode) {
    return { anchorNode, anchorOffset, focusNode, focusOffset };
  }

  const position = anchorNode.compareDocumentPosition(focusNode);
  if (position === 2) {
    // backward selection across multiple node
    return {
      anchorNode: focusNode,
      anchorOffset: focusOffset,
      focusNode: anchorNode,
      focusOffset: anchorOffset,
    };
  }

  if (position === 0 && anchorOffset > focusOffset) {
    // backward selection within same node
    return {
      anchorNode,
      anchorOffset: focusOffset,
      focusNode,
      focusOffset: anchorOffset,
    };
  }

  if (focusOffset === 0) {
    // only select new line, check previous node
    const previousFocusNode = getPreviousNode(focusNode);

    return {
      anchorNode,
      anchorOffset,
      focusNode: previousFocusNode,
      focusOffset: previousFocusNode?.textContent?.length ?? 0,
    };
  }

  return {
    anchorNode,
    anchorOffset,
    focusNode,
    focusOffset,
  };
}

interface SelectedTextOptions {
  maxLength?: number;
  moreTextIndicator?: string;
}

export function getSelectedText(
  selection: LiteSelection,
  options: SelectedTextOptions = {}
): string {
  const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
  const { maxLength, moreTextIndicator = '...' } = options;

  if (!anchorNode || !focusNode) {
    return '';
  }

  if (anchorNode === focusNode) {
    const text = getTextInsideNode(anchorNode, anchorOffset, focusOffset);
    if (maxLength) {
      return sliceTextToMaxLength(text, maxLength, moreTextIndicator);
    }
    return text;
  }

  let text = getTextInsideNode(anchorNode, anchorOffset);
  if (maxLength && text.length > maxLength) {
    return sliceTextToMaxLength(text, maxLength, moreTextIndicator);
  }

  let nextNode = getNextNode(anchorNode);
  while (
    nextNode &&
    nextNode.compareDocumentPosition(focusNode) !== 2 &&
    text.length < (maxLength ?? Infinity)
  ) {
    const separator =
      nextNode.nodeType === 3
        ? ''
        : window.getComputedStyle(nextNode as any).display === 'block'
        ? '\n\n'
        : '';
    const theNextNode = getNextNode(nextNode);
    let includedText = getTextInsideNode(nextNode).replace('\n', '');
    if (!theNextNode || theNextNode.compareDocumentPosition(focusNode) === 2) {
      // this means this node is the last one / focusMode
      // so we should only include text until the focusOffset
      includedText = getTextInsideNode(nextNode, 0, focusOffset).replace(
        '\n',
        ''
      );
    }

    text += separator + includedText;
    nextNode = theNextNode;
  }

  return sliceTextToMaxLength(text, maxLength, moreTextIndicator);
}

export function getTextInsideNode(
  node: Node | null,
  start?: number,
  end?: number
): string {
  if (!node) {
    return '';
  }

  return node.nodeType === 3
    ? // text node
      (node as any).data.slice(start ?? 0, end ?? (node as any).data.length)
    : // DOM node
    node.textContent
    ? node.textContent.slice(start ?? 0, end ?? node.textContent.length)
    : '';
}

/**
 * ================================================================================
 * Text-fragments utilities
 * https://web.dev/text-fragments/#text-fragments
 * ================================================================================
 */
export function hasTextFragmentsSupport() {
  return 'fragmentDirective' in document;
}

export function getTextFragments(selection: LiteSelection): string {
  const { textStart, textEnd, prefix, suffix } = getTextSelection(selection);
  const encodedTextEnd = textEnd ? ',' + encodeURIComponent(textEnd) : '';
  const encodedPrefix = prefix ? encodeURIComponent(prefix) + '-,' : '';
  const encodedSuffix = suffix ? ',-' + encodeURIComponent(suffix) : '';
  const textFragment =
    encodedPrefix +
    encodeURIComponent(textStart) +
    encodedTextEnd +
    encodedSuffix;

  return textFragment;
}

export function getTextFragmentsWithHash(selection: LiteSelection): string {
  // https://web.dev/text-fragments/#textstart
  return '#:~:text=' + getTextFragments(selection);
}

/**
 * ================================================================================
 * Internals
 * ================================================================================
 */

interface TextSelection {
  textStart: string;
  textEnd?: string;
  prefix?: string;
  suffix?: string;
}

function getTextSelection(selection: LiteSelection): TextSelection {
  const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;

  if (!anchorNode || !focusNode) {
    return { textStart: '' };
  }

  if (anchorNode === focusNode) {
    const text = getTextInsideNode(anchorNode);
    const selectedText = text.slice(anchorOffset, focusOffset);
    const words = selectedText.split(' ');

    const firstAnchorWord = getFirstAnchorWord(anchorNode, anchorOffset);
    const firstSelectedWord = words[0];
    const lastFocusWord = getLastFocusWord(focusNode, focusOffset);
    const lastSelectedWord = words[words.length - 1];

    // add prefix/suffix if it's a partial word
    const prefix =
      firstAnchorWord === firstSelectedWord
        ? undefined
        : firstAnchorWord.replace(firstSelectedWord, '');
    const suffix =
      lastFocusWord === lastSelectedWord
        ? undefined
        : lastFocusWord.replace(lastSelectedWord, '');

    if (words.length >= 4) {
      const wl = words.length;
      const textStart = words[0] + ' ' + words[1];
      const textEnd = words[wl - 2] + ' ' + words[wl - 1];
      return { textStart, textEnd, prefix, suffix };
    }

    return { textStart: selectedText, prefix, suffix };
  }

  const anchorText: string = getTextInsideNode(anchorNode, anchorOffset);
  const focusText: string = getTextInsideNode(focusNode, 0, focusOffset);
  const startWords = anchorText.split(' ');
  const textStart =
    startWords.length < 2 ? startWords[0] : startWords[0] + ' ' + startWords[1];

  const endWords = focusText.split(' ').filter(Boolean);

  const firstAnchorWord = getFirstAnchorWord(anchorNode, anchorOffset);
  const firstStartWord = startWords[0];
  const prefix =
    firstAnchorWord !== firstStartWord
      ? firstAnchorWord.replace(firstStartWord, '')
      : undefined;
  const lastFocusWord = getLastFocusWord(focusNode, focusOffset);
  const lastEndWord = endWords[endWords.length - 1];
  const suffix =
    lastFocusWord !== lastEndWord
      ? lastFocusWord.replace(lastEndWord, '')
      : undefined;

  const textEnd =
    endWords.length === 1
      ? endWords[0]
      : endWords[endWords.length - 2] + ' ' + endWords[endWords.length - 1];

  return { textStart, textEnd, prefix, suffix };
}

function getFirstAnchorWord(node: Node, offset: number): string {
  const text = getTextInsideNode(node);

  if (offset === 0) {
    return text.split(' ')[0];
  }

  let spaceOffset = offset;
  while (text[spaceOffset] !== ' ') {
    spaceOffset--;
  }

  return text.slice(spaceOffset + 1, text.length).split(' ')[0];
}

function getLastFocusWord(node: Node, offset: number): string {
  const text = getTextInsideNode(node);

  if (offset === text.length) {
    return text.split(' ').reverse()[0];
  }

  let spaceOffset = offset;
  while (text[spaceOffset] !== ' ' && spaceOffset < text.length) {
    spaceOffset++;
  }

  return text.slice(0, spaceOffset).split(' ').reverse()[0];
}

function sliceTextToMaxLength(
  text: string,
  maxLength: number | undefined,
  indicator: string
) {
  const max = maxLength ?? text.length;
  if (text.length <= max) {
    return text;
  }

  let spaceOffset = max;
  while (text[spaceOffset] !== ' ') {
    spaceOffset--;
  }

  return text.slice(0, spaceOffset) + indicator;
}

function getPreviousNode(node: Node): ChildNode | null {
  let previousNode = node.previousSibling ?? getParentPreviousSibling(node);
  if (!previousNode) {
    return null;
  }

  if (previousNode.nodeType === 3 && (previousNode as any).data.trim() === '') {
    previousNode = previousNode.previousSibling;
  }
  return previousNode;
}

function getNextNode(node: Node): ChildNode | null {
  let nextNode = node.nextSibling ?? getParentNextSibling(node);
  if (!nextNode) {
    return null;
  }

  if (nextNode.nodeType === 3 && (nextNode as any).data.trim() === '') {
    nextNode = nextNode.nextSibling;
  }
  return nextNode;
}

function getParentPreviousSibling(node: Node): ChildNode | null {
  if (!node.parentNode) {
    return null;
  }

  if (node.parentNode.previousSibling) {
    return node.parentNode.previousSibling;
  }

  return getParentPreviousSibling(node.parentNode);
}

function getParentNextSibling(node: Node): ChildNode | null {
  if (!node.parentNode) {
    return null;
  }

  if (node.parentNode.nextSibling) {
    return node.parentNode.nextSibling;
  }

  return getParentNextSibling(node.parentNode);
}
