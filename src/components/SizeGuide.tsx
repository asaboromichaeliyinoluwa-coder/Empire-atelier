import type { Category } from '../shared/catalog.ts';

type Chart = { title: string; head: string[]; rows: string[][]; tip: string };

const SHOES: Chart = {
  title: 'Shoe size guide',
  head: ['EU size', 'Foot length (cm)', 'UK'],
  rows: [['36', '23.0', '3.5'], ['37', '23.5', '4'], ['38', '24.0', '5'], ['39', '24.7', '6'], ['40', '25.4', '6.5'], ['41', '26.0', '7.5'], ['42', '26.7', '8'], ['43', '27.3', '9'], ['44', '28.0', '10']],
  tip: 'Stand on a sheet of paper, mark your longest toe and heel, and measure the gap. Between two sizes, choose the larger.',
};

const TOPS: Chart = {
  title: 'Size guide',
  head: ['Size', 'Chest (in)', 'Waist (in)'],
  rows: [['S', '35-37', '29-31'], ['M', '38-40', '32-34'], ['L', '41-43', '35-37'], ['XL', '44-46', '38-40'], ['XXL', '47-49', '41-43']],
  tip: 'Measure around the fullest part of your chest and your natural waist. Oversized pieces are cut roomy, so you can go down one size.',
};

const BOTTOMS: Chart = {
  title: 'Waist size guide',
  head: ['Size', 'Waist (in)', 'Waist (cm)'],
  rows: [['26', '26', '66'], ['28', '28', '71'], ['30', '30', '76'], ['32', '32', '81'], ['34', '34', '86'], ['36', '36', '91']],
  tip: 'Measure around your natural waist, where you would wear a belt. Between two sizes, choose the larger.',
};

const chartFor = (category: Category, sizes: string[]): Chart | null => {
  if (sizes.length === 1 && /one size/i.test(sizes[0])) return null;
  if (category === 'shoes') return SHOES;
  if (category === 'bottoms') return BOTTOMS;
  if (category === 'tops' || category === 'dresses' || category === 'sets' || category === 'outerwear') return TOPS;
  return null;
};

/** A collapsible size chart limited to the sizes this product comes in. */
export default function SizeGuide({ category, sizes }: { category: Category; sizes: string[] }) {
  const chart = chartFor(category, sizes);
  if (!chart) return null;
  const rows = chart.rows.filter((r) => sizes.includes(r[0]));
  if (!rows.length) return null;
  return (
    <details className="size-guide small">
      <summary>{chart.title}</summary>
      <table>
        <thead><tr>{chart.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r) => <tr key={r[0]}>{r.map((c, i) => (i === 0 ? <th key={i} scope="row">{c}</th> : <td key={i}>{c}</td>))}</tr>)}</tbody>
      </table>
      <p className="muted">{chart.tip} Sizes are a guide; message us on WhatsApp if you are unsure.</p>
    </details>
  );
}
