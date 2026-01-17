/**
 * Available filter options
 */
export const FILTERS = [
  { name: 'NORMAL', value: 'normal' },
  { name: 'HALFTONE', value: 'halftone' },
  { name: 'DITHERED', value: 'dithered' },
  { name: 'PIXELATED', value: 'pixelated' },
  { name: 'SEPIA', value: 'sepia' }
];

/**
 * Filter preview styles
 */
export const getFilterPreviewStyle = (filterValue) => {
  const styles = {
    normal: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    halftone: 'radial-gradient(circle, black 1px, white 1px)',
    dithered: 'repeating-linear-gradient(45deg, black 0px, black 1px, white 1px, white 2px)',
    pixelated: 'repeating-conic-gradient(black 0% 25%, white 25% 50%)',
    sepia: 'linear-gradient(135deg, #8b6f47 0%, #d4a574 50%, #8b6f47 100%)'
  };

  const backgroundSizes = {
    halftone: '6px 6px',
    pixelated: '8px 8px'
  };

  return {
    background: styles[filterValue] || styles.normal,
    backgroundSize: backgroundSizes[filterValue] || 'auto'
  };
};

