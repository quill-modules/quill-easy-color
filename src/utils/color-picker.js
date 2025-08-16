import { createBEM } from './bem'
const normalizeValue = function (value, max) {
  value = Math.min(max, Math.max(0, Number.parseFloat(`${value}`)));

  // Handle floating point rounding errors
  if (Math.abs(value - (max)) < 0.000_001) {
    return 1;
  }

  // Convert into [0, 1] range if it isn't already
  return (value % (max)) / Number.parseFloat(max);
};
export const validateHSB = (hsb) => {
  return {
    h: Math.min(360, Math.max(0, hsb.h)),
    s: Math.min(100, Math.max(0, hsb.s)),
    b: Math.min(100, Math.max(0, hsb.b)),
    a: Math.min(1, Math.max(0, hsb.a)),
  };
};
export const HEXtoRGB = (hex) => {
  hex = hex.startsWith('#') ? hex.slice(1) : hex;
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const a = Number((Number.parseInt(hex.slice(6, 8) || 'ff', 16) / 255).toFixed(2));
  return { r, g, b, a };
};
export const RGBtoHSB = (rgb) => {
  let { r, g, b, a } = rgb;
  r = normalizeValue(r, 255);
  g = normalizeValue(g, 255);
  b = normalizeValue(b, 255);

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h;
  const v = max;

  const d = max - min;
  const s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0; // achromatic
  }
  else {
    switch (max) {
      case r: {
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      }
      case g: {
        h = (b - r) / d + 2;
        break;
      }
      case b: {
        h = (r - g) / d + 4;
        break;
      }
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, b: v * 100, a };
};
export const HSBtoRGB = (hsb) => {
  let { h, s, b, a } = hsb;
  h = normalizeValue(h, 360) * 6;
  s = normalizeValue(s, 100);
  b = normalizeValue(b, 100);

  const i = Math.floor(h);
  const f = h - i;
  const p = b * (1 - s);
  const q = b * (1 - f * s);
  const t = b * (1 - (1 - f) * s);
  const mod = i % 6;
  const r = [b, q, p, p, t, b][mod];
  const g = [t, b, b, q, p, p][mod];
  const v = [p, p, t, b, b, q][mod];

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(v * 255),
    a,
  };
};
export const RGBtoHEX = (rgb) => {
  const hex = [rgb.r.toString(16), rgb.g.toString(16), rgb.b.toString(16), Math.round(rgb.a * 255).toString(16)];
  for (const key in hex) {
    if (hex[key].length === 1) {
      hex[key] = `0${hex[key]}`;
    }
  }
  return hex.join('');
};
export const HSBtoHEX = (hsb) => RGBtoHEX(HSBtoRGB(hsb));
export const RGBStringtoRGB = (colorString) => {
  colorString = colorString.replace(/\s+/g, '');

  const match = colorString.match(/rgba?\((\d+),(\d+),(\d+)(?:,([\d.]+))?\)/);
  if (!match) {
    return { a: 1, r: 0, g: 0, b: 0 }
  }

  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  const a = match[4] ? parseFloat(match[4]) : 1;

  return { a, r, g, b };
}
export const isLightColor = (rgb) => {
  const { r, g, b } = rgb;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
};
export const colortoRGB = (color) => {
  const span = document.createElement('span');
  span.style.backgroundColor = color;
  return RGBStringtoRGB(span.style.backgroundColor);
}

