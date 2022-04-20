import { useState, useEffect, useRef } from 'react';
import { LiteSelection, getSelection, getTextFragments } from './index';

export function useSelection() {
  const [selection, setSelection] = useState<LiteSelection | null>(null);
  const selectTimeout = useRef<number>();

  useEffect(() => {
    function handleSelection() {
      setSelection(getSelection());
    }

    // Use 0 timeout before triggering handleSelection because it's not reliable.
    // There's a bug where after selection, clicking the range trigger the same
    // selection set, even though it's actually cleared
    function handlePointerUp() {
      if (selectTimeout.current) {
        clearTimeout(selectTimeout.current);
      }

      selectTimeout.current = window.setTimeout(handleSelection);
    }

    // Use pointerup event because selectionchange
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  return selection;
}

export function useTextFragments() {
  const selection = useSelection();
  return selection ? getTextFragments(selection) : null;
}
