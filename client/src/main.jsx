import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  ShoppingBag,
  Check,
  Eye,
  EyeOff,
  Heart,
  Instagram,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  X,
} from "lucide-react";
import "./styles.css";
import "./admin.css";
import "./brand.css";
import "./recovery.css";
import "./password.css";
import "./admin-redesign.css";
import "./catalog-manager.css";

const API = "/api";
const fallback = [];
const money = (n) =>
  new Intl.NumberFormat("fr-TN", {
    style: "currency",
    currency: "TND",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(n || 0);
const colourName = (colour) =>
  ({
    "#111827": "Noir",
    "#FFFFFF": "Blanc",
    "#D9C4A7": "Beige",
    "#A26349": "Terracotta",
    "#A9B7A1": "Vert sauge",
    "#506C7C": "Bleu ardoise",
    "#DAA1A8": "Rose poudré",
    "#D9B649": "Ocre",
  })[colour?.toUpperCase()] || "Couleur sélectionnée";
function App() {
  const [products, setProducts] = useState(fallback),
    [categories, setCategories] = useState([]),
    [cart, setCart] = useState(
      JSON.parse(localStorage.getItem("zendella-cart") || "[]"),
    ),
    [drawer, setDrawer] = useState(false),
    [view, setView] = useState(
      location.pathname === "/admin" || location.hash === "#admin"
        ? "admin"
        : "home",
    ),
    [selected, setSelected] = useState(null),
    [query, setQuery] = useState(""),
    [categoryFilter, setCategoryFilter] = useState(""),
    [priceMin, setPriceMin] = useState(""),
    [priceMax, setPriceMax] = useState(""),
    [sortBy, setSortBy] = useState("latest"),
    [order, setOrder] = useState(null),
    [menu, setMenu] = useState(false),
    [cartNotice, setCartNotice] = useState("");
  useEffect(() => {
    Promise.all([
      fetch(`${API}/products?limit=24`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${API}/categories`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([p, c]) => {
        if (p?.products?.length) setProducts(p.products);
        if (c) setCategories(c);
      })
      .catch(() => {});
  }, []);
  useEffect(
    () => localStorage.setItem("zendella-cart", JSON.stringify(cart)),
    [cart],
  );
  const add = (p, colour = p.colors?.[0] || "") => {
    const quantityInCart = cart
      .filter((x) => x._id === p._id)
      .reduce((sum, x) => sum + x.qty, 0);
    if (quantityInCart >= p.stock) {
      setCartNotice(
        p.stock > 0
          ? `Il ne reste que ${p.stock} pièce${p.stock > 1 ? "s" : ""} disponible${p.stock > 1 ? "s" : ""} pour ${p.name}.`
          : `${p.name} est actuellement en rupture de stock.`,
      );
      setDrawer(true);
      return;
    }
    setCart((a) => {
      let found = a.find((x) => x._id === p._id && x.colour === colour);
      return found
        ? a.map((x) =>
            x._id === p._id && x.colour === colour ? { ...x, qty: x.qty + 1 } : x,
          )
        : [...a, { ...p, colour, qty: 1 }];
    });
    setCartNotice("");
    setDrawer(true);
  };
  const change = (item, n) => {
    if (n > item.stock) {
      setCartNotice(
        `Il ne reste que ${item.stock} pièce${item.stock > 1 ? "s" : ""} disponible${item.stock > 1 ? "s" : ""} pour ${item.name}.`,
      );
      return;
    }
    setCartNotice("");
    setCart((a) =>
      a.flatMap((x) =>
        x._id === item._id && x.colour === item.colour
          ? n > 0
            ? [{ ...x, qty: n }]
            : []
          : [x],
      ),
    );
  };
  const confirmStock = (items) => {
    setProducts((current) =>
      current.map((product) => {
        const ordered = items
          .filter((item) => item.product === product._id)
          .reduce((sum, item) => sum + item.quantity, 0);
        return ordered
          ? { ...product, stock: Math.max(0, product.stock - ordered) }
          : product;
      }),
    );
  };
  const total = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const filtered = useMemo(() => {
    const matching = products.filter((p) => {
      const matchesSearch = `${p.name} ${p.category?.name || ""}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesCategory = !categoryFilter || p.category?._id === categoryFilter;
      const matchesMinimum = !priceMin || p.price >= Number(priceMin);
      const matchesMaximum = !priceMax || p.price <= Number(priceMax);
      return matchesSearch && matchesCategory && matchesMinimum && matchesMaximum;
    });
    return matching.sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [products, query, categoryFilter, priceMin, priceMax, sortBy]);
  const go = (v) => {
    setView(v);
    setSelected(null);
    window.history.pushState({}, "", v === "admin" ? "/admin" : "/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <>
      <div className="announce">
        <Sparkles size={15} /> LIVRAISON OFFERTE DÈS 150 TND <span>•</span>{" "}
        Paiement à la livraison
      </div>
      <header>
        <button
          className="icon mobile"
          onClick={() => setMenu(!menu)}
          aria-label="Menu"
        >
          <Menu />
        </button>
        <button
          className="site-logo"
          onClick={() => go("home")}
          aria-label="Zendala Dream"
        >
          <img src="/zendala-dream-logo.png" alt="Zendala Dream" />
        </button>
        <nav className={menu ? "open" : ""}>
          <button onClick={() => go("shop")}>La boutique</button>
          <button onClick={() => go("showroom")}>Showroom</button>
          <button onClick={() => go("about")}>Notre histoire</button>
          <button className="admin-link" onClick={() => go("admin")}>
            Espace admin
          </button>
        </nav>
        <div className="header-tools">
          <button className="icon search">
            <Search size={20} />
          </button>
          <button className="bag" onClick={() => setDrawer(true)}>
            <ShoppingBag size={20} />
            <i>{cart.reduce((s, x) => s + x.qty, 0)}</i>
          </button>
        </div>
      </header>
      {view === "home" && (
        <Home
          products={products}
          categories={categories}
          add={add}
          go={go}
          select={setSelected}
        />
      )}{" "}
      {view === "shop" && (
        <Shop
          products={filtered}
          categories={categories}
          query={query}
          setQuery={setQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          priceMin={priceMin}
          setPriceMin={setPriceMin}
          priceMax={priceMax}
          setPriceMax={setPriceMax}
          sortBy={sortBy}
          setSortBy={setSortBy}
          add={add}
          select={setSelected}
        />
      )}{" "}
      {view === "showroom" && <Showroom />} {view === "about" && <About />}{" "}
      {view === "admin" && <Admin products={products} />}{" "}
      {view === "checkout" && (
        <Checkout
          cart={cart}
          total={total}
          setOrder={setOrder}
          go={go}
          clear={() => setCart([])}
          confirmStock={confirmStock}
        />
      )}{" "}
      {selected && (
        <ProductModal p={selected} close={() => setSelected(null)} add={add} />
      )}{" "}
      {order && <Success order={order} go={go} dismiss={() => setOrder(null)} />}{" "}
      <Cart
        drawer={drawer}
        close={() => setDrawer(false)}
        cart={cart}
        total={total}
        change={change}
        notice={cartNotice}
        go={go}
      />
      {view !== "admin" && <Footer />}
    </>
  );
}
function Card({ p, add, select }) {
  return (
    <article className="card">
      <button className="product-img" onClick={() => select(p)}>
        <img src={p.images?.[0]?.url} alt={p.name} />
        {p.compareAtPrice && (
          <em>-{Math.round((1 - p.price / p.compareAtPrice) * 100)}%</em>
        )}
        <span className="heart">
          <Heart size={19} />
        </span>
      </button>
      <div className="card-info">
        <p>{p.category?.name || "Maison"}</p>
        <h3>{p.name}</h3>
        <small className={p.stock > 0 ? "stock-count" : "out-of-stock"}>
          {p.stock > 0
            ? `${p.stock} pièce${p.stock > 1 ? "s" : ""} en stock`
            : "Rupture de stock"}
        </small>
        <div>
          <b>{money(p.price)}</b>
          {p.compareAtPrice && <del>{money(p.compareAtPrice)}</del>}
          <button
            onClick={() => add(p)}
            aria-label="Ajouter"
            disabled={!p.stock}
            title={p.stock ? "Ajouter au panier" : "Produit en rupture de stock"}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
function Home({ products, categories, add, go, select }) {
  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">NOUVELLE COLLECTION · 2026</p>
          <h1>
            Donnez une âme
            <br />à votre intérieur.
          </h1>
          <p className="lead">
            Des objets singuliers pour transformer les instants ordinaires en
            rituels précieux.
          </p>
          <button className="primary" onClick={() => go("shop")}>
            Découvrir la collection <ArrowRight size={18} />
          </button>
        </div>
        <div className="hero-pic">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1300&q=85"
            alt="Intérieur Zendala Dream"
          />
          <span>
            CURATED
            <br />
            WITH LOVE
          </span>
        </div>
      </section>
      <section className="perks">
        <div>
          <Truck />
          <b>Livraison sous 8 jours</b>
          <span>Partout en Tunisie</span>
        </div>
        <div>
          <PackageCheck />
          <b>Paiement à la livraison</b>
          <span>Commandez sereinement</span>
        </div>
        <div>
          <ShieldCheck />
          <b>Qualité garantie</b>
          <span>Sélection durable</span>
        </div>
      </section>
      <section className="section">
        <div className="section-title">
          <div>
            <p className="eyebrow">CHOISIS POUR VOUS</p>
            <h2>Les essentiels Zendala Dream</h2>
          </div>
          <button className="text-btn" onClick={() => go("shop")}>
            Voir toute la boutique <ArrowRight size={17} />
          </button>
        </div>
        {products.length ? (
          <div className="grid">
            {products.slice(0, 4).map((p) => (
              <Card key={p._id} p={p} add={add} select={select} />
            ))}
          </div>
        ) : (
          <div className="catalog-empty">
            <PackageCheck size={34} />
            <h3>La collection arrive bientôt.</h3>
            <p>Nos produits seront ajoutés par notre équipe.</p>
          </div>
        )}
      </section>
      {categories.length > 0 && (
        <section className="category-strip">
          <div>
            <p className="eyebrow">PARCOURIR PAR AMBIANCE</p>
            <h2>Un espace qui vous ressemble.</h2>
          </div>
          <div className="cat-list">
            {categories.slice(0, 4).map((c, i) => (
              <button key={c._id} onClick={() => go("shop")}>
                <span>0{i + 1}</span>
                {c.name}
                <ArrowRight size={18} />
              </button>
            ))}
          </div>
        </section>
      )}
      <section className="editorial">
        <img
          src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85"
          alt="Sélection maison"
        />
        <div>
          <p className="eyebrow">L'ART DU DÉTAIL</p>
          <h2>Des pièces pensées pour durer.</h2>
          <p>
            Chaque objet est choisi pour sa matière, son histoire et la douceur
            qu'il apporte à votre quotidien.
          </p>
          <button className="line-btn" onClick={() => go("about")}>
            Notre démarche <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </main>
  );
}
function Shop({
  products,
  categories,
  query,
  setQuery,
  categoryFilter,
  setCategoryFilter,
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  sortBy,
  setSortBy,
  add,
  select,
}) {
  const resetFilters = () => {
    setQuery("");
    setCategoryFilter("");
    setPriceMin("");
    setPriceMax("");
    setSortBy("latest");
  };
  const filtersActive = query || categoryFilter || priceMin || priceMax || sortBy !== "latest";
  return (
    <main className="shop">
      <div className="page-head">
        <p className="eyebrow">LA BOUTIQUE</p>
        <h1>Tout pour la maison</h1>
        <p>Une sélection d'objets fonctionnels, beaux et durables.</p>
      </div>
      <section className="shop-filters" aria-label="Filtrer les produits">
        <div className="filter-search">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un produit"
          />
        </div>
        <div className="filter-controls">
          <label>
            Catégorie
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </label>
          <label>
            Prix min. (TND)
            <input type="number" min="0" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="0" />
          </label>
          <label>
            Prix max. (TND)
            <input type="number" min="0" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="Sans limite" />
          </label>
          <label>
            Trier par
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="latest">Plus récents</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </label>
        </div>
        <div className="filter-bottom">
          <p className="count"><b>{products.length}</b> produit{products.length !== 1 ? "s" : ""} trouvé{products.length !== 1 ? "s" : ""}</p>
          {filtersActive && <button className="reset-filters" onClick={resetFilters}>Réinitialiser les filtres</button>}
        </div>
      </section>
      {products.length ? (
        <div className="grid">
          {products.map((p) => (
            <Card key={p._id} p={p} add={add} select={select} />
          ))}
        </div>
      ) : (
        <div className="catalog-empty">
          <PackageCheck size={34} />
          <h3>Aucun produit pour le moment.</h3>
          <p>Revenez bientôt découvrir la collection Zendala Dream.</p>
        </div>
      )}
    </main>
  );
}
function ProductModal({ p, close, add }) {
  let [colour, setColour] = useState(p.colors?.[0]);
  return (
    <div className="overlay">
      <div className="modal">
        <button className="close" onClick={close}>
          <X />
        </button>
        <img src={p.images?.[0]?.url} alt={p.name} />
        <div>
          <p className="eyebrow">{p.category?.name || "MAISON"}</p>
          <h2>{p.name}</h2>
          <div className="rating">
            <Star fill="currentColor" size={16} />
            <Star fill="currentColor" size={16} />
            <Star fill="currentColor" size={16} />
            <Star fill="currentColor" size={16} />
            <Star fill="currentColor" size={16} />
            <span>4.9 · 18 avis</span>
          </div>
          <h3>{money(p.price)}</h3>
          <p className="description">
            {p.description ||
              "Une pièce soigneusement sélectionnée pour apporter élégance et caractère à votre intérieur."}
          </p>
          <p className="choice">
            Choisissez votre couleur
            <span
              className="selected-colour"
              style={{ backgroundColor: colour }}
              aria-label="Couleur sélectionnée"
            />
          </p>
          <div className="colors" role="radiogroup" aria-label="Couleurs disponibles">
            {(p.colors || ["#D9C4A7"]).map((c, index) => (
              <button
                type="button"
                className={"color-swatch " + (c === colour ? "active" : "")}
                onClick={() => setColour(c)}
                key={c}
                style={{ backgroundColor: c }}
                aria-label={`Choisir la couleur ${index + 1}`}
                aria-pressed={c === colour}
              >
                {c === colour && <Check size={16} strokeWidth={3} aria-hidden="true" />}
              </button>
            ))}
          </div>
          <p className="stock">
            <Check size={16} />
            {p.stock > 0
              ? `${p.stock} pièce${p.stock > 1 ? "s" : ""} disponible${p.stock > 1 ? "s" : ""} — expédié sous 24 à 48h`
              : "Rupture de stock"}
          </p>
          <button
            className="primary full"
            disabled={!p.stock}
            onClick={() => {
              add(p, colour);
              close();
            }}
          >
            Ajouter au panier <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
function Cart({ drawer, close, cart, total, change, go, notice }) {
  return (
    <>
      <div className={"shade " + (drawer ? "show" : "")} onClick={close} />
      <aside className={"cart " + (drawer ? "show" : "")}>
        <div className="cart-head">
          <h2>
            Votre panier <small>({cart.reduce((s, x) => s + x.qty, 0)})</small>
          </h2>
          <button className="icon" onClick={close}>
            <X />
          </button>
        </div>
        {!cart.length ? (
          <div className="empty">
            <ShoppingBag size={38} />
            <h3>Votre panier est vide</h3>
            <p>Découvrez nos objets choisis avec soin.</p>
            <button className="primary" onClick={close}>
              Continuer mes achats
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((x) => (
                <div className="cart-item" key={x._id}>
                  <img src={x.images?.[0]?.url} alt="" />
                  <div>
                    <h3>{x.name}</h3>
                    {x.colour && (
                      <span className="cart-colour">
                        <i style={{ backgroundColor: x.colour }} />
                        {colourName(x.colour)}
                      </span>
                    )}
                    <p>{money(x.price)}</p>
                    <div className="stepper">
                      <button onClick={() => change(x, x.qty - 1)}>
                        <Minus size={14} />
                      </button>
                      <span>{x.qty}</span>
                      <button
                        onClick={() => change(x, x.qty + 1)}
                        disabled={x.qty >= x.stock}
                        aria-label={`Ajouter une pièce de ${x.name}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <b>{money(x.price * x.qty)}</b>
                </div>
              ))}
            </div>
            {notice && <p className="cart-notice" role="alert">{notice}</p>}
            <div className="cart-foot">
              <p>
                <span>Sous-total</span>
                <b>{money(total)}</b>
              </p>
              <small>Livraison offerte dès 75 000 FCFA</small>
              <button
                className="primary full"
                onClick={() => {
                  close();
                  go("checkout");
                }}
              >
                Passer la commande <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
function Checkout({ cart, total, setOrder, go, clear, confirmStock }) {
  let [sending, setSending] = useState(false),
    [error, setError] = useState("");
  if (!cart.length)
    return (
      <main className="checkout">
        <div className="empty">
          <h2>Votre panier est vide.</h2>
          <button className="primary" onClick={() => go("shop")}>
            Voir la boutique
          </button>
        </div>
      </main>
    );
  async function submit(e) {
    e.preventDefault();
    setSending(true);
    setError("");
    let data = Object.fromEntries(new FormData(e.currentTarget));
    let payload = {
      ...data,
      items: cart.map((x) => ({
        product: x._id,
        quantity: x.qty,
        color: x.colour,
        price: x.price,
        name: x.name,
        image: x.images?.[0]?.url,
      })),
      total,
    };
    try {
      let r = await fetch(`${API}/orders/guest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      let o = await r.json();
      if (!r.ok) throw new Error(o.message || "Impossible de créer la commande.");
      setOrder(
        o.order || { orderNumber: "ZEN-" + Date.now().toString().slice(-6) },
      );
      confirmStock(payload.items);
      clear();
    } catch (error) {
      setError(error.message || "Impossible de créer la commande. Réessayez.");
    }
    setSending(false);
  }
  return (
    <main className="checkout">
      <div className="checkout-title">
        <button className="brand" onClick={() => go("home")}>
          zen<span>della</span>
        </button>
        <p>Finaliser votre commande</p>
      </div>
      <form onSubmit={submit}>
        <section>
          <h2>Vos informations</h2>
          <div className="two">
            <label>
              Prénom
              <input required name="firstName" />
            </label>
            <label>
              Nom
              <input required name="lastName" />
            </label>
          </div>
          <label>
            Téléphone
            <input required name="phone" placeholder="080…" />
          </label>
          <label>
            Email <small>(optionnel)</small>
            <input type="email" name="email" />
          </label>
          <h2>Adresse de livraison</h2>
          <label>
            Adresse complète
            <input
              required
              name="address"
              placeholder="Rue, quartier, repère…"
            />
          </label>
          <div className="two">
            <label>
              Ville
              <input required name="city" />
            </label>
            <label>
              État
              <input required name="state" />
            </label>
          </div>
          <label>
            Note pour la livraison <small>(optionnel)</small>
            <textarea name="note" rows="3" />
          </label>
        </section>
        <aside className="summary">
          <h2>Votre commande</h2>
          {cart.map((x) => (
            <p key={`${x._id}-${x.colour || "default"}`}>
              <span>
                {x.name} × {x.qty}
                {x.colour && (
                  <small className="summary-colour">
                    <i style={{ backgroundColor: x.colour }} />
                    {colourName(x.colour)}
                  </small>
                )}
              </span>
              <b>{money(x.price * x.qty)}</b>
            </p>
          ))}
          <hr />
          <p>
            <span>Sous-total</span>
            <b>{money(total)}</b>
          </p>
          <p>
            <span>Livraison</span>
            <b>{total >= 75000 ? "Offerte" : "Calculée à la confirmation"}</b>
          </p>
          <h3>
            <span>Total</span>
            <b>{money(total)}</b>
          </h3>
          <div className="cod">
            <PackageCheck />
            <span>
              <b>Paiement à la livraison</b>
              <br />
              Vous réglez votre commande à sa réception.
            </span>
          </div>
          {error && <p className="checkout-error" role="alert">{error}</p>}
          <button className="primary full" disabled={sending}>
            {sending ? "Enregistrement…" : "Confirmer la commande"}
          </button>
          <small>Livraison estimée : 8 jours ouvrés.</small>
        </aside>
      </form>
    </main>
  );
}
function Success({ order, go, dismiss }) {
  return (
    <div className="overlay">
      <div className="success">
        <div>
          <Check />
        </div>
        <p className="eyebrow">COMMANDE CONFIRMÉE</p>
        <h1>Merci pour votre confiance.</h1>
        <p>
          Votre commande <b>#{order.orderNumber}</b> a bien été reçue. Notre
          équipe vous contactera avant l'expédition.
        </p>
        <p className="delivery">
          <Truck /> Livraison estimée sous 8 jours ouvrés
        </p>
        <button
          className="primary"
          onClick={() => {
            dismiss();
            go("shop");
          }}
        >
          Retour à la boutique
        </button>
      </div>
    </div>
  );
}
function AdminTools({ token }) {
  const [categories, setCategories] = useState([]),
    [notice, setNotice] = useState(""),
    [colors, setColors] = useState(["#E7D8C5"]),
    [promotion, setPromotion] = useState(false),
    [price, setPrice] = useState(""),
    [comparePrice, setComparePrice] = useState("");
  const headers = { Authorization: `Bearer ${token}` };
  const palette = ["#111827", "#FFFFFF", "#D9C4A7", "#A26349", "#A9B7A1", "#506C7C", "#DAA1A8", "#D9B649"];
  const reduction = price && comparePrice && +comparePrice > +price ? Math.round((1 - +price / +comparePrice) * 100) : 0;
  useEffect(() => { fetch(`${API}/categories`).then((r) => r.json()).then(setCategories).catch(() => {}); }, []);
  const toggleColor = (color) => setColors((list) => list.includes(color) ? list.filter((value) => value !== color) : [...list, color]);
  async function addCategory(e) {
    e.preventDefault(); setNotice("");
    let name = new FormData(e.currentTarget).get("name");
    let r = await fetch(`${API}/admin/categories`, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    if (r.ok) { let c = await r.json(); setCategories((items) => [...items, c]); e.currentTarget.reset(); setNotice("Catégorie créée avec succès."); }
    else { let data = await r.json().catch(() => ({})); setNotice(data.message || "Impossible de créer cette catégorie."); }
  }
  async function addProduct(e) {
    e.preventDefault(); setNotice("");
    let form = new FormData(e.currentTarget);
    form.set("colors", JSON.stringify(colors));
    form.set("featured", form.get("featured") ? "true" : "false");
    if (!promotion) form.delete("compareAtPrice");
    let r = await fetch(`${API}/admin/products`, { method: "POST", headers, body: form });
    if (r.ok) { e.currentTarget.reset(); setColors(["#E7D8C5"]); setPromotion(false); setPrice(""); setComparePrice(""); setNotice("Produit publié avec succès. Il est visible dans la boutique."); }
    else { let d = await r.json().catch(() => ({})); setNotice(d.message || "Impossible d’ajouter le produit."); }
  }
  return <section className="admin-products refined-admin">
    <div className="admin-section-heading"><div><p className="eyebrow">CATALOGUE ZENDALA</p><h2>Créer un nouveau produit</h2><p>Ajoutez une pièce, définissez le stock et publiez-la instantanément.</p></div><span className="admin-badge">Espace marchand</span></div>
    <div className="admin-forms refined-forms">
      <form className="category-card" onSubmit={addCategory}><p className="form-kicker">ORGANISATION</p><h3>Nouvelle catégorie</h3><p>Créez vos univers de vente avant d’ajouter les produits.</p><input name="name" required placeholder="Ex. Décoration"/><button className="secondary-btn">Ajouter la catégorie</button></form>
      <form className="product-form" onSubmit={addProduct} encType="multipart/form-data">
        <div className="form-title"><div><p className="form-kicker">FICHE PRODUIT</p><h3>Informations essentielles</h3></div><label className="featured-toggle"><input type="checkbox" name="featured"/><span></span> À la une</label></div>
        <div className="admin-two"><label>Nom du produit<input required name="name" placeholder="Ex. Bougie Ambre"/></label><label>Catégorie<select required name="category" defaultValue=""><option value="" disabled>Choisir une catégorie</option>{categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></label></div>
        <label>Description<textarea name="description" placeholder="Décrivez les matières, dimensions, usage et conseils…"/></label>
        <div className="admin-two"><label>Prix de vente (TND)<input required min="0" step="0.001" type="number" name="price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.000"/></label><label>Quantité en stock<input required min="0" type="number" name="stock" placeholder="0"/></label></div>
        <section className="promotion-box"><div><p className="form-kicker">PROMOTION</p><h4>Mettre ce produit en promotion</h4><p>Affichez un ancien prix barré et une réduction visible dans la boutique.</p></div><button type="button" className={promotion ? "switch on" : "switch"} onClick={() => setPromotion((value) => !value)} aria-label="Activer la promotion"><span/></button>{promotion && <label className="promo-price">Prix initial (TND)<input required min="0" step="0.001" type="number" name="compareAtPrice" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} placeholder="0.000"/>{reduction > 0 && <b>−{reduction}%</b>}</label>}</section>
        <section className="color-box"><div><p className="form-kicker">COULEURS DISPONIBLES</p><h4>Palette du produit</h4><p>Sélectionnez une ou plusieurs couleurs.</p></div><div className="swatches">{palette.map((color) => <button type="button" key={color} title={color} onClick={() => toggleColor(color)} className={colors.includes(color) ? "swatch selected" : "swatch"} style={{ backgroundColor: color }}/>) }<label className="custom-color" title="Couleur personnalisée"><input type="color" value={colors[colors.length - 1] || "#E7D8C5"} onChange={(e) => !colors.includes(e.target.value) && setColors((list) => [...list, e.target.value])}/><Plus size={14}/></label></div><div className="selected-colors">{colors.map((color) => <span key={color}><i style={{ backgroundColor: color }}/>{color}<button type="button" onClick={() => toggleColor(color)} aria-label={`Retirer ${color}`}>×</button></span>)}</div></section>
        <label className="upload-zone"> <b>Photos du produit</b><span>Glissez vos images ici ou sélectionnez jusqu’à 5 photos (JPG, PNG, WEBP).</span><input required name="images" type="file" accept="image/*" multiple/></label>
        <button className="primary publish-btn">Publier le produit <ArrowRight size={18}/></button>
      </form>
    </div>{notice && <p className="notice">{notice}</p>}
  </section>;
}
function CatalogManager({ token }) {
  const [categories, setCategories] = useState([]), [products, setProducts] = useState([]), [notice, setNotice] = useState("");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const load = () => Promise.all([fetch(`${API}/admin/categories`, {headers}).then((r) => r.json()), fetch(`${API}/admin/products`, {headers}).then((r) => r.json())]).then(([cats, items]) => { setCategories(cats); setProducts(items); });
  useEffect(() => { load().catch(() => setNotice("Impossible de charger le catalogue.")); }, []);
  async function saveCategory(e, id) { e.preventDefault(); let name = new FormData(e.currentTarget).get("name"); let r = await fetch(`${API}/admin/categories/${id}`, {method:"PATCH",headers,body:JSON.stringify({name})}); setNotice(r.ok ? "Catégorie mise à jour." : "Modification impossible."); if(r.ok) load(); }
  async function saveProduct(e, id) { e.preventDefault(); let d = Object.fromEntries(new FormData(e.currentTarget)); d.price=+d.price;d.stock=+d.stock;d.featured=!!d.featured;d.active=!!d.active;d.compareAtPrice=d.compareAtPrice?+d.compareAtPrice:undefined; let r = await fetch(`${API}/admin/products/${id}`, {method:"PATCH",headers,body:JSON.stringify(d)}); setNotice(r.ok ? "Produit mis à jour." : "Modification impossible."); if(r.ok) load(); }
  async function remove(kind,id) { if(!window.confirm(`Supprimer ce${kind==='categories'?'tte catégorie et masquer ses produits':' produit'} ?`)) return; let r = await fetch(`${API}/admin/${kind}/${id}`, {method:"DELETE",headers}); if(r.ok){setNotice("Élément supprimé du catalogue.");load()}else setNotice("Suppression impossible."); }
  return <section className="catalog-manager"><div className="admin-section-heading"><div><p className="eyebrow">GESTION DU CATALOGUE</p><h2>Catégories et produits</h2></div><button className="secondary-btn dark" onClick={load}>Actualiser</button></div>{notice&&<p className="notice">{notice}</p>}<div className="manager-columns"><div className="manager-card"><h3>Catégories ({categories.filter(c=>c.active).length})</h3>{categories.length===0?<p className="none">Aucune catégorie créée.</p>:categories.map(c=><details key={c._id}><summary><span>{c.name}</span><small>{c.active?'Active':'Masquée'}</small></summary><form onSubmit={(e)=>saveCategory(e,c._id)}><input name="name" defaultValue={c.name}/><div><button className="secondary-btn">Enregistrer</button><button type="button" className="delete-btn" onClick={()=>remove('categories',c._id)}>Supprimer</button></div></form></details>)}</div><div className="manager-card products-manager"><h3>Produits ({products.filter(p=>p.active).length})</h3>{products.length===0?<p className="none">Aucun produit publié.</p>:products.map(p=><details key={p._id}><summary><span><img src={p.images?.[0]?.url} alt=""/>{p.name}</span><small>{money(p.price)} · stock {p.stock}</small></summary><form onSubmit={(e)=>saveProduct(e,p._id)}><div className="admin-two"><label>Nom<input name="name" defaultValue={p.name}/></label><label>Prix TND<input type="number" step="0.001" name="price" defaultValue={p.price}/></label></div><div className="admin-two"><label>Stock<input type="number" name="stock" defaultValue={p.stock}/></label><label>Prix initial<input type="number" step="0.001" name="compareAtPrice" defaultValue={p.compareAtPrice||''}/></label></div><label>Description<textarea name="description" defaultValue={p.description}/></label><label className="check"><input type="checkbox" name="featured" defaultChecked={p.featured}/> À la une</label><label className="check"><input type="checkbox" name="active" defaultChecked={p.active}/> Visible dans la boutique</label><div><button className="secondary-btn">Enregistrer</button><button type="button" className="delete-btn" onClick={()=>remove('products',p._id)}>Supprimer</button></div></form></details>)}</div></div></section>;
}
function Admin({ products }) {
  let [token, setToken] = useState(
      localStorage.getItem("zendella-admin-token") || "",
    ),
    [orders, setOrders] = useState([]),
    [error, setError] = useState(""),
    [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    if (token)
      fetch(`${API}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then(setOrders)
        .catch(() => {
          setError("Session expirée ou accès administrateur requis");
          setToken("");
          localStorage.removeItem("zendella-admin-token");
        });
  }, [token]);
  async function login(e) {
    e.preventDefault();
    setError("");
    try {
      let d = Object.fromEntries(new FormData(e.currentTarget));
      let r = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      });
      let data = await r.json().catch(() => ({}));
      if (!r.ok || data.user?.role !== "admin")
        return setError(data.message || "Identifiants administrateur invalides");
      localStorage.setItem("zendella-admin-token", data.token);
      setToken(data.token);
    } catch {
      setError(`Impossible de joindre l’API : ${API}`);
    }
  }
  async function update(id, status) {
    let r = await fetch(`${API}/admin/orders/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (r.ok)
      setOrders((a) => a.map((o) => (o._id === id ? { ...o, status } : o)));
  }
  if (!token)
    return (
      <main className="admin-login">
        <form onSubmit={login}>
          <button type="button" className="site-logo">
            <img src="/zendala-dream-logo.png" alt="Zendala Dream" />
          </button>
          <p className="eyebrow">ESPACE SÉCURISÉ</p>
          <h1>Administration</h1>
          <label>
            Email
            <input required type="email" name="email" />
          </label>
          <label>
            Mot de passe
            <span className="password-field">
              <input required type={showPassword ? "text" : "password"} name="password" />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="primary full">
            Se connecter
          </button>
          <small>
            Utilisez les identifiants ADMIN_EMAIL et ADMIN_PASSWORD définis sur
            Render.
          </small>
        </form>
      </main>
    );
  return (
    <main className="admin">
      <div className="admin-top">
        <div>
          <button className="site-logo">
            <img src="/zendala-dream-logo.png" alt="Zendala Dream" />
          </button>
          <p>Tableau de bord</p>
        </div>
        <button
          className="line-btn"
          onClick={() => {
            localStorage.removeItem("zendella-admin-token");
            setToken("");
          }}
        >
          Déconnexion
        </button>
      </div>
      <div className="stats">
        <div>
          <span>Commandes</span>
          <b>{orders.length}</b>
        </div>
        <div>
          <span>À approuver</span>
          <b>{orders.filter((o) => o.status === "pending").length}</b>
        </div>
        <div>
          <span>Produits</span>
          <b>{products.length}</b>
        </div>
        <div>
          <span>Stock faible</span>
          <b>{products.filter((p) => p.stock < 6).length}</b>
        </div>
      </div>
      <AdminTools token={token} />
      <CatalogManager token={token} />
      <section className="order-table">
        <div className="section-title">
          <div>
            <p className="eyebrow">COMMANDES</p>
            <h2>À traiter</h2>
          </div>
        </div>
        {!orders.length ? (
          <p className="none">Aucune commande pour le moment.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Client</th>
                  <th>Produits / couleurs</th>
                  <th>Ville</th>
                  <th>Total</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td>#{o.orderNumber}</td>
                    <td>
                      {o.customer?.firstName} {o.customer?.lastName}
                      <small>{o.customer?.phone}</small>
                    </td>
                    <td className="order-items">
                      {o.items?.map((item, index) => (
                        <span key={`${item.product}-${item.color || index}`}>
                          {item.colour || item.color ? (
                            <i style={{ backgroundColor: item.colour || item.color }} />
                          ) : null}
                          {item.quantity} × {item.name}
                          {item.colour || item.color
                            ? ` — ${colourName(item.colour || item.color)}`
                            : ""}
                        </span>
                      ))}
                    </td>
                    <td>{o.customer?.city}</td>
                    <td>{money(o.total)}</td>
                    <td>
                      <span className={"status " + o.status}>{o.status}</span>
                    </td>
                    <td>
                      <select
                        value={o.status}
                        onChange={(e) => update(o._id, e.target.value)}
                      >
                        <option value="pending">En attente</option>
                        <option value="approved">Approuvée</option>
                        <option value="processing">Préparation</option>
                        <option value="shipped">Expédiée</option>
                        <option value="delivered">Livrée</option>
                        <option value="cancelled">Annulée</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
function Showroom() {
  return (
    <main className="showroom">
      <div>
        <p className="eyebrow">NOTRE UNIVERS</p>
        <h1>Le showroom Zendella</h1>
        <p>
          Un lieu d'inspiration où les textures, les formes et la lumière
          dialoguent.
        </p>
      </div>
      <img
        src="https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1400&q=85"
        alt="Showroom Zendella"
      />
      <section>
        <h2>Venez vivre l'expérience.</h2>
        <p>
          Notre showroom est actuellement disponible sur rendez-vous à Lagos.
          Suivez-nous pour découvrir nos pop-ups et nouvelles collections.
        </p>
        <button className="line-btn">
          @zendella.home <Instagram size={18} />
        </button>
      </section>
    </main>
  );
}
function About() {
  return (
    <main className="about">
      <section className="about-hero">
        <div>
          <p className="eyebrow">NOTRE HISTOIRE</p>
          <h1>
            La beauté
            <br />
            du quotidien.
          </h1>
          <p>
            Zendella est née d'une conviction simple : la maison doit être un
            refuge, un terrain de jeu et un reflet de ceux qui l'habitent.
          </p>
        </div>
        <aside>
          <span>01</span>
          <p>Imaginer des intérieurs qui vous ressemblent, pièce après pièce.</p>
        </aside>
      </section>
      <section className="about-image">
        <img
          src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85"
          alt="Intérieur chaleureux"
        />
        <div>
          <span>Depuis 2026</span>
          <b>Des objets choisis<br />avec intention.</b>
        </div>
      </section>
      <section className="values">
        <div>
          <span>01</span>
          <h2>
            Choisir moins,
            <br />
            choisir mieux.
          </h2>
        </div>
        <p>
          Nous privilégions les pièces intemporelles, fabriquées dans des
          matières qui traversent les années. Chaque collection est imaginée
          pour s'accorder, évoluer et raconter votre histoire.
        </p>
      </section>
      <section className="about-promise">
        <p className="eyebrow">NOTRE PROMESSE</p>
        <div>
          <article><span>01</span><h3>Un choix sensible</h3><p>Des formes, des matières et des couleurs pensées pour s’harmoniser chez vous.</p></article>
          <article><span>02</span><h3>Une maison vivante</h3><p>Des objets utiles, beaux et faciles à faire entrer dans la vraie vie.</p></article>
          <article><span>03</span><h3>Pour durer</h3><p>Nous privilégions des pièces qui gardent leur place au fil des saisons.</p></article>
        </div>
      </section>
    </main>
  );
}
function Footer() {
  return (
    <footer>
      <div>
        <button className="site-logo">
          <img src="/zendala-dream-logo.png" alt="Zendala Dream" />
        </button>
        <p>Des objets qui font du bien à la maison.</p>
      </div>
      <div>
        <b>La maison Zendala</b>
        <a>La boutique</a>
        <a>Showroom</a>
        <a>Notre histoire</a>
      </div>
      <div>
        <b>Suivez-nous</b>
        <a
          href="https://www.instagram.com/ste_zendala_dream/"
          target="_blank"
          rel="noreferrer"
        >
          Instagram @ste_zendala_dream
        </a>
        <a>Livraison & retours</a>
        <a>Nous contacter</a>
      </div>
      <div>
        <b>La lettre Zendala</b>
        <p>Inspirations, nouveautés et offres privées.</p>
        <div className="newsletter">
          <input placeholder="Votre e-mail" />
          <button>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
      <small>© 2026 Zendala Dream. Tous droits réservés.</small>
    </footer>
  );
}
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error)
      return (
        <main className="app-error">
          <p className="eyebrow">ERREUR DE CHARGEMENT</p>
          <h1>Zendala Dream redémarre.</h1>
          <p>
            Actualisez la page. Si le problème persiste, réessayez dans quelques
            instants.
          </p>
          <code>{this.state.error.message}</code>
          <button className="primary" onClick={() => window.location.reload()}>
            Actualiser le site
          </button>
        </main>
      );
    return this.props.children;
  }
}
createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
