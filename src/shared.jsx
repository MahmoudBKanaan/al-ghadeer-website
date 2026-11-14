import { useEffect, useState } from 'react';
import {
  ArrowLeft, Bean, CakeSlice, Candy, Cherry, Coffee, Cookie, Croissant, CupSoda, Donut,
  IceCreamBowl, Leaf, MapPin, Menu, Mountain, Pause, Phone, Pizza, Play,
  Popcorn, Sandwich, Soup, Sprout, UtensilsCrossed, Wheat, X,
} from 'lucide-react';
import { href, navigation, restaurant, restaurantNameText, socials, whatsappUrl } from './config.js';

const tapeIcons = [Coffee, Croissant, Leaf, CupSoda, Bean, Sandwich, Sprout, Cookie, Mountain, Soup,
  Cherry, CakeSlice, Wheat, Donut, Pizza, Candy, IceCreamBowl, Popcorn, UtensilsCrossed];

export function IconWhatsApp({ size = 22 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none">
    <path stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" d="M20.9 11.9a8.9 8.9 0 0 1-13.1 7.9L3 21l1.3-4.7a8.9 8.9 0 1 1 16.6-4.4Z" />
    <path fill="currentColor" d="M9.2 7.4c-.2-.4-.4-.4-.6-.4-.8-.1-1.5.6-1.6 1.7-.1 1.2.6 2.3 1 2.9 1.1 1.8 2.8 3.1 4.9 3.8 1.2.4 2.3.4 3-.5.3-.4.4-.9.4-1.2 0-.2-.2-.3-.4-.4l-2-1c-.3-.1-.5-.1-.7.2l-.6.7c-.1.2-.3.2-.6.1-1.3-.6-2.3-1.5-3-2.8-.2-.2 0-.3.1-.5l.5-.7c.1-.1.1-.3 0-.5l-.4-1.4Z" />
  </svg>;
}

function TikTokIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M14.5 3h2.8a5 5 0 0 0 4.2 4.2V10a7.6 7.6 0 0 1-4.2-1.3v6.2a6.1 6.1 0 1 1-5.8-6.1v2.9a3.2 3.2 0 1 0 3 3.2V3Z" /></svg>;
}

function SnapchatIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3.7c-3.5 0-5 2.5-5 5.4 0 .6 0 1.3.1 2-.8.4-1.9-.5-2.3.3-.4.7.7 1.3 1.5 1.5 0 1.6-1.7 3.4-3.3 3.7-.1.6 1.5 1.1 2.6 1.2l.3 1c.1.4 1.6.1 2.2.2 1.5.3 2.2 1.3 3.9 1.3s2.4-1 3.9-1.3c.6-.1 2.1.2 2.2-.2l.3-1c1.1-.1 2.7-.6 2.6-1.2-1.6-.3-3.3-2.1-3.3-3.7.8-.2 1.9-.8 1.5-1.5-.4-.8-1.5.1-2.3-.3.1-.7.1-1.4.1-2 0-2.9-1.5-5.4-5-5.4Z" /></svg>;
}

const socialIcons = { tiktok: TikTokIcon, snapchat: SnapchatIcon };

export function WhatsAppButton({ children = 'اطلب عبر واتساب', message = '', className = '' }) {
  return <a className={`button ${className}`} href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer"><IconWhatsApp />{children}</a>;
}

export function Logo({ className = '', alt = '' }) {
  return <img className={className} src={href('/images/brand/logo.svg')} alt={alt} width="132" height="149" />;
}

export function RestaurantName() {
  return <bdi className="restaurant-name" dir="ltr">{restaurant.name}</bdi>;
}

export function MenuHours() {
  return <div className="menu-hours">
    <p>{restaurant.breakfastHoursText}</p>
    <p>{restaurant.mainMenuHoursText}</p>
  </div>;
}

function NavLinks({ active }) {
  return navigation.map(({ path, label, key }) => (
    <a key={key} href={href(path)} aria-current={active === key ? 'page' : undefined}>{label}</a>
  ));
}

