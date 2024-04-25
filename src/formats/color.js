import Quill from 'quill';
const Parchment = Quill.import('parchment');
// 兼容 quill1.3.7
const StyleAttr = Parchment.StyleAttributor || Parchment.Attributor.Style;
const ColorStyle = new StyleAttr('color', 'color', {
  scope: Parchment.Scope.INLINE,
});

export { ColorStyle };
