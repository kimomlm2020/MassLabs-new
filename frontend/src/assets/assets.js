import p_img1 from './p_img1.webp'
import p_img2 from './p_img2.jpg'
import p_img3 from './p_img3.jpg'
import p_img4 from './p_img4.jpg'
import p_img5 from './p_img5.jpg'
import p_img6 from './p_img6.jpg'
import p_img7 from './p_img7.jpg'
import p_img8 from './p_img8.jpg'
import p_img9 from './p_img9.jpg'
import p_img10 from './p_img10.jpg'
import p_img11 from './p_img11.png'
import p_img12 from './p_img12.jpg'
import p_img13 from './p_img13.jpg'
import p_img14 from './p_img14.jpg'
import p_img15 from './p_img15.webp'
import p_img16 from './p_img16.jpg'
import p_img17 from './p_img17.jpg'
import p_img18 from './p_img18.jpg'
import p_img19 from './p_img19.jpg'
import p_img20 from './p_img20.jpg'
import p_img21 from './p_img21.jpg'
import p_img22 from './p_img22.jpg'
import p_img23 from './p_img23.jpg'
import p_img24 from './p_img24.jpg'
import p_img25 from './p_img25.jpg'
import p_img26 from './p_img26.jpg'
import p_img27 from './p_img27.jpg'
import p_img28 from './p_img28.webp'
import p_img29 from './p_img29.jpg'
import p_img30 from './p_img30.jpg'
import p_img31 from './p_img31.jpg'
import p_img32 from './p_img32.jpg'
import p_img33 from './p_img33.jpg'
import p_img34 from './p_img34.jpeg'
import p_img35 from './p_img35.jpeg'
import p_img36 from './p_img36.jpg'
import p_img37 from './p_img37.jpg'
import p_img38 from './p_img38.jpeg'
import p_img39 from './p_img39.jpg'
import p_img40 from './p_img40.jpg'
import p_img41 from './p_img41.jpg'
import p_img42 from './p_img42.jpg'
import p_img43 from './p_img43.jpg'
import p_img44 from './p_img44.jpg'
import p_img45 from './p_img45.jpg'
import p_img46 from './p_img46.webp'
import p_img47 from './p_img47.jpg'
import p_img48 from './p_img48.jpg'
import p_img49 from './p_img49.jpg'
import p_img50 from './p_img50.jpg'
import p_img51 from './p_img51.jpg'
import p_img52 from './p_img52.jpg'
import p_img53 from './p_img53.jpg'
import p_img54 from './p_img54.png'
import p_img55 from './p_img55.jpg'
import p_img56 from './p_img56.jpg'
import p_img57 from './p_img57.jpg'
import p_img58 from './p_img58.jpg'
import p_img59 from './p_img59.jpg'
import p_img60 from './p_img60.jpg'



// ==========================================
// ASSETS.JS - Mass Labs Image Assets
// ==========================================

// Home Slider Images
import Alexander from './Alexander.jpg'
import ambitious from './ambitious.jpg'
import karsten from './karsten.jpg'
import victor from './victor.jpg'

// SARMs Guide Page
import SARMs from './SARMs.png'

// Scientific Excellence Features
import authenticity from './authenticity.png'
import discrete_shipping from './discrete_shipping.png'
import quality_lab from './quality_lab.png'
import secure_payment from './secure_payment.png'

// Types of SARMs
import lgd4033 from './LGD_4033.png'
import mk677 from './mk677.png'
import MK_2866 from './MK_2866.jpg'
import RAD_140 from './RAD_140.jpg'
import s23 from './s23.jpg'
import YK_11 from './YK_11.png'

// Contact & About Pages
import Ab_h from './Ab_h.jpg'
import Ab_Lb from './Ab_Lb.jpg'
import Ab_qua from './Ab_qua.jpg'
import Ab_team from './Ab_team.png'
import Cont_h from './Cont_h.jpg'

// Testimonials
import avatar1 from './avatar1.jpg'
import avatar2 from './avatar2.png'
import avatar3 from './avatar3.png'

// UI Icons & Logos
import logo from './logo.png'
import stripe_logo from './stripe_logo.png'

