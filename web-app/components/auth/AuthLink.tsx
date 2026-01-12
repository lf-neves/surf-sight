import Link from 'next/link';

interface AuthLinkProps {
  href: string;
  children: React.ReactNode;
}

export function AuthLink({ href, children }: AuthLinkProps) {
  return (
    <Link href={href} className="text-cyan-600 hover:text-cyan-700 font-medium">
      {children}
    </Link>
  );
}
