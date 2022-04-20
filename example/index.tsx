import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { hasTextFragmentsSupport, getTextFragmentsWithHash, LiteSelection } from '../';
import { useSelection } from '../react';

const App = () => {
  const selection = useSelection();
  const [isSupported, setIsSupported] = React.useState(false);

  React.useEffect(() => {
    setIsSupported(hasTextFragmentsSupport());
  }, []);

  function handlePreview() {
    window.open(window.location.href + getTextFragmentsWithHash(selection));
  }

  const showShareButton = Boolean(selection);
  const buttonPosition = getButtonPosition(selection);

  return (
    <div className="m-auto max-w-xl">
      {!isSupported && <span>Your browser doesn't support text fragments</span>}
      <strong className="my-4 block">Select any text in paragraph below</strong>
      <div
        className="p-1 px-3 bg-slate-100 mb-4rounded-sm absolute shadow-lg border border-slate-200 flex space-x-1"
        style={{
          display: showShareButton ? 'block' : 'none',
          left: buttonPosition.x,
          top: buttonPosition.y,
        }}
      >
        <button type="button" onClick={handlePreview}>Preview</button>
      </div>
      <Paragraph />
    </div>
  );
};

interface ButtonPosition {
  x: number;
  y: number;
}

function getButtonPosition(selection: LiteSelection): ButtonPosition {
  if (!selection) {
    return { x: 0, y: 0 };
  }

  const currentSelection = document.getSelection()!;
  const rangeRect = currentSelection.getRangeAt(0).getBoundingClientRect();
  const mainRect = document.querySelector('main')!.getBoundingClientRect();

  return {
    x: rangeRect.x - mainRect.x + rangeRect.width / 3,
    y: rangeRect.bottom + 5,
  }
}

function Paragraph() {
  return (
    <>
      <p className="mb-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent in ultrices tortor, ut dictum lacus. Maecenas at dictum sapien. Nullam posuere rutrum feugiat. Integer condimentum fermentum dui at maximus. Curabitur eget quam eget est tincidunt vestibulum. Nam dapibus commodo nibh, eget malesuada augue euismod vel. Etiam maximus feugiat scelerisque.</p>
      <p className="mb-2">Short break.</p>
      <p className="mb-2">Sed vestibulum tortor at ex feugiat, quis finibus odio vehicula. Phasellus eget luctus mauris. Quisque ultricies vestibulum pretium. Curabitur pulvinar, sem ac vehicula ultricies, enim dui cursus eros, at efficitur nulla libero at velit. Aliquam egestas ligula tortor, et laoreet purus vestibulum a. Sed semper volutpat lectus eget iaculis. Etiam ultricies pulvinar mi, et ullamcorper lectus pulvinar eget. Integer ipsum lectus, dignissim at leo at, molestie aliquet magna. Nulla neque elit, dictum a sapien eget, condimentum molestie mi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sit amet nibh aliquet, aliquam lectus vehicula, sodales eros.</p>
      <p className="mb-2">Maecenas vitae quam vel sem placerat lacinia at quis dui. Nunc bibendum commodo lacus, varius ultrices lacus condimentum a. Aliquam aliquam odio vitae dolor semper, ut sollicitudin elit feugiat. Donec eleifend ipsum quam, vel pulvinar justo facilisis in. Aenean ultrices consectetur neque eget semper. Integer et urna at orci aliquam finibus nec ut risus. Pellentesque massa velit, aliquam eu nisi id, suscipit ullamcorper diam.</p>
      <p className="mb-2">Praesent dignissim aliquet enim quis tincidunt. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Pellentesque erat mauris, ullamcorper vel efficitur non, commodo id enim. Fusce consequat euismod purus, in vehicula diam elementum eu. Phasellus eleifend tellus non massa finibus hendrerit. Nullam mauris elit, consectetur ut congue ac, aliquet ac sem. Phasellus metus magna, convallis ac dolor at, dignissim interdum arcu. Duis ac suscipit tellus, finibus scelerisque libero. Suspendisse efficitur nibh in orci convallis bibendum. Mauris eget interdum nunc, vel tempus ante. Nam vulputate quis arcu in tincidunt. Sed eget ipsum vitae lorem porta pretium nec at nunc. Quisque fringilla enim nisl, quis lacinia lectus hendrerit vel. Aenean mollis consequat nisi non egestas.</p>
      <p className="mb-2">Aenean ultrices nisi sit amet risus lacinia placerat. Aliquam at ipsum sem. Nam euismod ullamcorper interdum. In ex nunc, hendrerit ut enim non, faucibus facilisis nunc. Morbi dui lorem, auctor vel dui id, aliquet semper ante. Duis in tellus feugiat, gravida libero dictum, viverra justo. Interdum et malesuada fames ac ante ipsum primis in faucibus. Proin in ex commodo, facilisis erat vel, ullamcorper velit. Sed mi est, ornare at ante vitae, rhoncus congue mauris. In scelerisque turpis ut eros porta, ut volutpat lectus mollis. Etiam in urna lorem. Phasellus eu metus dui.</p>
    </>
  )
}

ReactDOM.render(<App />, document.querySelector('main'));
