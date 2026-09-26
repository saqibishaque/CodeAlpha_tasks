const { sequelize, User, Product, Order, Interpretation } = require("./models");

const seedDatabase = async () => {
  try {
    console.log("✦ Synchronizing FISO Gallery Database schema...");
    await sequelize.sync({ force: true });

    console.log("✦ Seeding Collector & Curator accounts...");
    const collector = await User.create({
      name: "Amina Bilal",
      email: "collector@fiso.pk",
      password: "collector123",
      role: "collector",
      favorites: "[1, 3]",
    });

    const curator = await User.create({
      name: "Raza Ali",
      email: "curator@fiso.pk",
      password: "curator123",
      role: "curator",
      favorites: "[2, 4]",
    });

    console.log("✦ Seeding Pakistani Contemporary Masterpieces...");
    const productsData = [
      {
        title: "Echoes of the Walled City",
        artist: "Shahzia Rehman",
        artistBio: "Born in Lahore (1988), Shahzia graduated with distinction in Miniature Painting from the National College of Arts (NCA). Her work interrogates the collision of Mughal court aestheticism with post-colonial urban entropy.",
        year: 2024,
        medium: "Opaque Watercolor & 24K Gold Leaf on Handmade Wasli Paper",
        category: "Modern Miniature",
        region: "Lahore",
        dimensions: "18 x 24 in (45.7 x 61 cm)",
        pricePkr: 185000,
        priceUsd: 660,
        stock: 1,
        featured: true,
        aboutPiece: "Executed using single-hair squirrel brushes on four-ply handcrafted wasli paper. Rehman documents the historic gates of Old Lahore—Bhati, Delhi, and Lohari—disrupted by tangled power lines, satellite dishes, and architectural encroachment.",
        criticalStatement: "Miniature was historically the visual propaganda of kings. In this canvas, the sovereign is dead; the city's living, breathing working class and its chaotic infrastructure become the rightful occupants of the sacred golden arch.",
        provenance: "Direct from artist's studio at NCA Lahore. Exhibited at Alhamra Arts Council, 2023.",
        framingStatus: "Archival UV70 Anti-Reflective Museum Glass & Hand-Stained Teak Profile",
        imageUrl: "/images/art-1.svg",
        wallMockupUrl: "/images/art-1.svg",
        tags: JSON.stringify(["Miniature", "Wasli", "Gold Leaf", "Lahore Heritage", "NCA"]),
      },
      {
        title: "Horn Please: Highway Hyper-Realism",
        artist: "Ustad Haider Ali",
        artistBio: "Hailing from a generational lineage of master truck painters in Karachi's Mauripur workshops, Ustad Haider Ali has represented Pakistani folk art globally from the Smithsonian Institution to Venice.",
        year: 2023,
        medium: "Automotive Enamel & Reflective Chamakpatti on Repoussed Sheet Metal",
        category: "Truck Art Evolution",
        region: "Karachi",
        dimensions: "36 x 48 in (91.4 x 121.9 cm)",
        pricePkr: 145000,
        priceUsd: 520,
        stock: 1,
        featured: true,
        aboutPiece: "Crafted on an actual salvaged Bedford truck tailgate panel. Haider Ali layers automotive synthetic lacquers with hand-cut kaleidoscopic vinyl sheeting (chamakpatti) that glows vibrantly under directional light.",
        criticalStatement: "Truck art is Pakistan's roving, roaring, diesel-fueled democracy. When severed from the highway and installed upon the pristine white wall of a gallery, the falcon and the rose cease to be kitsch and demand evaluation as radical indigenous Pop Art.",
        provenance: "FISO Gallery Curatorial Commission 2024, Mauripur Workshop Collective.",
        framingStatus: "Heavy Industrial Matte Black Welded Steel Float Frame",
        imageUrl: "/images/art-2.svg",
        wallMockupUrl: "/images/art-2.svg",
        tags: JSON.stringify(["Truck Art", "Chamakpatti", "Karachi Pop", "Folk Modernism", "Metalwork"]),
      },
      {
        title: "Qalam & Silence",
        artist: "Ismail Gulgee Jr.",
        artistBio: "Carrying forward the lyrical abstraction pioneered by his forebears, Ismail synthesizes classical Islamic calligraphy with gestural action painting, working primarily with unrefined lapis lazuli and gold dust.",
        year: 2024,
        medium: "Oil, Raw Lapis Lazuli Pigment & Heavy Impasto on Linen Canvas",
        category: "Calligraphic Abstraction",
        region: "Islamabad",
        dimensions: "40 x 50 in (101.6 x 127 cm)",
        pricePkr: 320000,
        priceUsd: 1150,
        stock: 1,
        featured: true,
        aboutPiece: "Layers of Badakhshan lapis pigment ground by mortar and pestle produce a hypnotic, deep ultramarine vortex. The golden strokes evoke the divine pen ('Al-Qalam') in an ecstatic, circular kinetic dance.",
        criticalStatement: "The sacred letterform is emancipated from strict semantic orthodoxy. Here, calligraphy becomes a breath, an atmospheric vortex where silence speaks louder than codified syntax.",
        provenance: "Private collection, Sector F-7 Islamabad. Includes artist studio hologram certificate.",
        framingStatus: "Heavyweight Belgian Linen Gallery Wrap (Ready to Hang)",
        imageUrl: "/images/art-3.svg",
        wallMockupUrl: "/images/art-3.svg",
        tags: JSON.stringify(["Calligraphy", "Lapis Lazuli", "Impasto", "Sufism", "Abstract Expressionism"]),
      },
      {
        title: "Mohenjo's Clay Tongue",
        artist: "Sabeen Karim",
        artistBio: "A sculptor and ceramic researcher trained at the Indus Valley School of Art and Architecture (IVS), Sabeen's practice is rooted in archaeological excavations along the lower Indus River basin.",
        year: 2024,
        medium: "Low-Fire Pit Terracotta with River Indus Alluvial Silt Glaze",
        category: "Indus Heritage",
        region: "Larkana",
        dimensions: "20 x 14 x 14 in (50.8 x 35.5 x 35.5 cm)",
        pricePkr: 95000,
        priceUsd: 340,
        stock: 2,
        featured: true,
        aboutPiece: "Hand-coiled using clay dredged directly from the banks of Mohenjo-Daro, smoked in a traditional pit kiln fueled with rice husks. The deliberate thermal crackling mimics drought patterns in contemporary Sindh.",
        criticalStatement: "Five millennia of ceramic consciousness did not perish with the Bronze Age. The earth of Larkana remembers the hands that shaped the Harappan dancing girl. This vessel speaks of unbroken civilizational resilience.",
        provenance: "IVS Faculty Invitational Exhibition, 2024.",
        framingStatus: "Solid Walnut Display Plinth Pedestal with Museum Label Included",
        imageUrl: "/images/art-4.svg",
        wallMockupUrl: "/images/art-4.svg",
        tags: JSON.stringify(["Terracotta", "Indus Valley", "Ceramics", "Sculpture", "Sindh"]),
      },
      {
        title: "Monsoon Over Clifton",
        artist: "Ali Raza",
        artistBio: "A monumental colorist based in Clifton, Karachi. Ali Raza's works capture the friction between the ruthless coastal climate of the Arabian Sea and the megacity's relentless concrete sprawl.",
        year: 2024,
        medium: "Acrylic, Seaview Beach Sand & Marine Varnish on Canvas",
        category: "Contemporary Expressionism",
        region: "Karachi",
        dimensions: "48 x 60 in (121.9 x 152.4 cm)",
        pricePkr: 260000,
        priceUsd: 930,
        stock: 1,
        featured: false,
        aboutPiece: "Real mineral sand gathered from Karachi's Seaview coastline is infused into dense cadmium yellow and stormy slate grey layers. Applied with industrial masonry trowels, creating a weathered, coastal patina.",
        criticalStatement: "Karachi lives in permanent confrontation with the sea. Before the monsoon breaks, the air turns electric with anxiety and salvation. This painting captures that knife-edge equilibrium.",
        provenance: "VM Art Gallery Solo Exhibition, Karachi 2024.",
        framingStatus: "Natural Bleached Ash Floating Strip Frame",
        imageUrl: "/images/art-5.svg",
        wallMockupUrl: "/images/art-5.svg",
        tags: JSON.stringify(["Seascape", "Expressionism", "Karachi", "Textured Canvas", "Palette Knife"]),
      },
      {
        title: "The Weft of Swat",
        artist: "Zohra Bibi",
        artistBio: "Master weaver and matriarch of the Mingora Craft Collective in Swat Valley. Zohra preserves ancient Gandharan textile patterns while incorporating contemporary feminist narratives.",
        year: 2023,
        medium: "Handspun Raw Wool, Wild Madder Dye & Silver Talismanic Assemblage",
        category: "Textile & Fiber",
        region: "Swat",
        dimensions: "30 x 42 in (76.2 x 106.7 cm)",
        pricePkr: 110000,
        priceUsd: 395,
        stock: 1,
        featured: false,
        aboutPiece: "Woven on a traditional pit loom using indigenous sheep wool tinted with walnut hulls and wild madder roots. Antique tribal silver amulets (chandi taweez) are stitched directly into the geometric crests.",
        criticalStatement: "Pashtun needlework is an unwritten feminine archive. In valleys where women's voices were often suppressed, their geometric tapestries documented migration, grief, and matriarchal lineage.",
        provenance: "Swat Craft Preservation Trust & FISO Curatorial Exchange.",
        framingStatus: "Floating Mount in Deep Archival Box Frame with Anti-Glare Acrylic",
        imageUrl: "/images/art-6.svg",
        wallMockupUrl: "/images/art-6.svg",
        tags: JSON.stringify(["Textile", "Swat", "Handwoven", "Tribal Silver", "Folk Art"]),
      },
      {
        title: "Subversive Botanicals: Jasmine & Poppy",
        artist: "Farooq Mirza",
        artistBio: "Farooq Mirza is a botanical artist and researcher at the National Herbarium in Islamabad. His delicate wasli studies merge scientific taxonomy with subversive geopolitical critique.",
        year: 2024,
        medium: "Botanical Watercolor, Natural Plant Extracts & Silver Leaf on Rice Wasli",
        category: "Modern Miniature",
        region: "Islamabad",
        dimensions: "16 x 20 in (40.6 x 50.8 cm)",
        pricePkr: 130000,
        priceUsd: 465,
        stock: 1,
        featured: false,
        aboutPiece: "Features Pakistan's national flower (Chambeli / Jasmine) intertwining with wild Papaver somniferum (opium poppy). Painted with an authentic single-hair cat-whisker brush under high magnification.",
        criticalStatement: "Flora is never politically neutral. By placing the fragrant innocence of Jasmine beside the narcotic shadow of the poppy, this piece interrogates the botanical conquests of colonial empires.",
        provenance: "Rawalpindi Arts Council Masterclass Exhibition.",
        framingStatus: "Smoked Dark Walnut Frame with Double Acid-Free Passe-Partout",
        imageUrl: "/images/art-7.svg",
        wallMockupUrl: "/images/art-7.svg",
        tags: JSON.stringify(["Botanical", "Miniature", "Wasli", "Silver Leaf", "Jasmine"]),
      },
      {
        title: "Fractured Sitar: The Unplayed Raga",
        artist: "Danish Qureshi",
        artistBio: "Sculptor and sound artist from the historic Khyber Bazaar in Peshawar. Danish works with recovered musical instruments and salvaged teak to investigate cultural memory.",
        year: 2024,
        medium: "Reclaimed Teak Sitar Soundboard, Copper Strings & Charcoal",
        category: "Contemporary Expressionism",
        region: "Peshawar",
        dimensions: "32 x 40 in (81.3 x 101.6 cm)",
        pricePkr: 215000,
        priceUsd: 770,
        stock: 1,
        featured: true,
        aboutPiece: "Assembled from a fractured 1950s sitar soundboard sourced from Peshawar's Dabgari Bazaar. The tensioned copper strings cast delicate, shifting linear shadows across a velvety charcoal backboard.",
        criticalStatement: "When music was banned in our streets, the instruments did not die; their resonance merely retreated inward. This wall sculpture is a testament to the indestructible pulse of Eastern classical melody.",
        provenance: "FISO Gallery Commission, Spring 2024.",
        framingStatus: "Minimalist Matte Black Anodized Aluminum Shadow Box",
        imageUrl: "/images/art-8.svg",
        wallMockupUrl: "/images/art-8.svg",
        tags: JSON.stringify(["Sculpture", "Sitar", "Peshawar", "Sound Art", "Reclaimed Wood"]),
      }
    ];

    const createdProducts = await Product.bulkCreate(productsData);
    console.log(`✦ Seeded ${createdProducts.length} curated artworks.`);

    console.log("✦ Seeding Community Critiques & Interpretations...");
    await Interpretation.bulkCreate([
      {
        artworkId: createdProducts[0].id,
        promptTitle: "The Decolonial Gaze in Miniatures",
        authorName: "Khadija Mansoor",
        city: "Lahore",
        interpretationText: "Shahzia's use of real 24K gold foil for the urban telephone wires creates a profound paradox: what society deems as 'unsightly wire chaos' is elevated to sacred illumination.",
        likes: 14,
      },
      {
        artworkId: createdProducts[1].id,
        promptTitle: "Truck Art as Street Sovereignty",
        authorName: "Bilal Tariq",
        city: "Karachi",
        interpretationText: "Seeing Ustad Haider Ali's piece framed inside a fine art space proves that working-class drivers on the Super Highway are curators of Pakistan's most vibrant visual aesthetic.",
        likes: 22,
      },
      {
        artworkId: createdProducts[2].id,
        promptTitle: "Qalam & Silence",
        authorName: "Dr. Tariq Niazi",
        city: "Islamabad",
        interpretationText: "The lapis blue is so deep it feels like looking into the night sky over the Karakoram range. It demands minutes of total quiet before it reveals its rhythmic circular motion.",
        likes: 19,
      }
    ]);

    console.log("✦ Seeding Sample Collector Acquisition Order...");
    await Order.create({
      orderNumber: "FISO-2024-7821",
      userId: collector.id,
      customerName: "Amina Bilal",
      customerEmail: "collector@fiso.pk",
      customerPhone: "+92 300 8421990",
      shippingAddress: JSON.stringify({
        street: "House 42, Street 8, Sector F-6/2",
        city: "Islamabad",
        province: "Federal Territory",
        postalCode: "44000",
        country: "Pakistan",
      }),
      courier: "TCS Art Express (Insured Fine Art Logistics)",
      paymentMethod: "Credit / Debit Card (Simulated 3D Secure)",
      items: JSON.stringify([
        {
          productId: createdProducts[0].id,
          title: createdProducts[0].title,
          artist: createdProducts[0].artist,
          pricePkr: createdProducts[0].pricePkr,
          priceUsd: createdProducts[0].priceUsd,
          quantity: 1,
          imageUrl: createdProducts[0].imageUrl,
        }
      ]),
      subtotalPkr: 185000,
      shippingFeePkr: 0,
      totalPkr: 185000,
      status: "In Transit",
      trackingCode: "TCS-FINEART-94810234",
    });

    console.log("=================================================");
    console.log("✦ FISO GALLERY SEEDING COMPLETED SUCCESSFULLY! ✦");
    console.log("Demo Collector: collector@fiso.pk / collector123");
    console.log("Demo Curator:   curator@fiso.pk   / curator123");
    console.log("=================================================");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seedDatabase();