// ==========================================
// EXPORT ALL ASSETS
// ==========================================

export const assets = {
    // UI Elements
    logo,
    stripe_logo,
    
    // Home Slider
    hero: {
        Alexander,
        ambitious,
        karsten,
        victor
    },
    
    // SARMs Guide
    sarms_guide: {
        SARMs
    },
    
    // Scientific Excellence
    features: {
        authenticity,
        discrete_shipping,
        quality_lab,
        secure_payment
    },
    
    // SARM Types
    sarms_types: {
        lgd4033,
        mk677,
        MK_2866,
        RAD_140,
        s23,
        YK_11
    },
    
    // About & Contact
    about_contact: {
        Ab_h,
        Ab_Lb,
        Ab_qua,
        Ab_team,
        Cont_h
    },
    
    // Testimonials
    testimonials: {
        avatar1,
        avatar2,
        avatar3
    }
}

// Export individuel pour imports directs
export {
    // UI
    logo,
    stripe_logo,
    
    // Home Slider
    Alexander,
    ambitious,
    karsten,
    victor,
    
    // SARMs
    SARMs,
    
    // Features
    authenticity,
    discrete_shipping,
    quality_lab,
    secure_payment,
    
    // SARM Types
    lgd4033,
    mk677,
    MK_2866,
    RAD_140,
    s23,
    YK_11,
    
    // About/Contact
    Ab_h,
    Ab_Lb,
    Ab_qua,
    Ab_team,
    Cont_h,
    
    // Testimonials
    avatar1,
    avatar2,
    avatar3
}