export const createColorPicker = (options = {}) => {
  const contentWidth = 230;
  const contentHeight = 150;
  const handleSizeSec = 10;

  let hsbValue = RGBtoHSB(HEXtoRGB(options.color || '#ff0000'));
  const bem = createBEM('color-picker');
  const root = document.createElement('div');
  root.classList.add(bem.b());

  const content = document.createElement('div');
  content.classList.add(bem.be('content'));

  const colorSelector = document.createElement('div');
  colorSelector.classList.add(bem.be('selector'));

  const colorBackground = document.createElement('div');
  colorBackground.classList.add(bem.be('background'));
  colorSelector.appendChild(colorBackground);

  const colorHandle = document.createElement('div');
  colorHandle.classList.add(bem.be('background-handle'));
  colorBackground.appendChild(colorHandle);

  const colorAlpha = document.createElement('div');
  colorAlpha.classList.add(bem.be('alpha'));

  const alphaBg = document.createElement('div');
  alphaBg.classList.add(bem.be('alpha-bg'));

  const alphaHandle = document.createElement('div');
  alphaHandle.classList.add(bem.be('alpha-handle'));

  colorAlpha.appendChild(alphaBg);
  colorAlpha.appendChild(alphaHandle);

  const colorHue = document.createElement('div');
  colorHue.classList.add(bem.be('hue'));

  const colorHueHandle = document.createElement('div');
  colorHueHandle.classList.add(bem.be('hue-handle'));
  colorHue.appendChild(colorHueHandle);

  const action = document.createElement('div');
  action.classList.add(bem.be('action'));

  const [colorRInput, colorGInput, colorBInput, colorAInput] = (['r', 'g', 'b', 'a']).map((key) => {
    const item = document.createElement('div');
    item.classList.add(bem.be('action-item'), key);

    const label = document.createElement('label');
    label.textContent = key.toUpperCase();

    const colorInput = document.createElement('input');
    colorInput.classList.add(bem.be('input'));

    colorInput.addEventListener('input', () => {
      colorInput.value = colorInput.value.replaceAll(/[^0-9]/g, '');
    });
    colorInput.addEventListener('change', () => {
      let value = Math.round(Number(colorInput.value));
      if (key === 'a') {
        value = value / 100;
      }
      const result = validateHSB(RGBtoHSB(Object.assign({}, HSBtoRGB(hsbValue), { [key]: value })));
      updateValue(result);
      updateUI();
    });

    item.appendChild(label);
    item.appendChild(colorInput);
    action.appendChild(item);

    return colorInput;
  });

  content.appendChild(colorHue);
  content.appendChild(colorSelector);
  content.appendChild(colorAlpha);
  root.appendChild(content);
  root.appendChild(action);

  let colorDragging = false;
  let hueDragging = false;
  let alphaDragging = false;

  function updateInput() {
    const hex = HSBtoHEX(hsbValue);
    for (const [i, input] of [colorRInput, colorGInput, colorBInput].entries()) {
      input.value = String(Number.parseInt(hex[i * 2] + hex[i * 2 + 1], 16));
    }
    colorAInput.value = String((hsbValue.a * 100).toFixed(0));
  }
  function updateColorHandle() {
    Object.assign(colorHandle.style, {
      left: `${Math.floor((contentWidth * hsbValue.s) / 100)}px`,
      top: `${Math.floor((contentHeight * (100 - hsbValue.b)) / 100)}px`,
    });
  }
  function updateColorSelector() {
    colorSelector.style.backgroundColor = `#${RGBtoHEX(HSBtoRGB({
      h: hsbValue.h,
      s: 100,
      b: 100,
      a: 1,
    }))}`;
  }
  function updateHue() {
    colorHueHandle.style.top = `${Math.floor(contentHeight - (contentHeight * hsbValue.h) / 360)}px`;
  }
  function updateAlphaHandle() {
    alphaHandle.style.left = `${hsbValue.a * 100}%`;
  }
  function updateAlphaBg() {
    const { r, g, b } = HSBtoRGB(hsbValue);
    alphaBg.style.background = `linear-gradient(to right, rgba(${r}, ${g}, ${b}, 0) 0%, rgba(${r}, ${g}, ${b}, 1) 100%)`;
  }
  function updateUI() {
    updateColorHandle();
    updateColorSelector();
    updateHue();
    updateAlphaHandle();
    updateAlphaBg();
    updateInput();
  }
  function updateValue(value) {
    hsbValue = validateHSB(Object.assign({}, hsbValue, value));

    updateInput();

    if (options.onChange) {
      options.onChange(`#${HSBtoHEX(hsbValue)}`);
    }
  }

  function pickColor(event) {
    const rect = colorSelector.getBoundingClientRect();
    const top = rect.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);
    const left = rect.left + document.body.scrollLeft;
    const saturation = Math.floor((100 * Math.max(0, Math.min(contentWidth, event.pageX - left))) / contentWidth);
    const brightness = Math.floor((100 * (contentHeight - Math.max(0, Math.min(contentHeight, event.pageY - top)))) / contentHeight);

    updateValue({
      s: saturation,
      b: brightness,
    });
    updateUI();
  }
  function pickHue(event) {
    const top = colorHue.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);

    updateValue({
      h: Math.floor((360 * (contentHeight - Math.max(0, Math.min(contentHeight, event.pageY - top)))) / contentHeight),
    });
    updateUI();
  }
  function pickAlpha(event) {
    const { pageX } = event;
    const rect = colorAlpha.getBoundingClientRect();
    let left = pageX - rect.left;
    left = Math.max(handleSizeSec / 2, left);
    left = Math.min(left, rect.width - handleSizeSec / 2);

    updateValue({
      a: Math.round(((left - 10 / 2) / (rect.width - 10)) * 100) / 100,
    });
    updateUI();
  }

  function onDrag(event) {
    if (colorDragging) {
      event.preventDefault();
      pickColor(event);
    }

    if (hueDragging) {
      event.preventDefault();
      pickHue(event);
    }

    if (alphaDragging) {
      event.preventDefault();
      pickAlpha(event);
    }
  }

  function onColorSelectorDragEnd() {
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', onColorSelectorDragEnd);
    colorDragging = false;
  }
  function onColorSelectorMousedown(e) {
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', onColorSelectorDragEnd);
    colorDragging = true;
    pickColor(e);
  }
  colorSelector.addEventListener('mousedown', onColorSelectorMousedown);

  function onColorHueDragEnd() {
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', onColorHueDragEnd);
    hueDragging = false;
  }
  function onColorHueMousedown(event) {
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', onColorHueDragEnd);
    hueDragging = true;
    pickHue(event);
  }
  colorHue.addEventListener('mousedown', onColorHueMousedown);

  function onColorAlphaDragEnd() {
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', onColorAlphaDragEnd);
    alphaDragging = false;
  }
  function onColorAlphaMousedown(event) {
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', onColorAlphaDragEnd);
    alphaDragging = true;
    pickAlpha(event);
  }
  colorAlpha.addEventListener('mousedown', onColorAlphaMousedown);

  updateUI();
  return root;
};