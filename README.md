# QuillJS Color Picker

A color picker module used in QuillJS

[Demo](https://zzxming.github.io/quill-easy-color/docs/index.html)

# Install

```
npm install quill-easy-color
```

# Usage

```javascript
import Quill from 'quill';
import { EasyColorSnowTheme, EasyColorBubbleTheme } from 'quill-easy-color';
import 'quill-easy-color/dist/index.css';

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
      [{ color: [] }, { background: [] }],
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
| keepChooseColor        | keep choose color                         | boolean | true       |

# Custom

You can import `EasyColorPicker` to custom your own color picker

```js
import Quill from 'quill';
import { EasyColorPicker } from './index';

export default class OwnPicker extends EasyColorPicker {
    ...
}
```
