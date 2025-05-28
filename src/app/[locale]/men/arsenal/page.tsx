import { ProductInfo } from "../layout";

const products: ProductInfo[] = [
  {
    name: "Arsenal 25/26 Home Authentic Jersey",
    price: "3,000,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/b4e7e2f40aa64a1f92a8132a6c81b574_9366/arsenal-25-26-home-authentic-jersey.jpg",
    desc: "Men Football - New",
  },
  {
    name: "Arsenal 25/26 Home Jersey",
    price: "2,200,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/e86b3148bca44d478e0bc4bd6fea586f_9366/arsenal-25-26-home-jersey.jpg",
    desc: "Men Football - New",
  },
  {
    name: "Arsenal 25/26 Home Jersey Kids",
    price: "1,500,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/eb1ae7bf50814ba7a52d74c4ce4c47f3_9366/arsenal-25-26-home-jersey-kids.jpg",
    desc: "Kids Football - New",
  },
  {
    name: "Arsenal 25/26 Home Shorts",
    price: "1,100,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/2c14518390e74640881e110fdf13ce5e_9366/arsenal-25-26-home-shorts.jpg",
    desc: "Men Football - New",
  },
];

export default function ArsenalPage() {
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