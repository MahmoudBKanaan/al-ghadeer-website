import { useState } from 'react';
import {
  ArrowLeft, Beef, ChevronLeft, Coffee, CookingPot, CupSoda, Fish, Flame, Info, Leaf, Plus, Sandwich,
  Search, Soup, UtensilsCrossed, Wheat, X,
} from 'lucide-react';
import { categories, formatNumber, formatPrice, itemPath, items, menuImage, normalizedSearch, variantsFor } from './catalog.js';
import { href, restaurant } from './config.js';
import { LinkButton, PageHeading, SectionHeading, WhatsAppButton } from './shared.jsx';

const categoryIcons = { grills: Flame, pottery: CookingPot, fish: Fish, rice: Wheat, salads: Leaf,
  meals: UtensilsCrossed, breakfast: Soup, sandwiches: Sandwich, stews: Beef, 'hot-drinks': Coffee, 'cold-drinks': CupSoda };

export function MenuCard({ item, cart }) {
  const variants = variantsFor(item);
  const path = href(itemPath(item));
  const prices = item.prices;
  return <article className="menu-card">
    <a className="menu-photo" href={path} tabIndex={-1} aria-hidden="true"><img src={menuImage(item)} alt="" width="780" height="520" loading="lazy" decoding="async" /></a>
    <div className="menu-card-body">
      <div className="menu-card-copy">
        <h3><a href={path}>{item.name}</a></h3>
        <p className="menu-card-price">{prices.length ? `${prices.length > 1 ? 'من ' : ''}${formatPrice(prices[0])}` : 'السعر عند الاستفسار'}</p>
      </div>
      {cart && variants.length === 1
        ? <button className="quick-add" type="button" onClick={() => cart.add(item, variants[0])} aria-label={`أضف ${item.name}`}><Plus size={21} aria-hidden="true" /></button>
        : <a className="quick-add" href={variants.length > 1 && cart ? `${path}#sizes` : path} aria-label={variants.length > 1 && cart ? `اختر حجم ${item.name}` : `تفاصيل ${item.name}`}>
          {variants.length > 1 && cart ? <Plus size={21} aria-hidden="true" /> : <ArrowLeft size={18} aria-hidden="true" />}
        </a>}
    </div>
  </article>;
}

export function MenuPage({ cart }) {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const needle = normalizedSearch(query);
  const visible = categories.filter(category => filter === 'all' || category.id === filter).map(category => ({
    ...category,
    items: category.items.filter(item => !needle || normalizedSearch(`${item.name} ${category.name}`).includes(needle)),
  })).filter(category => category.items.length > 0);
  const count = visible.reduce((sum, category) => sum + category.items.length, 0);

  return <>
    <PageHeading label={restaurant.name} title="قائمة الطعام" text="استعرض المشويات والطواجن والأطباق الشرقية. افتح أي صنف للاطلاع على وصفه وأسعار أحجامه." />
    <div className="menu-tools">
      <div className="menu-search"><Search size={22} aria-hidden="true" /><label className="sr-only" htmlFor="menu-search">ابحث في قائمة الطعام</label><input id="menu-search" type="search" placeholder="ابحث عن صنف" autoComplete="off" value={query} onChange={event => setQuery(event.target.value)} />{query && <button type="button" onClick={() => setQuery('')} aria-label="مسح البحث"><X size={19} aria-hidden="true" /></button>}</div>
      <div className="menu-filters" role="group" aria-label="أقسام القائمة">
        {[{ id: 'all', name: 'الكل' }, ...categories].map(category => {
          const Icon = categoryIcons[category.id] || UtensilsCrossed;
          return <button className="filter-chip" type="button" key={category.id} aria-pressed={filter === category.id} onClick={() => setFilter(category.id)}><Icon size={18} aria-hidden="true" />{category.name}</button>;
        })}
      </div>
    </div>
    <p className="menu-disclaimer"><Info size={17} aria-hidden="true" /><span>الصور توضيحية وقد يختلف التقديم. الأسعار بالريال السعودي.</span></p>
    <p className="sr-only" role="status">{formatNumber(count)} صنف</p>
    {visible.length ? visible.map(category => {
      const Icon = categoryIcons[category.id] || UtensilsCrossed;
      return <section className="menu-section" id={category.id} key={category.id} aria-labelledby={`heading-${category.id}`}>
        <div className="menu-section-title"><span className="icon-tile"><Icon size={22} aria-hidden="true" /></span><h2 id={`heading-${category.id}`}>{category.name}</h2><small>{formatNumber(category.items.length)} صنف</small></div>
        <div className="menu-grid">{category.items.map(item => <MenuCard item={item} key={item.id} cart={cart} />)}</div>
      </section>;
    }) : <div className="empty-state"><h2>لم نجد أصنافًا تطابق البحث</h2><p>جرّب اسمًا آخر أو اعرض جميع الأقسام.</p><button type="button" className="button button-light" onClick={() => { setQuery(''); setFilter('all'); }}>اعرض القائمة كاملة</button></div>}
  </>;
}

export function ItemPage({ item, cart }) {
  const variants = variantsFor(item);
  const related = items.filter(other => other.categoryId === item.categoryId && other.id !== item.id).slice(0, 4);
  const inquiry = `السلام عليكم، أود الاستفسار عن ${item.name} من قائمة مطعم الغدير.`;
  return <>
    <nav className="breadcrumb" aria-label="مسار التنقل"><a href={href('/')}>الرئيسية</a><ChevronLeft size={15} aria-hidden="true" /><a href={href('/menu/')}>قائمة الطعام</a><ChevronLeft size={15} aria-hidden="true" /><a href={`${href('/menu/')}#${item.categoryId}`}>{item.categoryName}</a></nav>
    <article className="item-layout">
      <figure className="item-visual"><img src={menuImage(item)} alt={`صورة توضيحية لصنف ${item.name}`} width="780" height="520" fetchPriority="high" /><figcaption>صورة توضيحية وقد يختلف التقديم</figcaption></figure>
      <div className="item-content">
        <p className="eyebrow"><span aria-hidden="true" />{item.categoryName}</p>
        <h1>{item.name}</h1>
        <p className="item-description">{item.description}</p>
        <div className="item-prices" id="sizes">
          <h2>الحجم والسعر</h2>
          {variants.length ? <ul>{variants.map(variant => <li className="item-price-row" key={variant.id}><span>{variant.name}</span><strong>{formatPrice(variant.price)}</strong><button type="button" className="quick-add" onClick={() => cart.add(item, variant)} aria-label={`أضف ${item.name}، ${variant.name}`}><Plus size={20} aria-hidden="true" /></button></li>)}</ul> : <p>السعر عند الاستفسار.</p>}
        </div>
        <p className="detail-note"><Info size={18} aria-hidden="true" /><span>تواصل معنا للتحقق من المكوّنات ومسببات الحساسية قبل الطلب.</span></p>
        <div className="actions"><WhatsAppButton className={variants.length ? 'button-light' : 'button-red'} message={inquiry}>استفسر عبر واتساب</WhatsAppButton><LinkButton to="/menu/" className="button-light">العودة للقائمة</LinkButton></div>
      </div>
    </article>
    {related.length > 0 && <section className="related-items section-block" aria-labelledby="related-title"><SectionHeading id="related-title" label={item.categoryName} title="أصناف من القسم نفسه" /><div className="menu-grid">{related.map(entry => <MenuCard item={entry} key={entry.id} />)}</div></section>}
  </>;
}
