import Image from 'next/image';
import type { SVGProps } from 'react';

export function Logo(props: Omit<SVGProps<SVGSVGElement>, 'src'> & { src?: string }) {
  const { src, ...rest } = props;
  return (
    <Image
      src="/logo.svg"
      alt="ZenBank Logo"
      width={48}
      height={48}
      className={props.className}
    />
  );
}
