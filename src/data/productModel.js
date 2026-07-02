/**
 * @typedef {Object} ProductColor
 * @property {string} name - Color name (e.g., "Midnight Black")
 * @property {string} hex  - Hex code (e.g., "#1a1a2e")
 */

/**
 * @typedef {Object} Product
 * @property {string|number} id          - Unique identifier
 * @property {string}        name        - Product name
 * @property {string}        slug        - URL-friendly name (auto-generated from name)
 * @property {string}        shortDescription - Brief description for cards (max 120 chars)
 * @property {string}        description - Full product description
 * @property {number}        price       - Current selling price
 * @property {number|null}   originalPrice - Original price (null if no discount)
 * @property {number|null}   discountPrice - Discounted price (alternative to originalPrice)
 * @property {string}        category    - Product category (electronics|fashion|home|beauty|sports|books)
 * @property {string}        brand       - Brand name
 * @property {string}        image       - Primary product image URL
 * @property {string}        hoverImage  - Alternate image shown on card hover
 * @property {string}        thumbnail   - Small image for lists/cards
 * @property {string[]}      images      - Gallery images array
 * @property {string}        badge       - Badge text (Sale|New|Best Seller|etc.)
 * @property {number}        rating      - Average rating (0-5)
 * @property {number}        reviewsCount - Number of reviews
 * @property {number}        reviews     - Legacy field, same as reviewsCount
 * @property {boolean}       inStock     - Whether product is in stock
 * @property {number|string|null} stock  - Quantity in stock (number, string, or null)
 * @property {boolean}       isNew       - New arrival flag
 * @property {boolean}       isFeatured  - Featured product flag
 * @property {boolean}       newArrival  - New arrival flag (alternative)
 * @property {boolean}       bestSeller  - Best seller flag
 * @property {string[]}      features    - Key features list
 * @property {ProductColor[]} colors     - Available color options
 * @property {string[]}      sizes       - Available size options
 * @property {string[]}      tags        - Product tags for filtering/search
 * @property {string}        createdAt   - ISO date string
 * @property {string}        sellerEmail - Seller's email (empty for admin products)
 */

/**
 * Create a product with default values for missing fields.
 * @param {Partial<Product>} data
 * @returns {Product}
 */
export function createProduct(data) {
  return {
    id:             Date.now(),
    name:           'Untitled Product',
    slug:           'untitled-product',
    shortDescription: '',
    description:    '',
    price:          0,
    originalPrice:  null,
    discountPrice:  null,
    category:       'electronics',
    brand:          '',
    image:          'https://placehold.co/400x400?text=No+Image',
    hoverImage:     null,
    thumbnail:      null,
    images:         [],
    badge:          null,
    rating:         0,
    reviewsCount:   0,
    reviews:        0,
    inStock:        true,
    stock:          null,
    isNew:          false,
    isFeatured:     false,
    newArrival:     false,
    bestSeller:     false,
    features:       [],
    colors:         [],
    sizes:          [],
    tags:           [],
    createdAt:      new Date().toISOString(),
    sellerEmail:    '',
    ...data,
  };
}
