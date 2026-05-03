import SectionClient from './SectionClient';

export function generateStaticParams() {
  return ['gold', 'silver', 'coin', 'crypto', 'cash'].map(id => ({ id }));
}

export default function SectionPage() {
  return <SectionClient />;
}
