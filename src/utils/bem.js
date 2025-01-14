export const createBEM = (b, n = 'jsf') => {
  const prefix = n ? `${n}-` : '';
  return {
    /** n-b */
    b: () => `${prefix}${b}`,
    /** n-b__e */
    be: (e) => e ? `${prefix}${b}__${e}` : '',
    /** n-b--m */
    bm: (m) => m ? `${prefix}${b}--${m}` : '',
    /** n-b__e--m */
    bem: (e, m) => e && m ? `${prefix}${b}__${e}--${m}` : '',
    /** n-s */
    ns: (s) => s ? `${prefix}${s}` : '',
    /** n-b-s */
    bs: (s) => s ? `${prefix}${b}-${s}` : '',
    /** --n-v */
    cv: (v) => v ? `--${prefix}${v}` : '',
    /** is-n */
    is: (n) => `is-${n}`,
  };
};
