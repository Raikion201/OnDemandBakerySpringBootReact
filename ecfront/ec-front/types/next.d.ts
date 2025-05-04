import type { ReactNode } from 'react';

declare module 'next' {
  export interface PageProps {
    params?: any;
    searchParams?: any;
  }
}
