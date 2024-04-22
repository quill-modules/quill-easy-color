import Quill from 'quill';
const SnowTheme = Quill.import('themes/snow');
const IconPicker = Quill.import('ui/icon-picker');
const Picker = Quill.import('ui/picker');

import EasyColorPicker from '../ui/easy-color-pick';

const ALIGNS = [false, 'center', 'right', 'justify'];
const FONTS = [false, 'serif', 'monospace'];
const HEADERS = ['1', '2', '3', false];
const SIZES = ['small', false, 'large', 'huge'];
const COLORS = [
  false,
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

export default class EasyColorTheme extends SnowTheme {
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
          fillSelect(select, COLORS);
        }
        return new EasyColorPicker(select, icons[format]);
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
