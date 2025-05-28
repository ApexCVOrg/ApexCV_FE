import { ProductInfo } from "../layout";

const products: ProductInfo[] = [
  {
    name: "Real Madrid 24/25 Home Jersey",
    price: "2,200,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/bba09c80cdf3416c9957d5ea0dee0738_9366/real-madrid-24-25-home-jersey.jpg",
    desc: "Men Football - New",
  },
  {
    name: "Real Madrid 24/25 Home Authentic Jersey",
    price: "3,000,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/78b62417f1e042aeb25e3353d278de3b_9366/real-madrid-24-25-home-authentic-jersey.jpg",
    desc: "Men Football - New",
  },
  {
    name: "Real Madrid 24/25 Third Jersey",
    price: "2,200,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/bbadcee6603b486b87cbbfb564b8b329_9366/real-madrid-24-25-third-jersey.jpg",
    desc: "Men Football - New",
  },
  {
    name: "Real Madrid 24/25 Home Jersey Kids",
    price: "1,500,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/1a69eff1774f4371b013639bcfac7b58_9366/real-madrid-24-25-home-jersey-kids.jpg",
    desc: "Men Football - New",
  },
];

export default function RealMadridPage() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {products.map((item, idx) => (
        <div key={idx} style={{ height: '100%' }}>
          <div style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)', borderRadius: 12, height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
            <img
              height={260}
              src={item.image}
              alt={item.name}
              style={{ objectFit: 'cover', background: '#f5f5f5', width: '100%', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
            />
            <div style={{ flexGrow: 1, padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{item.price}</div>
              <div style={{ fontWeight: 500 }}>{item.name}</div>
              <div style={{ fontSize: 14, color: '#888' }}>{item.desc}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 