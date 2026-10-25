import { Link, useParams } from 'react-router-dom';

import { Empty, OutboundLink, ProductCard } from '../components/ui.tsx';
import { PRODUCTS, sellerById } from '../shared/catalog.ts';

export default function SellerPage() {
  const { id = '' } = useParams();
  const s = sellerById(id);
  if (!s) return <div className="container"><Empty title="Seller not found"><Link to="/sellers" className="btn ghost small">All sellers</Link></Empty></div>;
  const items = PRODUCTS.filter((p) => p.sellerId === s.id);
  return (
    <div className="container stack gap-24">
      <section className="panel seller-hero stack gap-12">
        <span className="eyebrow">{s.city} · since {s.since}</span>
        <h1 className="h1">{s.name}</h1>
        <p className="lead">{s.about}</p>
        <div className="seller-facts small">
          <span><b>Rating</b> {s.rating} from {s.reviews.toLocaleString()} reviews</span>
          <span><b>Delivery</b> {s.delivery}</span>
          <span><b>Returns</b> {s.returns}</span>
        </div>
        <div>
          <OutboundLink url={`${s.website}/?utm_source=empire-atelier&utm_medium=referral`} sellerName={s.name}>Visit {s.name}</OutboundLink>
        </div>
      </section>
      <div className="product-grid">{items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div>
    </div>
  );
}
