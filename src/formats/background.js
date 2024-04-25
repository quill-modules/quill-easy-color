import Quill from 'quill';
const Parchment = Quill.import('parchment');
// 兼容 quill1.3.7
const StyleAttr = Parchment.StyleAttributor || Parchment.Attributor.Style;
const BackgroundStyle = new StyleAttr('background', 'background-color', {
  scope: Parchment.Scope.INLINE,
});

export { BackgroundStyle };
