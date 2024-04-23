# QuillJS Color Picker

A table module used in QuillJS@1.3.7

[Demo](https://zzxming.github.io/quill-easy-color/demo/index.html)

# Install

```
npm install quill-easy-color
```

# Usage

```javascript
import Quill from 'quill';
import { EasyColorSnowTheme, EasyColorBubbleTheme } from './index';

// choose the theme you are using to register
Quill.register(
  {
    'themes/easy-color-snow-theme': EasyColorSnowTheme,
    // 'themes/easy-color-snow-theme': EasyColorBubbleTheme,
  },
  true
);
const quillBubble = new Quill('#editor-snow', {
  theme: 'easy-color-snow-theme',
  themeOptions: {
    localStorageKey: 'easy-color',
    closeAfterChange: false,
    customColorChangeDelay: 0,
  },
  modules: {
    toolbar: [
      [{ script: 'sub' }, { script: 'super' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ direction: 'rtl' }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ header: 1 }, { header: 2 }, { header: 3 }, { header: 4 }],
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
```

# Options

| attribute              | description                               | type    | default    |
| ---------------------- | ----------------------------------------- | ------- | ---------- |
| localStorageKey        | localStorage key prefix                   | string  | used-color |
| closeAfterChange       | snow theme close panel after change color | boolean | true       |
| customColorChangeDelay | custom color change debounce delay        | number  | 300        |

# Custom

You can import `EasyColorPicker` to custom your own color picker

```js
import Quill from 'quill';
import { EasyColorPicker } from './index';

export default class OwnPicker extends EasyColorPicker {
    ...
}
```
