import { lazy, Suspense } from 'react';
import { createBrowserRouter, createMemoryRouter, RouterProvider } from 'react-router-dom';

import { Layout } from './components/Layout.tsx';
import { IS_PREVIEW } from './lib/platform.ts';
import Home from './pages/Home.tsx';

const Admin = lazy(() => import('./pages/Admin.tsx'));
const Shop = lazy(() => import('./pages/Shop.tsx'));
const ProductPage = lazy(() => import('./pages/Product.tsx'));
const TryOn = lazy(() => import('./pages/TryOn.tsx'));
const Outfits = lazy(() => import('./pages/Outfits.tsx'));
const LookPage = lazy(() => import('./pages/Look.tsx'));
const Style = lazy(() => import('./pages/Style.tsx'));
const Saved = lazy(() => import('./pages/Saved.tsx'));
const Sellers = lazy(() => import('./pages/Sellers.tsx'));
const SellerPage = lazy(() => import('./pages/Seller.tsx'));
const Planner = lazy(() => import('./pages/Planner.tsx'));
const Stylist = lazy(() => import('./pages/Stylist.tsx'));
const Changer = lazy(() => import('./pages/Changer.tsx'));
const Report = lazy(() => import('./pages/Report.tsx'));
const Bag = lazy(() => import('./pages/Bag.tsx'));
const Account = lazy(() => import('./pages/Account.tsx'));

const wrap = (el: React.ReactNode) => (
  <Suspense fallback={<div className="loading"><div className="spinner" /></div>}>{el}</Suspense>
);

// The hosted preview keeps navigation in memory: its frame owns the address bar.
const router = (IS_PREVIEW ? createMemoryRouter : createBrowserRouter)([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/shop', element: wrap(<Shop />) },
      { path: '/product/:id', element: wrap(<ProductPage />) },
      { path: '/try-on', element: wrap(<TryOn />) },
      { path: '/outfits', element: wrap(<Outfits />) },
      { path: '/look', element: wrap(<LookPage />) },
      { path: '/style', element: wrap(<Style />) },
      { path: '/saved', element: wrap(<Saved />) },
      { path: '/sellers', element: wrap(<Sellers />) },
      { path: '/sellers/:id', element: wrap(<SellerPage />) },
      { path: '/planner', element: wrap(<Planner />) },
      { path: '/stylist', element: wrap(<Stylist />) },
      { path: '/changer', element: wrap(<Changer />) },
      { path: '/report', element: wrap(<Report />) },
      { path: '/bag', element: wrap(<Bag />) },
      { path: '/admin', element: wrap(<Admin />) },
      { path: '/account', element: wrap(<Account />) },
      { path: '*', element: <Home /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
