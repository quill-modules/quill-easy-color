import Quill from 'quill';
import { EasyColorSnowTheme, EasyColorBubbleTheme } from './index';

Quill.register(
  {
    'themes/easy-color-snow-theme': EasyColorSnowTheme,
    'themes/easy-color-bubble-theme': EasyColorBubbleTheme,
  },
  true
);

// const quillBubble = new Quill('#editor-bubble', {
//   theme: 'easy-color-bubble-theme',
//   modules: {
//     toolbar: [
//       [{ script: 'sub' }, { script: 'super' }],
//       [{ indent: '-1' }, { indent: '+1' }],
//       [{ direction: 'rtl' }],
//       [{ header: [1, 2, 3, 4, 5, 6, false] }],
//       [{ header: 1 }, { header: 2 }, { header: 3 }, { header: 4 }],
//       ['bold', 'italic', 'underline'],
//       ['image', 'code-block'],
//       [{ color: [] }, { background: [] }],
//       [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
//       ['table'],
//       [{ font: [] }],
//       [{ align: [] }],
//     ],
//   },
//   themeOptions: {
//     localStorageKey: 'easy-color',
//     closeAfterChange: false,
//     customColorChangeDelay: 0,
//   },
// });
const quillSnow = new Quill('#editor-snow', {
  theme: 'easy-color-snow-theme',
  modules: {
    toolbar: [
      [{ script: 'sub' }, { script: 'super' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ direction: 'rtl' }],
      [{ header: 1 }, { header: 2 }, { header: 3 }, { header: 4 }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline'],
      ['image', 'code-block'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
      ['table'],
      [{ font: [] }],
      [{ align: [] }],
    ],
  },
  themeOptions: {
    localStorageKey: 'easy-color',
    closeAfterChange: false,
    customColorChangeDelay: 300,
  },
});
