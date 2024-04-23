import Quill from 'quill';
import { EasyColorSnowTheme } from './index';

Quill.register({ 'themes/easy-color-theme': EasyColorSnowTheme }, true);

const quill = new Quill('#editor', {
  theme: 'easy-color-theme',
  modules: {
    toolbar: [
      [{ script: 'sub' }, { script: 'super' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ direction: 'rtl' }],
      [{ header: [1, 2, false] }],
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
    customColorChangeDelay: 0,
  },
});