export const products = [
    {
        _id: "aaaaa",
        name: "Testosterone Enanthate 250mg/ml",
        description: "Pharmaceutical grade testosterone enanthate. Long-acting ester for sustained release. 10ml multidose vial, lab-tested 98.5% purity.",
        price: 85,
        image: [p_img1],
        category: "Injectables",
        subCategory: "Testosterone",
        date: 1716634345448,
        bestseller: true
    },
    {
        _id: "aaaab",
        name: "Testosterone Cypionate 250mg/ml",
        description: "High-quality testosterone cypionate. Popular for TRT and bulking cycles. Smooth injection, minimal PIP. 10ml vial.",
        price: 87,
        image: [p_img2],
        category: "Injectables",
        subCategory: "Testosterone",
        date: 1716634345449,
        bestseller: true
    },
    {
        _id: "aaaac",
        name: "Testosterone Propionate 100mg/ml",
        description: "Fast-acting testosterone propionate. Short ester for quick results and easy control. 10ml vial, pharmaceutical grade.",
        price: 75,
        image: [p_img3],
        category: "Injectables",
        subCategory: "Testosterone",
        date: 1716634345450,
        bestseller: false
    },
    {
        _id: "aaaad",
        name: "Sustanon 250 250mg/ml",
        description: "Blend of four testosterone esters. Unique pharmacokinetic profile for stable blood levels. 10ml multidose vial.",
        price: 90,
        image: [p_img4],
        category: "Injectables",
        subCategory: "Testosterone",
        date: 1716634345451,
        bestseller: true
    },
    {
        _id: "aaaae",
        name: "Testosterone Mix 400mg/ml",
        description: "High concentration testosterone blend. 400mg/ml for advanced users. Reduced injection volume. 10ml vial.",
        price: 95,
        image: [p_img5],
        category: "Injectables",
        subCategory: "Testosterone",
        date: 1716634345452,
        bestseller: false
    },
    {
        _id: "aaaaf",
        name: "Testosterone Suspension 100mg/ml",
        description: "Pure testosterone in water base. Fastest acting form, pre-workout power. 10ml vial, requires daily administration.",
        price: 80,
        image: [p_img6],
        category: "Injectables",
        subCategory: "Testosterone",
        date: 1716634345453,
        bestseller: false
    },
    {
        _id: "aaaag",
        name: "Testosterone Undecanoate 250mg/ml",
        description: "Longest ester testosterone. Ultra-long half-life, minimal injections needed. 10ml vial, pharmaceutical grade.",
        price: 92,
        image: [p_img7],
        category: "Injectables",
        subCategory: "Testosterone",
        date: 1716634345454,
        bestseller: false
    },
    {
        _id: "aaaah",
        name: "Testosterone Phenylpropionate 100mg/ml",
        description: "Medium-acting testosterone ester. Fast clearance, excellent for cutting cycles. 10ml vial.",
        price: 78,
        image: [p_img8],
        category: "Injectables",
        subCategory: "Testosterone",
        date: 1716634345455,
        bestseller: false
    },
    {
        _id: "aaaai",
        name: "Testosterone Isocaproate 100mg/ml",
        description: "Balanced release profile testosterone. Part of Sustanon formula, available standalone. 10ml vial.",
        price: 76,
        image: [p_img9],
        category: "Injectables",
        subCategory: "Testosterone",
        date: 1716634345456,
        bestseller: false
    },
    {
        _id: "aaaaj",
        name: "Testosterone Decanoate 200mg/ml",
        description: "Very long-acting testosterone. Slow, steady release for extended cycles. 10ml vial, high viscosity oil.",
        price: 88,
        image: [p_img10],
        category: "Injectables",
        subCategory: "Testosterone",
        date: 1716634345457,
        bestseller: false
    },
    {
        _id: "aaaak",
        name: "Testosterone Enanthate 300mg/ml",
        description: "High concentration enanthate. Reduced injection frequency for convenience. 10ml vial, smooth oil carrier.",
        price: 92,
        image: [p_img11],
        category: "Injectables",
        subCategory: "Testosterone",
        date: 1716634345458,
        bestseller: true
    },
    {
        _id: "aaaal",
        name: "Sustanon 350 350mg/ml",
        description: "Enhanced Sustanon blend. Higher concentration for experienced users. 10ml vial, powerful anabolic effects.",
        price: 98,
        image: [p_img12],
        category: "Injectables",
        subCategory: "Testosterone",
        date: 1716634345459,
        bestseller: false
    },

    // ==========================================
    // INJECTABLES - Nandrolone & Boldenone (6 products)
    // ==========================================
    {
        _id: "aaaam",
        name: "Nandrolone Decanoate (Deca) 300mg/ml",
        description: "Classic bulking compound. Excellent joint relief and mass gains. 10ml vial, 300mg/ml concentration.",
        price: 95,
        image: [p_img13],
        category: "Injectables",
        subCategory: "Nandrolone",
        date: 1716634345460,
        bestseller: true
    },
    {
        _id: "aaaan",
        name: "Nandrolone Phenylpropionate (NPP) 100mg/ml",
        description: "Fast-acting nandrolone. Quick clearance, less water retention than Deca. 10ml vial.",
        price: 85,
        image: [p_img14],
        category: "Injectables",
        subCategory: "Nandrolone",
        date: 1716634345461,
        bestseller: false
    },
    {
        _id: "aaaao",
        name: "Boldenone Undecylenate (Equipoise) 300mg/ml",
        description: "Quality lean mass builder. Increases appetite and red blood cell count. 10ml vial, thin oil.",
        price: 90,
        image: [p_img15],
        category: "Injectables",
        subCategory: "Boldenone",
        date: 1716634345462,
        bestseller: true
    },
    {
        _id: "aaaap",
        name: "Boldenone Cypionate 200mg/ml",
        description: "Fast-acting boldenone ester. Shorter half-life than EQ, faster results. 10ml vial.",
        price: 88,
        image: [p_img16],
        category: "Injectables",
        subCategory: "Boldenone",
        date: 1716634345463,
        bestseller: false
    },
    {
        _id: "aaaaq",
        name: "Nandrolone Mix (Deca+NPP) 250mg/ml",
        description: "Blended nandrolone esters. Best of both worlds, fast onset with sustained release. 10ml vial.",
        price: 98,
        image: [p_img17],
        category: "Injectables",
        subCategory: "Nandrolone",
        date: 1716634345464,
        bestseller: false
    },
    {
        _id: "aaaar",
        name: "Boldenone Acetate 100mg/ml",
        description: "Rapid-acting boldenone. Quick peak levels, ideal for shorter cycles. 10ml vial.",
        price: 86,
        image: [p_img18],
        category: "Injectables",
        subCategory: "Boldenone",
        date: 1716634345465,
        bestseller: false
    },

    // ==========================================
    // INJECTABLES - Trenbolone Series (6 products)
    // ==========================================
    {
        _id: "aaaas",
        name: "Trenbolone Acetate 100mg/ml",
        description: "The king of compounds. Fast-acting, dramatic results. Ace requires daily or EOD injections. 10ml vial.",
        price: 110,
        image: [p_img19],
        category: "Injectables",
        subCategory: "Trenbolone",
        date: 1716634345466,
        bestseller: true
    },
    {
        _id: "aaaat",
        name: "Trenbolone Enanthate 200mg/ml",
        description: "Long-acting trenbolone. Twice weekly injections, powerful anabolic effects. 10ml vial, advanced users only.",
        price: 115,
        image: [p_img20],
        category: "Injectables",
        subCategory: "Trenbolone",
        date: 1716634345467,
        bestseller: true
    },
    {
        _id: "aaaau",
        name: "Trenbolone Hexahydrobenzylcarbonate 100mg/ml",
        description: "Parabolan style trenbolone. Medium ester, rare and highly sought after. 10ml vial.",
        price: 125,
        image: [p_img21],
        category: "Injectables",
        subCategory: "Trenbolone",
        date: 1716634345468,
        bestseller: false
    },
    {
        _id: "aaaav",
        name: "Trenbolone Mix (Tri-Tren) 200mg/ml",
        description: "Three ester blend: Ace, Enan, Hex. Immediate and sustained trenbolone release. 10ml vial.",
        price: 120,
        image: [p_img22],
        category: "Injectables",
        subCategory: "Trenbolone",
        date: 1716634345469,
        bestseller: true
    },
    {
        _id: "aaaaw",
        name: "Trenbolone Suspension 50mg/ml",
        description: "Water-based trenbolone. Fastest acting, pre-workout monster dose. 10ml vial, requires shaking.",
        price: 105,
        image: [p_img23],
        category: "Injectables",
        subCategory: "Trenbolone",
        date: 1716634345470,
        bestseller: false
    },
    {
        _id: "aaaax",
        name: "Trenbolone Enanthate 250mg/ml",
        description: "High concentration tren enanthate. Maximum results with reduced injection volume. 10ml vial.",
        price: 125,
        image: [p_img24],
        category: "Injectables",
        subCategory: "Trenbolone",
        date: 1716634345471,
        bestseller: true
    },

    // ==========================================
    // INJECTABLES - DHT Derivatives & Others (6 products)
    // ==========================================
    {
        _id: "aaaay",
        name: "Drostanolone Propionate (Masteron P) 100mg/ml",
        description: "Hardness and definition compound. Anti-estrogenic properties, perfect for cutting. 10ml vial.",
        price: 95,
        image: [p_img25],
        category: "Injectables",
        subCategory: "Masteron",
        date: 1716634345472,
        bestseller: true
    },
    {
        _id: "aaaaz",
        name: "Drostanolone Enanthate (Masteron E) 200mg/ml",
        description: "Long-acting Masteron. Sustained hardening effects, less frequent injections. 10ml vial.",
        price: 105,
        image: [p_img26],
        category: "Injectables",
        subCategory: "Masteron",
        date: 1716634345473,
        bestseller: true
    },
    {
        _id: "aaaba",
        name: "Stanozolol (Winstrol) 50mg/ml",
        description: "Water-based stanozolol injection. Strength and vascularity, dries you out. 10ml vial, milky appearance.",
        price: 85,
        image: [p_img27],
        category: "Injectables",
        subCategory: "Winstrol",
        date: 1716634345474,
        bestseller: false
    },
    {
        _id: "aaabb",
        name: "Methenolone Enanthate (Primobolan) 100mg/ml",
        description: "The safe steroid. Quality lean gains, minimal side effects. 10ml vial, expensive but worth it.",
        price: 140,
        image: [p_img28],
        category: "Injectables",
        subCategory: "Primobolan",
        date: 1716634345475,
        bestseller: true
    },
    {
        _id: "aaabc",
        name: "Oxymetholone (Anadrol) 50mg/ml",
        description: "Injectable Anadrol. Rapid mass and strength gains, powerful bulking agent. 10ml vial.",
        price: 100,
        image: [p_img29],
        category: "Injectables",
        subCategory: "Anadrol",
        date: 1716634345476,
        bestseller: false
    },
    {
        _id: "aaabd",
        name: "Methenolone Acetate (Primobolan) 100mg/ml",
        description: "Short-acting Primobolan. Faster clearance, excellent for female athletes. 10ml vial.",
        price: 135,
        image: [p_img30],
        category: "Injectables",
        subCategory: "Primobolan",
        date: 1716634345477,
        bestseller: false
    },

    // ==========================================
    // ORALS - Tablets & Capsules (8 products)
    // ==========================================
    {
        _id: "aaabe",
        name: "Methandrostenolone (Dianabol) 25mg x 100",
        description: "Classic mass builder. Rapid strength and size gains. 100 tablets, 25mg each. Liver support recommended.",
        price: 70,
        image: [p_img31],
        category: "Orals",
        subCategory: "Dianabol",
        date: 1716634345478,
        bestseller: true
    },
    {
        _id: "aaabf",
        name: "Oxandrolone (Anavar) 10mg x 100",
        description: "Mild but effective. Perfect for cutting and women. 100 tablets, 10mg each. Low hepatotoxicity.",
        price: 120,
        image: [p_img32],
        category: "Orals",
        subCategory: "Anavar",
        date: 1716634345479,
        bestseller: true
    },
    {
        _id: "aaabg",
        name: "Stanozolol (Winstrol) 10mg x 100",
        description: "Hardness and strength oral. Dries out physique, popular pre-contest. 100 tablets, 10mg each.",
        price: 75,
        image: [p_img33],
        category: "Orals",
        subCategory: "Winstrol",
        date: 1716634345480,
        bestseller: true
    },
    {
        _id: "aaabh",
        name: "Oxymetholone (Anadrol) 50mg x 100",
        description: "Most powerful oral bulking agent. Extreme mass and strength. 100 tablets, 50mg each.",
        price: 95,
        image: [p_img34],
        category: "Orals",
        subCategory: "Anadrol",
        date: 1716634345481,
        bestseller: false
    },
    {
        _id: "aaabi",
        name: "Turinabol (Chlorodehydromethyltestosterone) 10mg x 100",
        description: "Lean mass builder. Quality gains without water retention. 100 tablets, 10mg each. East German classic.",
        price: 85,
        image: [p_img35],
        category: "Orals",
        subCategory: "Turinabol",
        date: 1716634345482,
        bestseller: false
    },
    {
        _id: "aaabj",
        name: "Methyltestosterone 25mg x 50",
        description: "Oral testosterone for TRT. Quick androgen boost, sublingual administration. 50 tablets, 25mg each.",
        price: 55,
        image: [p_img36],
        category: "Orals",
        subCategory: "Methyltestosterone",
        date: 1716634345483,
        bestseller: false
    },
    {
        _id: "aaabk",
        name: "Fluoxymesterone (Halotestin) 10mg x 50",
        description: "Extreme strength gains. Aggression and power for strength athletes. 50 tablets, 10mg each. Hepatotoxic.",
        price: 130,
        image: [p_img37],
        category: "Orals",
        subCategory: "Halotestin",
        date: 1716634345484,
        bestseller: false
    },
    {
        _id: "aaabl",
        name: "Methyldrostanolone (Superdrol) 10mg x 100",
        description: "Powerful designer steroid. Rapid lean mass gains, extreme toxicity. 100 tablets, 10mg each. Use with caution.",
        price: 95,
        image: [p_img38],
        category: "Orals",
        subCategory: "Superdrol",
        date: 1716634345485,
        bestseller: true
    },

    // ==========================================
    // SARMs - Selective Androgen Receptor Modulators (8 products)
    // ==========================================
    {
        _id: "aaabm",
        name: "MK-2866 Ostarine 25mg x 60",
        description: "Most researched SARM. Lean muscle preservation, joint healing. 60 capsules, 25mg each. Third party tested.",
        price: 65,
        image: [p_img39],
        category: "SARMs",
        subCategory: "Ostarine",
        date: 1716634345486,
        bestseller: true
    },
    {
        _id: "aaabn",
        name: "LGD-4033 Ligandrol 10mg x 60",
        description: "Bulking SARM. Significant lean mass gains, strength increase. 60 capsules, 10mg each. Requires PCT.",
        price: 75,
        image: [p_img40],
        category: "SARMs",
        subCategory: "Ligandrol",
        date: 1716634345487,
        bestseller: true
    },
    {
        _id: "aaabo",
        name: "RAD-140 Testolone 10mg x 90",
        description: "Most powerful SARM. Steroid-like gains without the side effects. 90 capsules, 10mg each. Research grade.",
        price: 85,
        image: [p_img41],
        category: "SARMs",
        subCategory: "RAD-140",
        date: 1716634345488,
        bestseller: true
    },
    {
        _id: "aaabp",
        name: "MK-677 Ibutamoren 25mg x 60",
        description: "Growth hormone secretagogue. Increases IGF-1, improves sleep and recovery. 60 capsules, 25mg each.",
        price: 80,
        image: [p_img42],
        category: "SARMs",
        subCategory: "Ibutamoren",
        date: 1716634345489,
        bestseller: true
    },
    {
        _id: "aaabq",
        name: "S4 Andarine 50mg x 60",
        description: "Cutting and recomp SARM. Hardness and vascularity, vision side effect possible. 60 capsules, 50mg each.",
        price: 70,
        image: [p_img43],
        category: "SARMs",
        subCategory: "Andarine",
        date: 1716634345490,
        bestseller: false
    },
    {
        _id: "aaabr",
        name: "GW-501516 Cardarine 20mg x 60",
        description: "PPAR delta agonist. Extreme endurance enhancement, fat oxidation. 60 capsules, 20mg each. Not technically a SARM.",
        price: 75,
        image: [p_img44],
        category: "SARMs",
        subCategory: "Cardarine",
        date: 1716634345491,
        bestseller: true
    },
    {
        _id: "aaabs",
        name: "YK-11 Myostatin Inhibitor 5mg x 60",
        description: "Steroidal SARM with myostatin inhibition. Extreme muscle growth potential. 60 capsules, 5mg each.",
        price: 95,
        image: [p_img45],
        category: "SARMs",
        subCategory: "YK-11",
        date: 1716634345492,
        bestseller: false
    },
    {
        _id: "aaabt",
        name: "S-23 20mg x 60",
        description: "Highly suppressive SARM. Male contraceptive studies, muscle hardening. 60 capsules, 20mg each.",
        price: 85,
        image: [p_img46],
        category: "SARMs",
        subCategory: "S-23",
        date: 1716634345493,
        bestseller: false
    },

    // ==========================================
    // PCT & Ancillaries (10 products)
    // ==========================================
    {
        _id: "aaabu",
        name: "Tamoxifen Citrate (Nolvadex) 20mg x 50",
        description: "Selective estrogen receptor modulator. Prevents gynecomastia, essential PCT component. 50 tablets, 20mg each.",
        price: 55,
        image: [p_img47],
        category: "PCT",
        subCategory: "Nolvadex",
        date: 1716634345494,
        bestseller: true
    },
    {
        _id: "aaabv",
        name: "Clomiphene Citrate (Clomid) 50mg x 50",
        description: "Restores natural testosterone production. HPTA restart protocol essential. 50 tablets, 50mg each.",
        price: 60,
        image: [p_img48],
        category: "PCT",
        subCategory: "Clomid",
        date: 1716634345495,
        bestseller: true
    },
    {
        _id: "aaabw",
        name: "Anastrozole (Arimidex) 1mg x 50",
        description: "Aromatase inhibitor. Controls estrogen on cycle, prevents water retention. 50 tablets, 1mg each.",
        price: 90,
        image: [p_img49],
        category: "PCT",
        subCategory: "Arimidex",
        date: 1716634345496,
        bestseller: true
    },
    {
        _id: "aaabx",
        name: "Exemestane (Aromasin) 25mg x 30",
        description: "Suicidal aromatase inhibitor. Destroys estrogen permanently, no rebound. 30 tablets, 25mg each.",
        price: 85,
        image: [p_img50],
        category: "PCT",
        subCategory: "Aromasin",
        date: 1716634345497,
        bestseller: false
    },
    {
        _id: "aaaby",
        name: "HCG (Human Chorionic Gonadotropin) 5000iu",
        description: "Prevents testicular atrophy on cycle. Mimics LH, keeps HPTA functional. 5000iu vial + bacteriostatic water.",
        price: 70,
        image: [p_img51],
        category: "PCT",
        subCategory: "HCG",
        date: 1716634345498,
        bestseller: true
    },
    {
        _id: "aaabz",
        name: "Letrozole (Femara) 2.5mg x 30",
        description: "Strongest aromatase inhibitor. Emergency gyno reversal, aggressive estrogen control. 30 tablets, 2.5mg each.",
        price: 80,
        image: [p_img52],
        category: "PCT",
        subCategory: "Letrozole",
        date: 1716634345499,
        bestseller: false
    },
    {
        _id: "aaaca",
        name: "Cabergoline (Dostinex) 0.5mg x 8",
        description: "Dopamine agonist. Controls prolactin on 19-nor cycles, prevents deca dick. 8 tablets, 0.5mg each.",
        price: 75,
        image: [p_img53],
        category: "PCT",
        subCategory: "Cabergoline",
        date: 1716634345500,
        bestseller: false
    },
    {
        _id: "aaacb",
        name: "Finasteride (Proscar) 5mg x 30",
        description: "5-alpha reductase inhibitor. Prevents DHT conversion, stops hair loss. 30 tablets, 5mg each.",
        price: 45,
        image: [p_img54],
        category: "PCT",
        subCategory: "Finasteride",
        date: 1716634345501,
        bestseller: false
    },
    {
        _id: "aaacc",
        name: "Tadalafil (Cialis) 20mg x 10",
        description: "PDE5 inhibitor. Enhanced pumps, prostate health, and performance. 10 tablets, 20mg each.",
        price: 35,
        image: [p_img55],
        category: "PCT",
        subCategory: "Cialis",
        date: 1716634345502,
        bestseller: true
    },
    {
        _id: "aaacd",
        name: "Sildenafil (Viagra) 100mg x 10",
        description: "PDE5 inhibitor. Immediate performance enhancement, reliable results. 10 tablets, 100mg each.",
        price: 30,
        image: [p_img56],
        category: "PCT",
        subCategory: "Viagra",
        date: 1716634345503,
        bestseller: true
    },

    // ==========================================
    // PEPTIDES & GROWTH FACTORS (4 products)
    // ==========================================
    {
        _id: "aaace",
        name: "HGH Fragment 176-191 5mg",
        description: "Fat loss peptide. Targets stubborn adipose tissue without affecting blood sugar. 5mg vial, lyophilized powder.",
        price: 110,
        image: [p_img57],
        category: "Peptides",
        subCategory: "HGH-Fragment",
        date: 1716634345504,
        bestseller: false
    },
    {
        _id: "aaacf",
        name: "CJC-1295 with DAC 2mg",
        description: "Growth hormone releasing hormone analog. Sustained GH pulse, fat loss and recovery. 2mg vial.",
        price: 95,
        image: [p_img58],
        category: "Peptides",
        subCategory: "CJC-1295",
        date: 1716634345505,
        bestseller: false
    },
    {
        _id: "aaacg",
        name: "Ipamorelin 5mg",
        description: "Growth hormone secretagogue. Clean GH release without cortisol or prolactin increase. 5mg vial.",
        price: 85,
        image: [p_img59],
        category: "Peptides",
        subCategory: "Ipamorelin",
        date: 1716634345506,
        bestseller: false
    },
    {
        _id: "aaach",
        name: "BPC-157 5mg",
        description: "Body protection compound. Accelerated healing, tendon repair, gut health. 5mg vial, oral or injectable.",
        price: 70,
        image: [p_img60],
        category: "Peptides",
        subCategory: "BPC-157",
        date: 1716634345507,
        bestseller: true
    }
]

