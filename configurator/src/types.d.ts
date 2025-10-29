import type React from 'react';

declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src?: string;
      'camera-controls'?: boolean;
      'disable-zoom'?: boolean;
      ar?: boolean;
      'ar-scale'?: 'fixed' | 'auto';
      'environment-image'?: string;
    };
  }
}
