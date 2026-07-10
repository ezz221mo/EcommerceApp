import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineShoppingCart, HiOutlineHeart, HiHeart, HiStar,
  HiPlus, HiMinus, HiOutlineCheck,
  HiOutlineTruck, HiOutlineShieldCheck, HiOutlineArrowLeft,
  HiOutlineShare, HiOutlineTemplate,
} from 'react-icons/hi';
import { useCartStore, useWishlistStore, useProductStore } from '../store';
import { useAuth } from '../hooks/useAuth';
import ProductCard from '../components/product/ProductCard';
import ImageZoom from '../components/product/ImageZoom';
import ProductReviews from '../components/product/ProductReviews';
import useRecentlyViewed from '../hooks/useRecentlyViewed';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  // ── Pull from store (includes seller-added products) ──────────────────────
  const allProducts      = useProductStore(s => s.products);
  const product          = allProducts.find(p => String(p.id) === String(id));

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity,      setQuantity]      = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize,  setSelectedSize]  = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  const { addItem, updateQuantity, isInCart } = useCartStore();
  const { toggleItem, isWishlisted }          = useWishlistStore();
  const { currentUser, userData }             = useAuth();

  const isSeller   = userData?.role === 'seller';
  const wishlisted = product ? isWishlisted(product.id) : false;
  const inCart     = product ? isInCart(product.id)     : false;

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!product) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
            Product not found
          </h2>
          <p className="text-stone-500 mb-6">This product may have been removed or doesn't exist.</p>
          <Link to="/products" className="btn-primary">Back to Products</Link>
        </div>
      </div>
    );
  }

  const images  = product.images?.length ? product.images : [product.image || 'https://placehold.co/600x600?text=No+Image'];
  const related = allProducts
    .filter(p => p.category === product.category && String(p.id) !== String(id))
    .slice(0, 4);

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const { addItem: addRecent } = useRecentlyViewed();

  useEffect(() => {
    if (product) addRecent(product);
  }, [product?.id]);

  const maxStock = product.stock ? parseInt(product.stock) : Infinity;

  const handleAddToCart = () => {
    if (!product.inStock || isSeller || !currentUser) return;
    addItem(product, quantity, false);
    toast.success(`${quantity}× ${product.name} added to cart!`, {
      icon: '🛒',
      style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
    });
  };

  const handleWishlist = () => {
    toggleItem(product);
    toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!', {
      icon: wishlisted ? '💔' : '❤️',
      style: { borderRadius: '12px' },
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!', {
        style: { borderRadius: '12px' },
      });
    }
  };

  const handleAddToOutfit = () => {
    toast('Add to outfit coming soon!', {
      icon: '\u{1F455}',
      style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
    });
  };

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-orange-500 transition-colors mb-8 group">
          <HiOutlineArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-stone-400 mb-8 flex-wrap">
          <Link to="/"                              className="hover:text-orange-500 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products"                      className="hover:text-orange-500 transition-colors">Products</Link>
          <span>/</span>
          <Link to={`/products?cat=${product.category}`} className="hover:text-orange-500 transition-colors capitalize">{product.category}</Link>
          <span>/</span>
          <span className="text-stone-700 dark:text-stone-300 truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">

          {/* ── Images ── */}
          <div>
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square rounded-3xl overflow-hidden bg-stone-100 dark:bg-stone-800 mb-4"
            >
              <ImageZoom src={images[selectedImage]} alt={product.name} zoom={2.5} />
            </motion.div>
            {images.length > 1 && (
              <div className="flex gap-3 flex-wrap">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImage === i
                        ? 'border-orange-500 shadow-lg shadow-orange-500/20'
                        : 'border-stone-200 dark:border-stone-700 hover:border-stone-400'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Details ── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>

            {/* Category + badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider capitalize">
                {product.category}
              </span>
              {product.badge && (
                <span className={`badge text-white ${
                  product.badge === 'Sale' ? 'bg-rose-500' :
                  product.badge === 'New'  ? 'bg-teal-500' : 'bg-amber-500'
                }`}>{product.badge}</span>
              )}
            </div>

            {product.brand && (
              <p className="text-xs text-stone-400 dark:text-stone-500 uppercase tracking-[0.15em] mb-1">
                {product.brand}
              </p>
            )}

            <h1 className="font-display text-3xl lg:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <HiStar key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-amber-400' : 'text-stone-200 dark:text-stone-700'}`} />
                ))}
              </div>
              <span className="text-stone-700 dark:text-stone-300 font-semibold">{product.rating || 0}</span>
              <span className="text-stone-400 text-sm">({(product.reviews || 0).toLocaleString()} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100">
                ${product.price}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-stone-400 text-xl line-through">${product.originalPrice}</span>
                  <span className="badge bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 text-sm">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">
                  Color: <span className="text-stone-900 dark:text-stone-100">{product.colors[selectedColor]?.name}</span>
                </p>
                <div className="flex gap-3">
                  {product.colors.map((c, i) => (
                    <motion.button
                      key={c.hex}
                      onClick={() => setSelectedColor(i)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`w-9 h-9 rounded-full border-2 transition-all ${
                        selectedColor === i
                          ? 'border-orange-500 scale-110 shadow-lg shadow-orange-500/20'
                          : 'border-stone-200 dark:border-stone-700 hover:border-stone-400'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">
                  Size: <span className="text-stone-900 dark:text-stone-100">{product.sizes[selectedSize]}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((s, i) => (
                    <motion.button
                      key={s}
                      onClick={() => setSelectedSize(i)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`px-4 py-2 text-sm font-semibold rounded-xl border-2 transition-all ${
                        selectedSize === i
                          ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100 shadow-md'
                          : 'bg-transparent text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-stone-400'
                      }`}
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock status */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium mb-6 ${
              product.inStock
                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-50  text-red-700  dark:bg-red-900/20  dark:text-red-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
              {product.inStock
                ? (product.stock ? `In Stock (${product.stock} left)` : 'In Stock')
                : 'Out of Stock'}
            </div>

            {/* Quantity + Actions — buyers only */}
            {currentUser && !isSeller && product.inStock && (
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {/* Qty stepper */}
                <div className="flex items-center gap-3 bg-stone-100 dark:bg-stone-800 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-lg hover:bg-white dark:hover:bg-stone-700 flex items-center justify-center transition-colors"
                  >
                    <HiMinus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(q + 1, maxStock))}
                    className="w-10 h-10 rounded-lg hover:bg-white dark:hover:bg-stone-700 flex items-center justify-center transition-colors"
                    disabled={quantity >= maxStock}
                  >
                    <HiPlus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to cart */}
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className="btn-primary flex-1 text-base py-4"
                >
                  <HiOutlineShoppingCart className="w-5 h-5" />
                  {inCart ? 'Update Cart' : `Add to Cart — $${(product.price * quantity).toFixed(2)}`}
                </motion.button>

                {/* Wishlist */}
                <button
                  onClick={handleWishlist}
                  className="w-14 h-14 rounded-xl border-2 border-stone-200 dark:border-stone-700 hover:border-rose-400 flex items-center justify-center transition-all duration-200 flex-shrink-0"
                >
                  {wishlisted
                    ? <HiHeart className="w-6 h-6 text-rose-500" />
                    : <HiOutlineHeart className="w-6 h-6 text-stone-500" />}
                </button>
              </div>
            )}

            {/* Share + Outfit */}
            {!isSeller && (
              <div className="flex items-center gap-3 mb-8">
                <motion.button
                  onClick={handleShare}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-stone-200 dark:border-stone-700 text-sm font-semibold text-stone-600 dark:text-stone-400 hover:border-orange-300 hover:text-orange-500 transition-all"
                >
                  <HiOutlineShare className="w-4 h-4" />
                  Share
                </motion.button>
                <motion.button
                  onClick={handleAddToOutfit}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-stone-200 dark:border-stone-700 text-sm font-semibold text-stone-600 dark:text-stone-400 hover:border-orange-300 hover:text-orange-500 transition-all"
                >
                  <HiOutlineTemplate className="w-4 h-4" />
                  Add to Outfit
                </motion.button>
              </div>
            )}

            {/* Shipping info */}
            <div className="space-y-3 p-4 bg-stone-100 dark:bg-stone-800/50 rounded-2xl">
              <div className="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
                <HiOutlineTruck className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span>Free shipping on orders over $75</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
                <HiOutlineShieldCheck className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span>30-day hassle-free returns</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-8 border-b border-stone-200 dark:border-stone-800 mb-8">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === 'description'
                ? 'text-orange-500'
                : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            Description
            {activeTab === 'description' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === 'features'
                ? 'text-orange-500'
                : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            Features
            {activeTab === 'features' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === 'reviews'
                ? 'text-orange-500'
                : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            Customer Reviews
            {activeTab === 'reviews' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'description' && product.description && (
          <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-16">
            {product.description}
          </p>
        )}

        {activeTab === 'features' && (
          <div className="mb-16">
            {product.features?.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {product.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
                    <HiOutlineCheck className="w-4 h-4 text-teal-500 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-stone-400">No features available.</p>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="mb-16">
            <ProductReviews product={product} />
          </div>
        )}

        {/* Related Products */}
        {related.length > 0 && (
          <section>
            <h2 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100 mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}