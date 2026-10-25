import { Link } from 'react-router-dom';

import { IconArrow } from '../components/icons.tsx';
import { OutboundLink, SellerBadge } from '../components/ui.tsx';
import { PRODUCTS, SELLERS } from '../shared/catalog.ts';

export default function Sellers() {
  return (
    <div className="container stack gap-24">
      <div className="page-head">
        <span className="eyebrow">Retailer links</span>
        <h1 className="h1">Participating sellers</h1>
        <p className="lead">Every piece links straight to the boutique that sells it, so you buy from the maker, with their delivery and returns.</p>
      </div>
      <div className="seller-grid">
        {SELLERS.map((s) => {
          const count = PRODUCTS.filter((p) => p.sellerId === s.id).length;
          return (
            <article key={s.id} className="panel stack gap-12 seller-tile">
              <SellerBadge sellerId={s.id} />
              <p className="small">{s.about}</p>
              <div className="seller-facts small">
                <span><b>Delivery</b> {s.delivery}</span>
                <span><b>Returns</b> {s.returns}</span>
              </div>
              <div className="row gap-8 wrap">
                <Link to={`/sellers/${s.id}`} className="btn small ghost">{count} pieces <IconArrow size={14} /></Link>
                <OutboundLink url={`${s.website}/?utm_source=empire-atelier&utm_medium=referral`} sellerName={s.name} className="btn small text">Visit store</OutboundLink>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