export function Header({ active }) {
  return <header className="site-header">
    <div className="header-inner">
      <a className="brand-lockup" href={href('/')} aria-label={restaurantNameText + '، الرئيسية'}>
        <Logo /><span><strong><RestaurantName /></strong><small>{restaurant.city}</small></span>
      </a>
      <nav className="desktop-nav" aria-label="التنقل الرئيسي"><NavLinks active={active} /></nav>
      <a className="button header-order" href={href('/menu/')}><UtensilsCrossed size={17} aria-hidden="true" />اطلب الآن</a>
      <details className="mobile-nav" onKeyDown={event => {
        if (event.key === 'Escape') {
          event.currentTarget.open = false;
          event.currentTarget.querySelector('summary').focus();
        }
      }}>
        <summary aria-label="قائمة التنقل"><Menu className="mobile-open-icon" /><X className="mobile-close-icon" /></summary>
        <nav aria-label="التنقل الرئيسي"><NavLinks active={active} /></nav>
      </details>
    </div>
  </header>;
}

export function Tapes({ paused }) {
  return <div className={`tapes ${paused ? 'tapes-paused' : ''}`} aria-hidden="true">
    <svg className="tape-symbols" width="0" height="0" focusable="false"><defs>
      {tapeIcons.map((Icon, index) => <g key={index} id={`tape-icon-${index}`}><Icon size={16} strokeWidth={2.15} /></g>)}
    </defs></svg>
    {['left', 'right'].map(side => <div className={`tape tape-${side}`} key={side}>
      <div className="tape-track">{Array.from({ length: 6 }, (_, group) => <div className="tape-stream" key={group}>
        {tapeIcons.map((Icon, index) => <span key={index} className={`tape-cell tape-cell-${index % 5}`}>
          <svg viewBox="0 0 16 16" width="16" height="16" focusable="false"><use href={`#tape-icon-${index}`} /></svg>
        </span>)}
      </div>)}</div>
    </div>)}
  </div>;
}

export function SectionHeading({ label, title, text, id }) {
  return <div className="section-heading">
    {label && <p className="eyebrow"><span aria-hidden="true" />{label}</p>}
    <h2 id={id}>{title}</h2>
    {text && <p className="section-intro">{text}</p>}
  </div>;
}

export function PageHeading({ label, title, text, children }) {
  return <div className="page-heading">
    {label && <p className="eyebrow"><span aria-hidden="true" />{label}</p>}
    <h1>{title}</h1>
    {text && <p>{text}</p>}
    {children}
  </div>;
}

export function LinkButton({ to, children, className = '' }) {
  return <a className={`button ${className}`} href={href(to)}>{children}<ArrowLeft size={19} aria-hidden="true" /></a>;
}

export function PhoneLink({ className = '', label = 'اتصل بنا' }) {
  return <a className={className} href={`tel:${restaurant.phoneInternational}`}><Phone size={19} aria-hidden="true" /><span>{label}</span></a>;
}

export function SocialGrid() {
  return <div className="social-grid">
    <WhatsAppButton className="button-light">واتساب</WhatsAppButton>
    {socials.map(({ key, name }) => {
      const Icon = socialIcons[key];
      const url = restaurant.social[key];
      return url && <a className="button button-light" key={key} href={url} target="_blank" rel="noopener noreferrer"><Icon size={21} aria-hidden="true" />{name}</a>;
    })}
  </div>;
}

export function Footer({ paused, onPause }) {
  return <footer className="site-footer">
    <div className="footer-inner">
      <div className="footer-brand"><Logo /><div><strong><RestaurantName /></strong><p>المشويات والأطباق الشرقية في {restaurant.city}.</p></div></div>
      <div className="footer-links"><a href={href('/locations/')}><MapPin size={17} aria-hidden="true" />{restaurant.district}، {restaurant.city}</a><PhoneLink label={<bdi>{restaurant.phoneDisplay}</bdi>} /><WhatsAppButton className="footer-whatsapp">واتساب</WhatsAppButton></div>
    </div>
    <div className="footer-bottom"><span>جميع الحقوق محفوظة لدى <RestaurantName /></span><button type="button" className="motion-toggle" onClick={onPause} aria-pressed={paused}>{paused ? <Play size={14} /> : <Pause size={14} />}{paused ? 'تشغيل حركة الشريط' : 'إيقاف حركة الشريط'}</button></div>
  </footer>;
}

export function useTapeMotion() {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    try { setPaused(window.sessionStorage.getItem('alghadeer-motion') === 'paused'); } catch { /* Storage is optional. */ }
  }, []);
  function toggle() {
    setPaused(!paused);
    try { window.sessionStorage.setItem('alghadeer-motion', paused ? 'playing' : 'paused'); } catch { /* Storage is optional. */ }
  }
  return [paused, toggle];
}
