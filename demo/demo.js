(function (Quill) {
  'use strict';

  function debounce(fn, delay) {
    let timestamp;
    return function (...args) {
      if (timestamp) {
        clearTimeout(timestamp);
      }
      timestamp = setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    };
  }

  const Picker$1 = Quill.import('ui/picker');

  class EasyColorPicker extends Picker$1 {
    constructor(select, label, themeOptions) {
      super(select);
      this.themeOptions = Object.assign(
        {
          localStorageKey: 'used-color',
          closeAfterChange: true,
          customColorChangeDelay: 300,
          maxHistoryColor: 10,
          expandIcon: `<svg viewBox="0 0 32 32"><path fill="currentColor" d="m24 12l-8 10l-8-10z"/></svg>`,
          keepChooseColor: true,
        },
        themeOptions
      );
      this.label.innerHTML = label;
      this.container.classList.add('ql-color-picker');

      this.localColorUsedKey = `${this.select.className}-${this.themeOptions.localStorageKey}`;
      try {
        this.usedColor = JSON.parse(localStorage.getItem(this.localColorUsedKey));
        if (!this.usedColor || !(this.usedColor instanceof Array)) {
          throw new Error('usedColor get wrong type');
        }
      } catch (e) {
        localStorage.setItem(this.localColorUsedKey, []);
        this.usedColor = [];
      }
      this.createUsedColor();

      if (this.themeOptions.keepChooseColor) {
        this.container.classList.add('keep-color');
        this.bindLabelEvent();
        this.expendIcon();
      }
      this.curColor = '';
    }

    bindLabelEvent() {
      this.label.addEventListener('mousedown', (e) => {
        this.close();
        e.preventDefault();
        this.selectItem(
          Array.from(this.options.querySelectorAll('.ql-picker-item')).find(
            (op) => (op.dataset.value ?? '') === this.curColor
          ),
          true
        );
      });
    }

    expendIcon() {
      const span = document.createElement('span');
      span.classList.add('ql-picker-expand');
      this.themeOptions.expandIcon && (span.innerHTML = this.themeOptions.expandIcon);
      this.label.parentNode.insertBefore(span, this.label.nextSibling);

      span.addEventListener('mousedown', () => {
        this.togglePicker();
      });
      this.labelIcon = span;
    }

    update() {
      let option;
      if (this.select.selectedIndex > -1) {
        let item = this.container.querySelector('.ql-picker-options').children[this.select.selectedIndex];
        option = this.select.options[this.select.selectedIndex];
        this.selectItem(item);
      } else {
        this.selectItem(null);
      }
      let isActive = option != null && option !== this.select.querySelector('option[selected]');
      this.label.classList.toggle('ql-active', isActive);
      // 上面代码没有更改, 继承自 quill/ui/picker 主要是需要使用到 isActive
      // 使展开 icon 与图标 icon 同背景和颜色
      this.labelIcon && this.labelIcon.classList.toggle('ql-active', isActive);
    }

    createUsedColor() {
      const usedWrap = document.createElement('div');
      usedWrap.classList.add('used');

      const usedColorLabels = document.createElement('div');
      usedColorLabels.classList.add('used-list');
      usedWrap.appendChild(usedColorLabels);
      this.options.appendChild(usedWrap);
      this.usedColorLabels = usedColorLabels;
      for (let i = this.usedColor.length - 1; i >= 0; i--) {
        this.createUsedColorItem(this.usedColor[i]);
      }
    }

    createUsedColorItem(color) {
      const option = this.createUsedColorOption(color);
      this.select.appendChild(option);
      const label = this.buildItem(option);
      label.setAttribute('custom', '');
      this.usedColorLabels.insertBefore(label, this.usedColorLabels.firstChild);
    }

    createUsedColorOption(color) {
      const findOption = this.select.querySelector(`option[value='${color}'][custom]`);
      if (findOption) {
        return findOption;
      }
      const option = document.createElement('option');
      option.setAttribute('custom', '');
      option.setAttribute('value', color);
      return option;
    }

    removeUsedColor(color) {
      const option = this.select.querySelector(`option[value='${color}'][custom]`);
      const label = this.options.querySelector(`p[data-value='${color}'][custom]`);
      option && option.remove();
      label && label.remove();
    }

    selectColor(color) {
      if (!color) return;
      const index = this.usedColor.findIndex((c) => c === color);
      if (index !== -1) {
        const repeatColor = this.usedColor.splice(index, 1);
        this.removeUsedColor(repeatColor);
      }
      this.usedColor.unshift(color);
      const removeColors = this.usedColor.slice(this.themeOptions.maxHistoryColor);
      removeColors.map((color) => this.removeUsedColor(color));
      this.usedColor = this.usedColor.slice(0, this.themeOptions.maxHistoryColor);
      localStorage.setItem(this.localColorUsedKey, JSON.stringify(this.usedColor));
      this.createUsedColorItem(color);
    }

    buildItem(option) {
      if (option.value === 'custom') {
        const item = document.createElement('div');
        const input = document.createElement('input');
        item.classList.add('custom');
        input.setAttribute('type', 'color');
        item.appendChild(input);

        input.addEventListener(
          'input',
          debounce(() => {
            this.selectColor(input.value);
            this.selectItem(this.options.querySelector(`p[data-value='${input.value}']`), true);
          }, 300)
        );
        this.customColorInput = input;
        return item;
      } else {
        const item = document.createElement('p');
        item.tabIndex = '0';
        item.setAttribute('role', 'button');
        item.classList.add('ql-picker-item');
        if (!option.value) {
          item.classList.add('blank');
        }
        if (option.hasAttribute('value')) {
          item.setAttribute('data-value', option.getAttribute('value'));
        }
        if (option.textContent) {
          item.setAttribute('data-label', option.textContent);
        }
        item.addEventListener('click', () => {
          this.selectColor(item?.dataset?.value);
          this.selectItem(item, true);
        });

        item.style.backgroundColor = option.getAttribute('value') || '';
        return item;
      }
    }

    selectItem(item, trigger = false) {
      const value = item ? item.getAttribute('data-value') || '' : '';
      const colorLabel = this.label.querySelector('.ql-color-label');
      if (colorLabel) {
        if (colorLabel.tagName === 'line') {
          colorLabel.style.stroke = value;
        } else {
          colorLabel.style.fill = value;
        }
      }

      this.curColor = value;

      const selected = this.container.querySelector('.ql-selected');
      // if (item === selected) return;
      if (selected != null) {
        selected.classList.remove('ql-selected');
      }
      if (item == null) return;
      item.classList.add('ql-selected');
      // change index find function
      this.select.selectedIndex = Array.from(this.select.children).findIndex(
        (option) => option.value === (item.dataset.value ?? '')
      );

      if (item.hasAttribute('data-value')) {
        this.label.setAttribute('data-value', item.getAttribute('data-value'));
      } else {
        this.label.removeAttribute('data-value');
      }
      if (item.hasAttribute('data-label')) {
        this.label.setAttribute('data-label', item.getAttribute('data-label'));
      } else {
        this.label.removeAttribute('data-label');
      }

      if (trigger) {
        this.select.dispatchEvent(new Event('change'));
        this.themeOptions.closeAfterChange && this.close();
      }
    }
  }

  const Parchment$1 = Quill.import('parchment');
  // 兼容 quill1.3.7
  const StyleAttr$1 = Parchment$1.StyleAttributor || Parchment$1.Attributor.Style;
  const BackgroundStyle = new StyleAttr$1('background', 'background-color', {
    scope: Parchment$1.Scope.INLINE,
  });

  const Parchment = Quill.import('parchment');
  // 兼容 quill1.3.7
  const StyleAttr = Parchment.StyleAttributor || Parchment.Attributor.Style;
  const ColorStyle = new StyleAttr('color', 'color', {
    scope: Parchment.Scope.INLINE,
  });

  const SnowTheme = Quill.import('themes/snow');
  const IconPicker = Quill.import('ui/icon-picker');
  const Picker = Quill.import('ui/picker');

  Quill.register(
    {
      'attributors/style/color': ColorStyle,
      'formats/color': ColorStyle,
      'attributors/style/background': BackgroundStyle,
      'formats/background': BackgroundStyle,
    },
    true
  );

  const ALIGNS = [false, 'center', 'right', 'justify'];
  const FONTS = [false, 'serif', 'monospace'];
  const HEADERS = ['1', '2', '3', false];
  const SIZES = ['small', false, 'large', 'huge'];
  const COLORS = [
    '',
    'rgb(255, 255, 255)',
    'rgb(0, 0, 0)',
    'rgb(72, 83, 104)',
    'rgb(41, 114, 244)',
    'rgb(0, 163, 245)',
    'rgb(49, 155, 98)',
    'rgb(222, 60, 54)',
    'rgb(248, 136, 37)',
    'rgb(245, 196, 0)',
    'rgb(153, 56, 215)',

    'rgb(242, 242, 242)',
    'rgb(127, 127, 127)',
    'rgb(243, 245, 247)',
    'rgb(229, 239, 255)',
    'rgb(229, 246, 255)',
    'rgb(234, 250, 241)',
    'rgb(254, 233, 232)',
    'rgb(254, 243, 235)',
    'rgb(254, 249, 227)',
    'rgb(253, 235, 255)',

    'rgb(216, 216, 216)',
    'rgb(89, 89, 89)',
    'rgb(197, 202, 211)',
    'rgb(199, 220, 255)',
    'rgb(199, 236, 255)',
    'rgb(195, 234, 213)',
    'rgb(255, 201, 199)',
    'rgb(255, 220, 196)',
    'rgb(255, 238, 173)',
    'rgb(242, 199, 255)',

    'rgb(191, 191, 191)',
    'rgb(63, 63, 63)',
    'rgb(128, 139, 158)',
    'rgb(153, 190, 255)',
    'rgb(153, 221, 255)',
    'rgb(152, 215, 182)',
    'rgb(255, 156, 153)',
    'rgb(255, 186, 132)',
    'rgb(255, 226, 112)',
    'rgb(213, 142, 255)',

    'rgb(165, 165, 165)',
    'rgb(38, 38, 38)',
    'rgb(53, 59, 69)',
    'rgb(20, 80, 184)',
    'rgb(18, 116, 165)',
    'rgb(39, 124, 79)',
    'rgb(158, 30, 26)',
    'rgb(184, 96, 20)',
    'rgb(163, 130, 0)',
    'rgb(94, 34, 129)',

    'rgb(147, 147, 147)',
    'rgb(13, 13, 13)',
    'rgb(36, 39, 46)',
    'rgb(12, 48, 110)',
    'rgb(10, 65, 92)',
    'rgb(24, 78, 50)',
    'rgb(88, 17, 14)',
    'rgb(92, 48, 10)',
    'rgb(102, 82, 0)',
    'rgb(59, 21, 81)',

    'custom',
  ];

  class EasyColorSnowTheme extends SnowTheme {
    buildPickers(selects, icons) {
      this.pickers = Array.from(selects).map((select) => {
        if (select.classList.contains('ql-align')) {
          if (select.querySelector('option') == null) {
            fillSelect(select, ALIGNS);
          }
          if (typeof icons.align === 'object') {
            return new IconPicker(select, icons.align);
          }
        }
        if (select.classList.contains('ql-background') || select.classList.contains('ql-color')) {
          const format = select.classList.contains('ql-background') ? 'background' : 'color';
          if (select.querySelector('option') == null) {
            fillColorSelect(select, COLORS);
          }
          return new EasyColorPicker(select, icons[format], this.options.themeOptions);
        }
        if (select.querySelector('option') == null) {
          if (select.classList.contains('ql-font')) {
            fillSelect(select, FONTS);
          } else if (select.classList.contains('ql-header')) {
            fillSelect(select, HEADERS);
          } else if (select.classList.contains('ql-size')) {
            fillSelect(select, SIZES);
          }
        }
        return new Picker(select);
      });
      const update = () => {
        this.pickers.forEach((picker) => {
          if (picker instanceof EasyColorPicker && this.options?.themeOptions?.keepChooseColor) return;
          picker.update();
        });
      };
      this.quill.on(Quill.events.EDITOR_CHANGE, update);
    }
  }

  function fillSelect(select, values, defaultValue = false) {
    values.forEach((value) => {
      const option = document.createElement('option');
      if (value === defaultValue) {
        option.setAttribute('selected', 'selected');
      } else {
        option.setAttribute('value', value);
      }
      select.appendChild(option);
    });
  }
  function fillColorSelect(select, values, format, defaultValue) {
    const colorGetter = document.createElement('span');
    values.forEach((value) => {
      const option = document.createElement('option');
      if (value === defaultValue) {
        option.setAttribute('selected', 'selected');
      } else {
        colorGetter.style[format] = value;
        option.setAttribute('value', colorGetter.style[format]);
      }
      select.appendChild(option);
    });
  }

  Quill.import('themes/bubble');
  Quill.import('ui/icon-picker');
  Quill.import('ui/picker');

  Quill.register(
    {
      'attributors/style/color': ColorStyle,
      'formats/color': ColorStyle,
      'attributors/style/background': BackgroundStyle,
      'formats/background': BackgroundStyle,
    },
    true
  );

  // const Parchment = Quill.import('parchment');

  Quill.register(
    {
      'themes/easy-color-snow-theme': EasyColorSnowTheme,
      // 'themes/easy-color-bubble-theme': EasyColorBubbleTheme,
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
  new Quill('#editor-snow', {
    theme: 'easy-color-snow-theme',
    modules: {
      toolbar: [
        [{ script: 'sub' }, { script: 'super' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ direction: 'rtl' }],
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
      keepChooseColor: true,
    },
  });

})(Quill);
//# sourceMappingURL=demo.js.map
