import {
  getTextInsideNode,
  getSelection,
  getSelectedText,
  getTextFragments,
} from '../src';

const html = `
<div id="root">
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent in ultrices tortor, ut dictum lacus. Maecenas at dictum sapien. Nullam posuere rutrum feugiat. Integer condimentum fermentum dui at maximus. Curabitur eget quam eget est tincidunt vestibulum. Nam dapibus commodo nibh, eget malesuada augue euismod vel. Etiam maximus feugiat scelerisque.</p>
  <p>Short break.</p>
  <p>Sed vestibulum tortor at ex feugiat, quis finibus odio vehicula. Phasellus eget luctus mauris. Quisque ultricies vestibulum pretium. Curabitur pulvinar, sem ac vehicula ultricies, enim dui cursus eros, at efficitur nulla libero at velit. Aliquam egestas ligula tortor, et laoreet purus vestibulum a. Sed semper volutpat lectus eget iaculis. Etiam ultricies pulvinar mi, et ullamcorper lectus pulvinar eget. Integer ipsum lectus, dignissim at leo at, molestie aliquet magna. Nulla neque elit, dictum a sapien eget, condimentum molestie mi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sit amet nibh aliquet, aliquam lectus vehicula, sodales eros.</p>
  <p>Maecenas vitae quam vel sem placerat lacinia at quis dui. Nunc bibendum commodo lacus, varius ultrices lacus condimentum a. Aliquam aliquam odio vitae dolor semper, ut sollicitudin elit feugiat. Donec eleifend ipsum quam, vel pulvinar justo facilisis in. Aenean ultrices consectetur neque eget semper. Integer et urna at orci aliquam finibus nec ut risus. Pellentesque massa velit, aliquam eu nisi id, suscipit ullamcorper diam.</p>
  <p>Praesent dignissim aliquet enim quis tincidunt. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Pellentesque erat mauris, ullamcorper vel efficitur non, commodo id enim. Fusce consequat euismod purus, in vehicula diam elementum eu. Phasellus eleifend tellus non massa finibus hendrerit. Nullam mauris elit, consectetur ut congue ac, aliquet ac sem. Phasellus metus magna, convallis ac dolor at, dignissim interdum arcu. Duis ac suscipit tellus, finibus scelerisque libero. Suspendisse efficitur nibh in orci convallis bibendum. Mauris eget interdum nunc, vel tempus ante. Nam vulputate quis arcu in tincidunt. Sed eget ipsum vitae lorem porta pretium nec at nunc. Quisque fringilla enim nisl, quis lacinia lectus hendrerit vel. Aenean mollis consequat nisi non egestas.</p>
  <p>Aenean ultrices nisi sit amet risus lacinia placerat. Aliquam at ipsum sem. Nam euismod ullamcorper interdum. In ex nunc, hendrerit ut enim non, faucibus facilisis nunc. Morbi dui lorem, auctor vel dui id, aliquet semper ante. Duis in tellus feugiat, gravida libero dictum, viverra justo. Interdum et malesuada fames ac ante ipsum primis in faucibus. Proin in ex commodo, facilisis erat vel, ullamcorper velit. Sed mi est, ornare at ante vitae, rhoncus congue mauris. In scelerisque turpis ut eros porta, ut volutpat lectus mollis. Etiam in urna lorem. Phasellus eu metus dui.</p>
</div>
`;

beforeEach(() => {
  document.body.innerHTML = html;
});

