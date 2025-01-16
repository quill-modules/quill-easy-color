import Quill from 'quill';
import { createColorPicker, debounce, HEXtoRGB, isLightColor, colortoRGB } from '../utils';
const Picker = Quill.import('ui/picker');

export default class EasyColorPicker extends Picker {
  static clearText = 'Remove color';
  static customText = 'Color picker';
  currentIndex = -1;

  get statics() {
    return this.constructor;
  }
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
    if (this.currentIndex > -1) {
      let item = this.container.querySelectorAll('.ql-picker-item')[this.currentIndex];
      option = this.select.options[this.currentIndex];
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
    this.usedColorLabels.appendChild(label);
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
      const onChange = debounce((color) => {
        const { r, g, b, a } = HEXtoRGB(color)
        const result = `rgba(${r}, ${g}, ${b}, ${a})`;
        this.selectColor(result);
        this.selectItem(this.options.querySelector(`p[data-value='${result}']`), true);
      }, 300)
      const wrapper = document.createElement('div');
      wrapper.classList.add('custom', 'ql-picker-item');
      const text = document.createElement('span');
      text.textContent = this.statics.customText;
      wrapper.appendChild(text);
      const colorPicker = createColorPicker({ onChange })
      wrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        if (wrapper.contains(colorPicker)) return;
        wrapper.appendChild(colorPicker);
        colorPicker.addEventListener('click', (e) => e.stopPropagation());
        document.addEventListener('click', () => {
          colorPicker.remove()
        }, { once: true });
      })
      return wrapper
    } else {
      const item = document.createElement('p');
      item.tabIndex = '0';
      item.setAttribute('role', 'button');
      item.classList.add('ql-picker-item');

      const value = option.getAttribute('value');
      if (!option.value) {
        item.classList.add('blank');
        const text = document.createElement('span');
        text.textContent = this.statics.clearText;
        item.appendChild(text);
        // set dark if color is dark color scheme
        if (!isLightColor(colortoRGB(value))) {
          item.dataset.dark = 'true';
        }
      }

      if (option.hasAttribute('value')) {
        item.setAttribute('data-value', value);
      }
      if (option.textContent) {
        item.setAttribute('data-label', option.textContent);
      }
      item.addEventListener('click', () => {
        this.selectColor(item?.dataset?.value);
        this.selectItem(item, true);
      });

      item.style.setProperty('--bg', value);
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
    if (selected != null) {
      selected.classList.remove('ql-selected');
    }
    if (item == null) return;
    item.classList.add('ql-selected');
    // change index find function
    this.select.selectedIndex = Array.from(this.select.children).findIndex(
      (option) => option.value === (item.dataset.value ?? '')
    );
    this.currentIndex = this.select.selectedIndex;

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
