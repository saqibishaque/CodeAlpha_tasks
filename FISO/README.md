# FISO — Contemporary Pakistani Art Gallery & E-Commerce Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-black.svg)](https://expressjs.com/)
[![SQLite & Sequelize](https://img.shields.io/badge/Database-SQLite%20%2F%20Sequelize-blue.svg)](https://sequelize.org/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](#)

> **FISO** is an independent, contemporary art gallery e-commerce web platform designed to showcase contemporary Pakistani art, provoke critical thinking, and invite the public to engage with and collect fine art.

---

## Visual Identity & Museum Theme

- **Palette**: Deep Charcoal/Jet Black (`#0C0C0C`), Warm Graphic Yellow (`#FFC700` / `#F5B800`), Crisp Gallery White (`#FBFBFB`), and Muted Slate (`#666666`).
- **Typography**: Editorial headings in *Cormorant Garamond* paired with modern, accessible sans-serif *Plus Jakarta Sans*.
- **Design Philosophy**: Museum-grade negative space, clean borders, high-impact imagery, and fluid responsiveness across 375px+ mobile, tablets, and high-resolution desktop displays.

---

## Core Modules & Features

### 1. Brand Identity & Homepage (`index.html`)
- **Manifesto Hero Section**: Bold statements addressing contemporary Pakistani socio-cultural narratives.
- **Curator's Critique Banner**: Interactive editorial provocation by Principal Curator Raza Ali.
- **Four Curatorial Movements**:
  1. *Modern Miniature* (Wasli & single-hair brush subversions)
  2. *Truck Art Evolution* (Chamakpatti & vehicular pop art)
  3. *Calligraphic Abstraction* (Kinetic lapis lazuli and gold dust)
  4. *Indus Heritage* (5,000-year alluvial terracotta traditions)
- **"Think & Create" Editorial Block**: Dynamic visitor reflection prompts, real-time community interpretations wall, and like/endorsement interactions.

### 2. Filterable Art Catalog (`catalog.html`)
- **Multi-Facet Filters**: Filter by Movement/Category, Regional Provenance (Lahore, Karachi, Islamabad, Swat, Larkana, Peshawar), and Price ceiling range slider.
- **Search & Sort**: Keyword search across titles, artists, mediums, and tags; sort by Price (Low/High), Year, or Title.

### 3. Artwork Detail & Simulated Gallery Wall View (`product.html`)
- **Masterpiece Exhibition Stage**: High-resolution presentation with dimensions, medium specs, and live currency toggle (PKR / USD).
- **Simulated Gallery Wall View Modal**: Shows the artwork hung in a 3D gallery space with directional overhead spotlights, teak float frame, museum parquet floor, and viewing bench for scale reference.
- **Narrative Accordion / Tabs**:
  - *About The Piece* & Artist Biography.
  - *Curator's Critical Statement*.
  - *Specifications & Provenance* (Medium, dimensions, year, framing, archival authenticity certificate).
- **Paired Related Works**: Curatorial recommendations from the same movement.

### 4. Shopping Cart & Multi-Step Checkout (`cart.html` & Slide-Over Drawer)
- **Slide-Over Drawer Cart**: Accessible globally from any page with live counter, quantity adjustment, and subtotal calculation.
- **4-Step Checkout Stepper**:
  - *Step 1: Collection Review*: Items list & subtotal.
  - *Step 2: Delivery Details*: Street address, city, province, contact information.
  - *Step 3: Fine Art Logistics & Payment*: Courier selection (TCS Art Express Insured or Leopard Overnight Freight) + mock payment (Simulated 3D Secure Card, Cash On Delivery, or Direct Bank Wire).
  - *Step 4: Order Confirmation*: Unique order reference (`FISO-2024-XXXX`), fine art courier tracking code, and itemized summary.

### 5. Collector Portal & Dashboard (`login.html`)
- **Collector Authentication**: Registration & login with bcrypt password hashing and JWT cookies / headers.
- **Collector Dashboard**:
  - Past acquisition orders with status indicators (`Confirmed`, `In Transit`, `Delivered`) and courier tracking codes.
  - Private Collector Shortlist (saved favorite artworks).
- **One-Click Demo Credentials**: Instant access buttons for demo collector and curator.

---

## Tech Stack

- **Backend**: Node.js, Express.js (Modular MVC architecture: `controllers`, `routes`, `models`, `middleware`).
- **Database**: SQLite via Sequelize (`database.sqlite`) — zero-configuration single-file database with auto-seeding.
- **Security & Auth**: JWT (`jsonwebtoken`), password hashing (`bcryptjs`), cookie-parser, CORS.
- **Frontend**: Lightweight vanilla HTML5, modern CSS3 (CSS Grid & Flexbox), and modular ES6+ JavaScript.

---

## Project Structure

```
fiso-gallery/
├── config/
│   └── db.js                 # Sequelize SQLite connection & configuration
├── controllers/
│   ├── authController.js     # User registration, login, profile, favorites
│   ├── productController.js  # Catalog filtering, search, detail, metadata
│   ├── orderController.js    # Multi-step checkout order creation & history
│   └── communityController.js# "Think & Create" prompts and visitor critiques
├── middleware/
│   ├── authMiddleware.js     # JWT token verification (mandatory and optional)
│   └── errorHandler.js       # Standardized JSON error response handler
├── models/
│   ├── User.js               # Collector profiles, bcrypt hashing, favorites JSON
│   ├── Product.js            # Artworks, mediums, provenance, critique, prices
│   ├── Order.js              # Order items, courier, tracking, payment mock
│   ├── Interpretation.js     # Visitor reflections & critique endorsements
│   └── index.js              # Model associations & exports
├── routes/
│   ├── authRoutes.js         # /api/auth/*
│   ├── productRoutes.js      # /api/products/*
│   ├── orderRoutes.js        # /api/orders/*
│   └── communityRoutes.js    # /api/community/*
├── public/
│   ├── css/
│   │   └── style.css         # Master stylesheet (Charcoal/Yellow museum theme)
│   ├── js/
│   │   ├── app.js            # Global state, currency toggle (PKR/USD), drawer cart
│   │   ├── catalog.js        # Dynamic filtering, price slider, search, sorting
│   │   ├── product.js        # Artwork detail, simulated gallery wall view modal
│   │   ├── cart.js           # Multi-step checkout state machine & order placement
│   │   └── auth.js           # Login, register, collector dashboard & order tracking
│   ├── images/
│   │   ├── logo.svg          # FISO brand mark
│   │   └── art-1.svg ... 8   # 8 Masterpiece Pakistani contemporary artworks
│   ├── index.html            # Homepage: Hero, Curator's Critique, Think & Create
│   ├── catalog.html          # Filterable catalog with search and facets
│   ├── product.html          # Artwork detail & Simulated Gallery Wall modal
│   ├── cart.html             # Multi-step checkout & Order Confirmation
│   └── login.html            # Collector Portal & Dashboard
├── seed.js                   # 8 diverse Pakistani artworks & demo accounts
├── server.js                 # Express server entry point
├── test/
│   └── verify.js             # Automated end-to-end API test suite
└── package.json
```

---

## Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation
1. Clone repository:
   ```bash
   git clone https://github.com/saqibishaque/CodeAlpha_tasks.git
   cd CodeAlpha_tasks
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Seed the database with 8 curated Pakistani contemporary art pieces:
   ```bash
   node seed.js
   ```
4. Start the application:
   ```bash
   node server.js
   ```
5. Open your browser:
   ```
   http://localhost:3000
   ```

---

## Demo Accounts

| Role | Email | Password | Description |
|---|---|---|---|
| **Patron / Collector** | `collector@fiso.pk` | `collector123` | Has acquisition orders in transit and shortlisted pieces |
| **Curator** | `curator@fiso.pk` | `curator123` | Curatorial board member profile |

---

## Automated Verification Tests

Run the test suite to verify all API endpoints and features:
```bash
npm test
```
Outputs 10/10 automated assertions covering healthcheck, catalog filtering, single product narratives, authentication, order generation, and community critique submissions.

---

## License
ISC &copy; FISO Contemporary Pakistani Art Gallery