describe('Selection', () => {
  describe('getSelection', () => {
    it('return null on no selection', () => {
      expect(getSelection()).toEqual(null);
    });

    it('return a lite selection', () => {
      const p = document.querySelector('p:nth-of-type(1)');
      const range = new Range();
      range.setStart(p.firstChild, 0);
      range.setEnd(p.firstChild, 10);
      selectRange(range);

      expect(getSelection()).toEqual({
        anchorNode: p.firstChild,
        anchorOffset: 0,
        focusNode: p.firstChild,
        focusOffset: 10,
      });
    });

    it('normalize newline-only selection on focus node', () => {
      const p1 = document.querySelector('p:nth-of-type(1)');
      const p2 = document.querySelector('p:nth-of-type(2)');

      const range = new Range();
      range.setStart(p1.firstChild, 0);
      range.setEnd(p2.firstChild, 0);
      selectRange(range);

      const selection = getSelection();

      expect(selection.focusNode.textContent).toEqual(
        p1.firstChild.textContent
      );
      expect(selection.focusOffset).toEqual(p1.firstChild.textContent.length);
    });

    it('normalize backward selection', () => {
      const p1 = document.querySelector('p:nth-of-type(1)');

      const sameNodeRange = new Range();
      sameNodeRange.setStart(p1.firstChild, 0);
      sameNodeRange.setEnd(p1.firstChild, 10);
      selectRangeBackwards(sameNodeRange);

      const backwardSelectionWithinSameNode = getSelection();
      expect(backwardSelectionWithinSameNode).toEqual({
        anchorNode: p1.firstChild,
        anchorOffset: 0,
        focusNode: p1.firstChild,
        focusOffset: 10,
      });

      // TODO: test backward selection between nodes
      // const p2 = document.querySelector('p:nth-of-type(2)');
      // const betweenNodesRange = new Range();
      // sameNodeRange.setStart(p1.firstChild, 0);
      // sameNodeRange.setEnd(p2.firstChild, 10);
      // selectRangeBackwards(betweenNodesRange);

      // const backwardSelectionBetweenNodes = getSelection();
      // expect(backwardSelectionBetweenNodes).toEqual({
      //   anchorNode: p1.firstChild,
      //   anchorOffset: 0,
      //   focusNode: p2.firstChild,
      //   focusOffset: 10,
      // });
    });
  });

  describe('getSelectedText', () => {
    it('return selected text', () => {
      const p = document.querySelector('p:nth-of-type(1)');
      const range = new Range();
      range.setStart(p.firstChild, 0);
      range.setEnd(p.firstChild, 11);
      selectRange(range);

      expect(getSelectedText(getSelection())).toEqual('Lorem ipsum');
    });

    it('return empty string for invalid selection', () => {
      expect(
        getSelectedText({
          anchorNode: null,
          anchorOffset: 0,
          focusNode: null,
          focusOffset: 0,
        })
      ).toEqual('');
    });

    it('slice text if max length is defined', () => {
      const p = document.querySelector('p:nth-of-type(1)');
      const range = new Range();
      range.setStart(p.firstChild, 0);
      range.setEnd(p.firstChild, 11);
      selectRange(range);

      const selection = getSelection();
      expect(getSelectedText(selection, { maxLength: 7 })).toEqual('Lorem...');
      expect(
        getSelectedText(selection, { maxLength: 5, moreTextIndicator: '.' })
      ).toEqual('Lorem.');
      expect(getSelectedText(selection, { maxLength: 11 })).toEqual(
        'Lorem ipsum'
      );
    });

    it('only use anchor text if already more than maxLength', () => {
      const p1 = document.querySelector('p:nth-of-type(1)');
      const p2 = document.querySelector('p:nth-of-type(2)');

      const range = new Range();
      range.setStart(p1.firstChild, 0);
      range.setEnd(p2.firstChild, 11);
      selectRange(range);

      const selection = getSelection();
      expect(getSelectedText(selection, { maxLength: 7 })).toEqual('Lorem...');
    });

    it('slice across multiple nodes with maxLength', () => {
      const p1 = document.querySelector('p:nth-of-type(1)');
      const p3 = document.querySelector('p:nth-of-type(3)');

      const range = new Range();
      range.setStart(p1.firstChild, 340);
      range.setEnd(p3.firstChild, 9);
      selectRange(range);

      const selection = getSelection();
      expect(getSelectedText(selection, { maxLength: 200 })).toEqual(
        'scelerisque.\n\nShort break.\n\nSed vesti'
      );
    });
  });

  describe('getTextInsideNode', () => {
    it('return correct text', () => {
      const text = getTextInsideNode(document.querySelector('p'));

      expect(text).toEqual(expect.stringContaining('Lorem ipsum'));
      expect(text).toEqual(expect.stringContaining('feugiat scelerisque.'));
    });
  });
});

