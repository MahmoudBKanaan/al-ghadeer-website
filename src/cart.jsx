import { useEffect, useRef, useState } from 'react';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { formatNumber, formatPrice, itemById, variantsFor } from './catalog.js';
import { IconWhatsApp } from './shared.jsx';
import { whatsappUrl } from './config.js';

const STORAGE_KEY = 'alghadeer-order-v1';
const MAX_QUANTITY = 99;

function cartLine(key, quantity) {
  const [id, position] = key.split(':');
  const item = itemById.get(id);
  const variant = item && variantsFor(item)[Number(position)];
  if (!variant || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) return null;
  return { key, item, variant, quantity };
}

function storedCart() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    return Object.fromEntries(Object.entries(saved || {}).filter(([key, quantity]) => cartLine(key, quantity)));
  } catch { return {}; }
}

export function useCart() {
  const [quantities, setQuantities] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [feedback, setFeedback] = useState('');
  useEffect(() => {
    setQuantities(storedCart());
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(quantities)); } catch { /* Orders work in memory. */ }
  }, [loaded, quantities]);

  const lines = Object.entries(quantities).map(([key, quantity]) => cartLine(key, quantity)).filter(Boolean);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const total = lines.reduce((sum, line) => sum + line.variant.price * line.quantity, 0);

  function change(key, changeBy) {
    setQuantities(current => {
      const quantity = Math.min(MAX_QUANTITY, (current[key] || 0) + changeBy);
      if (quantity > 0) return { ...current, [key]: quantity };
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function add(item, variant) {
    const key = `${item.id}:${variant.id}`;
    if ((quantities[key] || 0) >= MAX_QUANTITY) {
      setFeedback(`الحد الأقصى لهذا الخيار ${formatNumber(MAX_QUANTITY)}.`);
      return;
    }
    change(key, 1);
    setFeedback(`أضيف ${item.name} إلى الطلب.`);
  }

  return { lines, count, total, feedback, change, add, clear: () => setQuantities({}) };
}

function orderMessage({ lines, total }) {
  return [
    'السلام عليكم، أود طلب الأصناف التالية من مطعم الغدير:',
    '',
    ...lines.map(({ item, variant, quantity }) => {
      const size = item.prices.length > 1 ? ` (${variant.name})` : '';
      return `• ${item.name}${size} × ${formatNumber(quantity)} — ${formatPrice(variant.price * quantity)}`;
    }),
    '',
    `الإجمالي: ${formatPrice(total)}`,
    'يرجى تأكيد الطلب وطريقة الاستلام أو التوصيل.',
  ].join('\n');
}

export function CartBar({ cart }) {
  const [open, setOpen] = useState(false);
  const button = useRef(null);
  const dialog = useRef(null);
  useEffect(() => {
    if (open && !dialog.current.open) dialog.current.showModal();
    if (!open && dialog.current.open) dialog.current.close();
  }, [open]);
  function close() {
    setOpen(false);
    button.current?.focus();
  }

  return <>
    <div className="cart-bar" aria-label="ملخّص الطلب">
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{cart.feedback} {cart.count ? `عدد الأصناف ${formatNumber(cart.count)}` : ''}</span>
      <span className="cart-count" aria-label={`عدد العناصر: ${formatNumber(cart.count)}`}><ShoppingBag size={20} aria-hidden="true" />{formatNumber(cart.count)}</span>
      <button className="button button-red cart-open" type="button" ref={button} aria-haspopup="dialog" onClick={() => setOpen(true)}>مراجعة الطلب{cart.count > 0 && <small>{formatPrice(cart.total)}</small>}</button>
    </div>
    <dialog ref={dialog} className="cart-dialog" aria-labelledby="cart-title" onClose={close} onCancel={() => setOpen(false)}>
      <div className="cart-dialog-head"><h2 id="cart-title">مراجعة الطلب</h2><button className="icon-tile" type="button" onClick={close} aria-label="إغلاق الطلب"><X size={22} aria-hidden="true" /></button></div>
      {cart.lines.length ? <>
        <ul className="cart-lines">
          {cart.lines.map(({ key, item, variant, quantity }) => <li className="cart-line" key={key}>
            <div><strong>{item.name}</strong><p>{variant.name} · {formatPrice(variant.price)}</p></div>
            <div className="cart-quantity"><button type="button" aria-label={`خفض كمية ${item.name}، ${variant.name}`} onClick={() => cart.change(key, -1)}><Minus size={16} aria-hidden="true" /></button><span aria-label="الكمية">{formatNumber(quantity)}</span><button type="button" aria-label={`زيادة كمية ${item.name}، ${variant.name}`} disabled={quantity >= MAX_QUANTITY} onClick={() => cart.change(key, 1)}><Plus size={16} aria-hidden="true" /></button></div>
          </li>)}
        </ul>
        <div className="cart-total"><span>الإجمالي</span><strong>{formatPrice(cart.total)}</strong></div>
        <p className="fine-print">تفتح الخطوة التالية رسالة جاهزة في واتساب. أرسلها ليؤكد المطعم طلبك.</p>
        <div className="cart-actions"><a className="button button-red" href={whatsappUrl(orderMessage(cart))} target="_blank" rel="noopener noreferrer"><IconWhatsApp />إرسال الطلب عبر واتساب</a><button className="button button-light" type="button" onClick={cart.clear}><Trash2 size={18} aria-hidden="true" />إفراغ الطلب</button></div>
      </> : <div className="empty-state"><p>لم تضف أي صنف بعد.</p><button className="button button-light" type="button" onClick={close}>تابع تصفّح القائمة</button></div>}
    </dialog>
  </>;
}
