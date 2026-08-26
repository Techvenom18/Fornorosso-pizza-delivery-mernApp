import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Logo from '../components/Logo';
import PizzaPreview from '../components/PizzaPreview';
import Reveal from '../components/Reveal';
import TiltCard from '../components/TiltCard';
import FAQAccordion from '../components/FAQAccordion';
import Marquee from '../components/Marquee';
import Avatar from '../components/Avatar';
import StickyOrderBar from '../components/StickyOrderBar';
import Newsletter from '../components/Newsletter';
import { getTodaysOffer } from '../data/offers';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import API from '../api/axios';
import { useToast } from '../context/ToastContext';


const SIGNATURE_PIZZAS = [
  { name: 'Margherita Classic', price: 195, rating: 4.7, orders: 340, base: 'Thin Crust', sauce: 'Classic Tomato', cheese: 'Mozzarella', veg: ['Tomato'], photo: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=400&fit=crop' },
  { name: 'Garden Veggie', price: 240, rating: 4.8, orders: 265, base: 'Wheat Base', sauce: 'Pesto', cheese: 'Cheddar', veg: ['Bell Pepper', 'Onion', 'Sweet Corn'], photo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop' },
  { name: 'Spicy Fiesta', price: 260, rating: 4.6, orders: 198, base: 'Cheese Burst Base', sauce: 'Spicy Arrabbiata', cheese: 'Mozzarella', veg: ['Jalapeno', 'Olives', 'Onion'], photo: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=400&h=400&fit=crop' },
  { name: 'Smoky BBQ Chicken-Style', price: 275, rating: 4.5, orders: 172, base: 'Thick Crust', sauce: 'BBQ', cheese: 'Cheddar', veg: ['Onion', 'Bell Pepper'], photo: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&h=400&fit=crop' },
  { name: 'Four Cheese Delight', price: 285, rating: 4.9, orders: 301, base: 'Cheese Burst Base', sauce: 'Alfredo', cheese: 'Mozzarella', veg: ['Olives'], photo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop' },
  { name: 'Vegan Harvest', price: 250, rating: 4.4, orders: 130, base: 'Gluten-Free Base', sauce: 'Pesto', cheese: 'Vegan Cheese', veg: ['Mushroom', 'Sweet Corn', 'Tomato'], photo: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=400&fit=crop' },
];

const DEALS = [
  { icon: '🥤', title: 'Free Coke on Orders Above ₹500', text: 'Add any pizza worth ₹500+ and we\'ll throw in a chilled drink, on us.' },
  { icon: '🍟', title: 'Combo Deal: Pizza + Fries', text: 'Grab any signature pizza with a side of crispy fries at a bundled price.' },
  { icon: '🍬', title: 'Sweet Dice with Every Order', text: 'Every order over ₹300 comes with a free box of sweet dice dessert.' },
];

const TESTIMONIALS = [
  { name: 'Ananya Rathore', text: 'The custom builder is so easy — got exactly the pizza I wanted in under a minute.', rating: 5 },
  { name: 'Rohit Kumar', text: 'Fast delivery and the order tracking actually updates in real time. Impressive.', rating: 5 },
  { name: 'Meera Sharma', text: 'Garden Veggie is my go-to now. Fresh toppings every time.', rating: 4 },
  { name: 'Aditya Verma', text: 'Ordered late at night and it still showed up hot. Genuinely surprised.', rating: 5 },
  { name: 'Priya Nair', text: 'Good pizza, but my delivery took a bit longer than the estimate said.', rating: 3 },
  { name: 'Karan Malhotra', text: 'The Spicy Fiesta lives up to its name. Bring water.', rating: 5 },
  { name: 'Sneha Iyer', text: 'Decent for the price, nothing extraordinary but I\'d order again.', rating: 3 },
  { name: 'Vikram Singh', text: 'App crashed once mid-order, had to redo it. Pizza was fine though.', rating: 2 },
  { name: 'Divya Menon', text: 'Four Cheese Delight is criminally underrated. So good.', rating: 5 },
  { name: 'Arjun Reddy', text: 'Solid weekday go-to. Nothing fancy, just consistently good.', rating: 4 },
  { name: 'Neha Gupta', text: 'Loved that I could go fully vegan without compromising on taste.', rating: 5 },
  { name: 'Farhan Sheikh', text: 'Order arrived slightly cold once, but support sorted it out quickly.', rating: 3 },
  { name: 'Ritika Bose', text: 'Honestly overhyped. It\'s fine, not amazing.', rating: 2 },
  { name: 'Sameer Khanna', text: 'First order and I\'m already planning my next one. Great toppings variety.', rating: 5 },
];

const STEPS = [
  { icon: '🧑‍🍳', title: 'Pick Your Base', text: 'Choose from 5 crust styles, sauces and cheeses to start your build.' },
  { icon: '🥗', title: 'Add Your Toppings', text: 'Load up on veggies-mix and match as many as you like, no extra steps.' },
  { icon: '🚴', title: 'Fired & Delivered', text: 'We bake it fresh and get it to your door, with live status tracking.' },
];


const TRUST_MESSAGES = [
  '🌿 100% Fresh Ingredients 🌿',
  '⏱️ 30-Min Delivery Promise ⏱️',
  '🔒 Secure Checkout 🔒',
];

const PLANS = [
  { name: 'Premium', price: 299, seats: 2, features: ['1 Admin Accounts', 'Basic Order Management', 'Email Support'] },
  { name: 'Platinum', price: 399, seats: 3, features: ['2 Admin Accounts', 'Advanced Order Management', 'Priority Support', 'Inventory Alerts'] },
  { name: 'Diamond', price: 599, seats: 4, features: ['3 Admin Accounts', 'Full Order Management', '24/7 Priority Support', 'Inventory Alerts', 'Analytics Dashboard'], featured: true },
];

const FAQS = [
  { question: 'How long does delivery usually take?', answer: 'Most orders arrive within 30 minutes of confirmation, depending on your location and kitchen load.' },
  { question: 'Can I customize spice levels or remove ingredients?', answer: 'Yes — the builder lets you pick your exact base, sauce, cheese, and any combination of toppings, so you have full control.' },
  { question: 'Do you offer vegan or gluten-free options?', answer: 'We offer a Gluten-Free base and Vegan Cheese, so you can build a fully plant-based, gluten-conscious pizza.' },
  { question: 'What payment methods do you accept?', answer: 'We support secure online payments through our checkout, processed safely at order time.' },
];

const NAV_SECTIONS = ['how', 'menu', 'deals', 'faq'];

const Stars = ({ count }) => (
  <span style={{ color: 'var(--yellow)' }}>{'★'.repeat(count)}{'☆'.repeat(5 - count)}</span>
);

const Landing = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [heroToppings, setHeroToppings] = useState(['Olives', 'Bell Pepper', 'Mushroom']);
  const [trustIndex, setTrustIndex] = useState(0);
  const [todaysOffer, setTodaysOffer] = useState(getTodaysOffer());
  const [options, setOptions] = useState(null);
  const [confirmPizza, setConfirmPizza] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [offerBlink, setOfferBlink] = useState(false);
  const { user } = useAuth();
  const { openSidebar } = useSidebar();

  useEffect(() => {
    const handler = () => {
      setOfferBlink(true);
      setTimeout(() => setOfferBlink(false), 1000);
    };
    window.addEventListener('blink-offer', handler);
    return () => window.removeEventListener('blink-offer', handler);
  }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await API.get('/pizza/options');
        setOptions(res.data);
      } catch (err) {
        // silent - Order This button will just show an error if clicked before this loads
      }
    };
    fetchOptions();
  }, []);

  const toggleHeroTopping = (veg) => {
    setHeroToppings((prev) =>
      prev.includes(veg) ? prev.filter((v) => v !== veg) : [...prev, veg]
    );
  };

  useEffect(() => { setLoaded(true); }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTrustIndex((prev) => (prev + 1) % TRUST_MESSAGES.length);
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTodaysOffer(getTodaysOffer());
    }, 60 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      let current = '';
      for (const id of NAV_SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) current = id;
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const resolveIngredientIds = (pizza) => {
    if (!options) return null;
    const allItems = [...options.bases, ...options.sauces, ...options.cheeses, ...options.vegetables];
    const findId = (name) => allItems.find((i) => i.name === name)?._id;

    const baseId = findId(pizza.base);
    const sauceId = findId(pizza.sauce);
    const cheeseId = findId(pizza.cheese);
    const vegetableIds = pizza.veg.map((v) => findId(v)).filter(Boolean);

    if (!baseId || !sauceId || !cheeseId) return null;
    return { baseId, sauceId, cheeseId, vegetableIds };
  };

  const handleOrderThisClick = (pizza) => {
    if (!user) {
      navigate('/login');
      return;
    }
  const ids = resolveIngredientIds(pizza);
    if (!ids) {
      showToast('Could not load this pizza right now - try again in a moment', 'error');
      return;
    }
    setConfirmPizza({ ...pizza, ids });
  };

  const handleConfirmSignatureOrder = async () => {
    if (!confirmPizza) return;
    setPlacing(true);
    try {
      await API.post('/orders', {
        baseId: confirmPizza.ids.baseId,
        sauceId: confirmPizza.ids.sauceId,
        cheeseId: confirmPizza.ids.cheeseId,
        vegetableIds: confirmPizza.ids.vegetableIds,
        quantity: 1,
        addons: [],
      });
      showToast(`${confirmPizza.name} ordered!`, 'success');
      setConfirmPizza(null);
      navigate('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      setPlacing(false);
    }
  };

  const handlePlanSelect = (plan) => {
    if (!user) { navigate('/login'); return; }
    showToast(`${plan.name} plan selected - mock checkout (real gateway pending KYC)`, 'info');
    // Same honest mock-mode pattern as your pizza payments - fully wireable to
    // a real gateway later by swapping this for an actual payment API call.
  };

  return (
    <div>
      <div className={`offer-header ${offerBlink ? 'blink' : ''}`}>{todaysOffer}</div>

      <header className="site-header">
        <div className="site-header-inner">
          <div className="header-zone header-zone-left"><Logo /></div>
          <nav className="header-zone header-zone-center">
            <a href="#how" className={activeSection === 'how' ? 'nav-active' : ''} onClick={scrollTo('how')}>How It Works</a>
            <a href="#menu" className={activeSection === 'menu' ? 'nav-active' : ''} onClick={scrollTo('menu')}>Menu</a>
            <a href="#deals" className={activeSection === 'deals' ? 'nav-active' : ''} onClick={scrollTo('deals')}>Deals</a>
            <a href="#faq" className={activeSection === 'faq' ? 'nav-active' : ''} onClick={scrollTo('faq')}>FAQ</a>
          </nav>
            <div className="header-zone header-zone-right">
            {user ? (
              <button className="profile-trigger" onClick={openSidebar}>
                  <Avatar name={user?.name} imageUrl={user?.avatar} size={38} />
              </button>
            ) : (
              <>
                <button className="btn btn-small" onClick={() => navigate('/login')}>Login</button>
                <button className="btn btn-primary btn-small" onClick={() => navigate('/register')}>Sign Up</button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="hero">
        <div className={`hero-text ${loaded ? 'load-in' : 'load-pending'}`} style={{ transitionDelay: '0ms' }}>
          <div className="hero-badge">🔥 Fresh out of the oven, every time</div>
          <h1>Build your <span style={{ color: 'var(--red)' }}>perfect</span> pizza.</h1>
          <p>Pick your base, sauce, cheese and toppings. We'll fire it up and get it to your door hot, fresh and exactly how you like it.</p>
          <div>
            {user ? (
              <>
                <button className="btn btn-primary" onClick={() => navigate('/builder')} style={{ marginRight: 10 }}>Order Now</button>
                <button className="btn" onClick={() => navigate('/favorites')}>My Favorites</button>
              </>
            ) : (
              <>
                <button className="btn btn-primary" onClick={() => navigate('/register')} style={{ marginRight: 10 }}>Order Now</button>
                <button className="btn" onClick={() => navigate('/login')}>I Already Have an Account</button>
              </>
            )}
          </div>
        </div>
        <div className={`hero-visual ${loaded ? 'load-in' : 'load-pending'}`} style={{ transitionDelay: '150ms' }}>
          <div className="hero-visual-bob">
            <PizzaPreview
              baseName="Cheese Burst Base"
              sauceName="Classic Tomato"
              cheeseName="Mozzarella"
              vegetableNames={heroToppings}
            />
          </div>
          <div className="hero-topping-picker">
            <span className="hero-topping-label">Try it-tap a topping:</span>
            <div className="hero-topping-buttons">
              {['Olives', 'Bell Pepper', 'Mushroom', 'Jalapeno', 'Onion', 'Sweet Corn'].map((veg) => (
                <button
                  key={veg}
                  className={`hero-topping-btn ${heroToppings.includes(veg) ? 'active' : ''}`}
                  onClick={() => toggleHeroTopping(veg)}
                >
                  {veg}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="stats-bar">
        <Reveal delay={0}>
          <div className="stat-item">
            <div className="stat-icon"></div>
            <div className="stat-value">4.8★</div>
            <div className="stat-label">Average Rating</div>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="stat-item">
            <div className="stat-icon"></div>
            <div className="stat-value">500+</div>
            <div className="stat-label">Pizzas Served</div>
          </div>
        </Reveal>
        <Reveal delay={160}>
          <div className="stat-item">
            <div className="stat-icon"></div>
            <div className="stat-value">30 min</div>
            <div className="stat-label">Avg Delivery</div>
          </div>
        </Reveal>
        <Reveal delay={240}>
          <div className="stat-item">
            <div className="stat-icon"></div>
            <div className="stat-value">6+</div>
            <div className="stat-label">Toppings to Choose</div>
          </div>
        </Reveal>
      </div>

      <div className="flap-button">
        <span className="flap-button-inner">{TRUST_MESSAGES[trustIndex]}</span>
      </div>

      <section id="how" className="section">
        <h3 style={{ margin: '0 auto 6px' }}>Simple as 1-2-3</h3>
        <h2 style={{ textAlign: 'center' }}>How It Works</h2>
        <div className="steps-grid">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 120}>
              <div className="step-card">
                <div className="step-number">{i + 1}</div>
                <div className="step-icon">{step.icon}</div>
                <div className="step-title">{step.title}</div>
                <div className="step-text">{step.text}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <svg className="wave-divider" viewBox="0 0 1200 40" preserveAspectRatio="none">
        <path d="M0,20 C300,50 900,-10 1200,20 L1200,40 L0,40 Z" fill="var(--surface-raised)" opacity="0.5" />
      </svg>

      <section className="section about-section">
        <Reveal>
          <div className="about-card">
            <h3 style={{ margin: '0 auto 14px' }}>Our Story</h3>
            <p className="about-text">
              FornoRosso started with one idea: pizza should be built exactly the way you want it,
              without compromise. Every base is rolled fresh, every topping is portioned by hand
              and every order is tracked from oven to doorstep, so you always know exactly when
              your next slice is arriving.
            </p>
            <p className="about-quote">"We don't just deliver pizza. We deliver it fired your way" — The FornoRosso Kitchen</p>
          </div>
        </Reveal>
      </section>

      <section id="menu" className="section">
        <h3 style={{ margin: '0 auto 6px' }}>Fan Favorites</h3>
        <h2 style={{ textAlign: 'center', marginBottom: 34 }}>Our Signature Pizza's</h2>
        <Marquee
          items={SIGNATURE_PIZZAS}
          direction="left"
          duration={38}
          renderItem={(pizza) => (
            <TiltCard className="menu-card menu-card-marquee">
              <div className="menu-card-photo">
                <img src={pizza.photo} alt={pizza.name} loading="lazy" />
              </div>
              <h3>{pizza.name}</h3>
              <div className="menu-card-rating"><Stars count={Math.round(pizza.rating)} /> <span>{pizza.rating} ({pizza.orders})</span></div>
              <div className="menu-card-desc">{pizza.base} · {pizza.sauce} · {pizza.cheese}</div>
              <div className="menu-card-price">₹{pizza.price}</div>
              <button className="btn btn-primary" onClick={() => handleOrderThisClick(pizza)}>Order This</button>
            </TiltCard>
          )}
        />
      </section>

      <svg className="wave-divider" viewBox="0 0 1200 40" preserveAspectRatio="none">
        <path d="M0,20 C300,-10 900,50 1200,20 L1200,40 L0,40 Z" fill="var(--surface-raised)" opacity="0.5" />
      </svg>

      <section id="deals" className="section deals-section">
        <h3 style={{ margin: '0 auto 6px' }}>Sweet Deals</h3>
        <h2 style={{ textAlign: 'center' }}>Offers & Freebies</h2>
        <div className="deals-grid">
          {DEALS.map((deal, i) => (
            <Reveal key={deal.title} delay={i * 100}>
              <TiltCard className="deal-card">
                <div className="deal-icon">{deal.icon}</div>
                <div className="deal-title">{deal.title}</div>
                <div className="deal-text">{deal.text}</div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section">
        <h3 style={{ margin: '0 auto 6px' }}>What People Say</h3>
        <h2 style={{ textAlign: 'center', marginBottom: 34 }}>Loved by Pizza Fans</h2>
        <Marquee
          items={TESTIMONIALS.slice(0, 7)}
          direction="left"
          duration={40}
          renderItem={(t) => (
            <div className="testimonial-card testimonial-card-marquee">
              <div className="testimonial-header">
                <Avatar name={t.name} />
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <Stars count={t.rating} />
                </div>
              </div>
              <p className="testimonial-text">"{t.text}"</p>
            </div>
          )}
        />
        <div style={{ height: 20 }} />
        <Marquee
          items={TESTIMONIALS.slice(7)}
          direction="right"
          duration={42}
          renderItem={(t) => (
            <div className="testimonial-card testimonial-card-marquee">
              <div className="testimonial-header">
                <Avatar name={t.name} />
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <Stars count={t.rating} />
                </div>
              </div>
              <p className="testimonial-text">"{t.text}"</p>
            </div>
          )}
        />
      </section>

      <section className="section">
        <h3 style={{ margin: '0 auto 6px' }}>For Restaurant Owners</h3>
        <h2 style={{ textAlign: 'center', marginBottom: 34 }}>Choose Your Plan</h2>
        <div className="plans-grid">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`plan-card ${plan.featured ? 'plan-featured' : ''}`}>
              {plan.featured && <div className="plan-badge">Most Popular</div>}
              <div className="plan-name">{plan.name}</div>
              <div className="plan-price">₹{plan.price}<span>/month</span></div>
              <ul className="plan-features">
                {plan.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <button className={plan.featured ? 'btn btn-primary' : 'btn'} style={{ width: '100%' }} onClick={() => handlePlanSelect(plan)}>
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="section">
        <h3 style={{ margin: '0 auto 6px' }}>Got Questions?</h3>
        <h2 style={{ textAlign: 'center', marginBottom: 34 }}>Frequently Asked</h2>
        <Reveal>
          <FAQAccordion items={FAQS} />
        </Reveal>
      </section>

      <footer className="site-footer">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <Logo />
            <p className="footer-tagline">Wood-fired favorites, delivered fast.</p>
            <Newsletter />
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Explore</div>
            <a href="#how">How It Works</a>
            <a href="#menu">Menu</a>
            <a href="#deals">Deals</a>
            <a href="#faq">FAQ</a>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Account</div>
            <a href="/register">Sign Up</a>
            <a href="/login">Login</a>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Legal</div>
            <a href="/legal/privacy">Privacy Policy</a>
            <a href="legal/items">Terms of Service</a>
            <a href="legal/refund">Refund Policy</a>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Follow Us</div>
            <a href="https://www.instagram.com/">Instagram</a>
            <a href="https://www.youtube.com/">YouTube</a>
            <a href="https://x.com/">X (Twitter)</a>
            <a href="https://www.facebook.com/">Facebook</a>
          </div>
        </div>

        <p className="footer-copyright">© 2026 FornoRosso. Crafed & Developed by Sumit Rathore.</p>
      </footer>

      {confirmPizza && (
        <div className="modal-overlay" onClick={() => setConfirmPizza(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 4 }}>Confirm Your Order</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 20 }}>
              You're about to order the {confirmPizza.name}.
            </p>

            <div className="modal-summary-row"><span>Base</span><span>{confirmPizza.base}</span></div>
            <div className="modal-summary-row"><span>Sauce</span><span>{confirmPizza.sauce}</span></div>
            <div className="modal-summary-row"><span>Cheese</span><span>{confirmPizza.cheese}</span></div>
            <div className="modal-summary-row">
              <span>Toppings</span>
              <span>{confirmPizza.veg.join(', ')}</span>
            </div>

            <div className="modal-total-row">
              <span>Total</span>
              <span className="modal-total-price">₹{confirmPizza.price}</span>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => setConfirmPizza(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleConfirmSignatureOrder} disabled={placing}>
                {placing ? 'Placing...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;