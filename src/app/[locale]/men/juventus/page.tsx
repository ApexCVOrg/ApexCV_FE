import { ProductInfo } from "../layout";

const products: ProductInfo[] = [
  {
    name: "Juventus 23/24 Home Jersey",
    price: "2,500,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/1.jpg",
    desc: "Men Football - New",
  },
  {
    name: "Juventus 23/24 Away Jersey",
    price: "2,200,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/2.jpg",
    desc: "Men Football - New",
  },
  {
    name: "Juventus 23/24 Third Jersey",
    price: "2,200,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/3.jpg",
    desc: "Men Football - New",
  },
  {
    name: "Juventus 23/24 Shorts",
    price: "1,000,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/4.jpg",
    desc: "Men Football - New",
  },
];

export default function JuventusPage() {
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