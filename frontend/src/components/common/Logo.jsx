import logoSrc from '@/assets/logo.svg';

export default function Logo({ className = '' }) {
  return <img src={logoSrc} alt="CoolZone" className={`${className} object-contain`} />;
}
