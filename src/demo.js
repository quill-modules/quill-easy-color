import Quill from 'quill';
import EasyColorTheme from './index';

Quill.register({ 'themes/easy-color-theme': EasyColorTheme }, true);

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
});