describe('Text Fragments', () => {
  describe('getTextFragments', () => {
    it('return the text if less than 4 words', () => {
      const p = document.querySelector('p:nth-of-type(1)');
      const range = new Range();
      range.setStart(p.firstChild, 0);
      range.setEnd(p.firstChild, 5);
      selectRange(range);

      expect(getTextFragments(getSelection())).toEqual('Lorem');

      const threeWordsRange = new Range();
      threeWordsRange.setStart(p.firstChild, 130);
      threeWordsRange.setEnd(p.firstChild, 151);
      selectRange(threeWordsRange);

      expect(getTextFragments(getSelection())).toEqual(
        'Nullam%20posuere%20rutrum'
      );
    });

    it('use 2 words text start and end if text is >= 4 words', () => {
      const p = document.querySelector('p:nth-of-type(1)');
      const range = new Range();
      range.setStart(p.firstChild, 103);
      range.setEnd(p.firstChild, 129);
      selectRange(range);

      expect(getTextFragments(getSelection())).toEqual(
        'Maecenas%20at,dictum%20sapien.'
      );
    });

    it('add prefix/suffix for partial words in a single node', () => {
      const p = document.querySelector('p:nth-of-type(1)');

      const range = new Range();
      range.setStart(p.firstChild, 32);
      range.setEnd(p.firstChild, 46);
      selectRange(range);

      expect(getTextFragments(getSelection())).toEqual(
        'cons-,ectetur%20adipis,-cing'
      );
    });

    it('use 2 words text start and text end for selection across nodes', () => {
      const p1 = document.querySelector('p:nth-of-type(1)');
      const p2 = document.querySelector('p:nth-of-type(2)');

      const range = new Range();
      range.setStart(p1.firstChild, 6);
      range.setEnd(p2.firstChild, 5);
      selectRange(range);

      expect(getTextFragments(getSelection())).toEqual('ipsum%20dolor,Short');
    });

    it('use single word for both text start and end if it has insufficient words', () => {
      const p1 = document.querySelector('p:nth-of-type(1)');
      const p3 = document.querySelector('p:nth-of-type(3)');

      const range = new Range();
      range.setStart(p1.firstChild, 340);
      range.setEnd(p3.firstChild, 3);
      selectRange(range);

      expect(getTextFragments(getSelection())).toEqual('scelerisque.,Sed');
    });

    it('use prefix/suffix for partial words across nodes', () => {
      const p1 = document.querySelector('p:nth-of-type(1)');
      const p3 = document.querySelector('p:nth-of-type(3)');

      const range = new Range();
      range.setStart(p1.firstChild, 345);
      range.setEnd(p3.firstChild, 9);
      selectRange(range);

      expect(getTextFragments(getSelection())).toEqual(
        'scele-,risque.,Sed%20vesti,-bulum'
      );

      const insufficientRange = new Range();
      insufficientRange.setStart(p1.firstChild, 345);
      insufficientRange.setEnd(p3.firstChild, 2);
      selectRange(insufficientRange);

      expect(getTextFragments(getSelection())).toEqual('scele-,risque.,Se,-d');
    });
  });
});

function selectRange(range) {
  const sel = document.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

function selectRangeBackwards(range) {
  const sel = document.getSelection();
  const endRange = range.cloneRange();
  endRange.collapse(false);
  sel.removeAllRanges();
  sel.addRange(endRange);
  sel.extend(range.startContainer, range.startOffset);
}
