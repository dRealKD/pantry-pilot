import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  List,
  TrendingUp,
  Plus,
  Trash2,
  ChevronRight,
  Camera,
  ScanLine,
  Check,
  X,
  Bell,
  BrainCircuit,
  AlertCircle,
  Scale,
  Store,
  Truck,
  Share2,
  Database,
  Settings,
  Loader2,
  RefreshCw,
  User,
  Package,
  ClipboardCheck,
  XCircle,
  Search,
  Copy,
  ArrowDownCircle,
  Clock,
  LogOut,
  Lock,
  Mail,
  FileJson
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCustomToken,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  query,
  orderBy
} from 'firebase/firestore';

// --- CONFIGURATION ---
const VENDORS = ['BigBasket', 'Swiggy Instamart', 'Meatigo', 'Zepto', 'Blinkit', 'Amazon Fresh', 'Blue Tokai', 'Amul'];
const UNITS = ['Kg', 'gm', 'L', 'ml', 'pcs', 'packet', 'loaf', 'bunch', 'bottles'];
const GENERIC_GROCERY_APPS = ['BigBasket', 'Swiggy Instamart', 'Meatigo', 'Zepto', 'Blinkit', 'Amazon Fresh'];
const CATEGORIES = ['Vegetables', 'Fruits', 'Dairy', 'Meat', 'Bakery', 'Grains', 'Cooking', 'Beverages', 'Household'];

// --- MASTER LIST ---
const SEED_ITEMS = [
  { id: 'custom_1764252000001', name: 'Chicken Bites (Boneless)', category: 'Meat', vendor: 'Meatigo', availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 250, unit: 'g' },
  { id: "custom_1764251870502", name: "Olive Oil", category: "Cooking", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 1, unit: "pcs" },
  { id: "custom_1764252000001", name: "Chicken Bites (Boneless)", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 250, unit: "g" },
  { id: "custom_1764252000002", name: "Chicken Soup Pieces (Frozen)", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 500, unit: "g" },
  { id: "custom_1764252000003", name: "Chicken Mince", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 450, unit: "g" },
  { id: "custom_1764252000004", name: "Chicken Curry Cut (Skinless)", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 450, unit: "g" },
  { id: "custom_1764252000005", name: "Chicken Boneless Breast", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: 7, avgDailyConsumption: null, lastQuantity: 1000, lastOrdered: null, orderCount: 0, quantity: 1000, unit: "gm" },
  { id: "custom_1764252000006", name: "Chicken Boneless Thigh", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 450, unit: "g" },
  { id: "custom_1764252000007", name: "Chicken Leg", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 450, unit: "g" },
  { id: "custom_1764252000008", name: "Chicken Thigh (Bone In)", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 450, unit: "g" },
  { id: "custom_1764252000009", name: "Chicken Smoked Ham", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 150, unit: "g" },
  { id: "custom_1764252000010", name: "Chicken Breakfast Sausage", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 200, unit: "g" },
  { id: "custom_1764252000011", name: "Chicken Seekh Kebab", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 500, unit: "g" },
  { id: "custom_1764252000012", name: "Chicken Shammi Kebab", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 200, unit: "g" },
  { id: "custom_1764252000013", name: "Chicken Pepperoni", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 100, unit: "g" },
  { id: "custom_1764252000014", name: "Chicken Galouti Kebab", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 200, unit: "g" },
  { id: "custom_1764252000015", name: "Chicken Breast Bacon", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 200, unit: "g" },
  { id: "custom_1764252000016", name: "Mutton Curry Cut (Rajastan)", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 450, unit: "g" },
  { id: "custom_1764252000017", name: "Mutton Sheekh Kebab", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 500, unit: "g" },
  { id: "custom_1764252000018", name: "Mutton Shammi Kebab", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 200, unit: "g" },
  { id: "custom_1764252000019", name: "Premium Mutton Boneless (Rajasthan)", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 450, unit: "g" },
  { id: "custom_1764252000020", name: "Mutton Mince (Rajasthan)", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 450, unit: "g" },
  { id: "custom_1764252000021", name: "Pork Mince", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 250, unit: "g" },
  { id: "custom_1764252000022", name: "Breakfast Bacon", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 300, unit: "g" },
  { id: "custom_1764252000023", name: "Streaky Bacon", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 150, unit: "g" },
  { id: "custom_1764252000024", name: "Premium Pork Pepperoni", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 100, unit: "g" },
  { id: "custom_1764252000025", name: "Pork Smoked Ham", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 200, unit: "g" },
  { id: "custom_1764252000026", name: "Double Smoked Pork Ham", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 150, unit: "g" },
  { id: "custom_1764252131898", name: "Potato", category: "Vegetables", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 1, unit: "pcs" },
  { id: "custom_1764252139792", name: "Onions", category: "Vegetables", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 1, unit: "pcs"},
  { id: "custom_1764252156458", name: "Bhindi", category: "Vegetables", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 1, unit: "pcs" },
  { id: "custom_1764252165935", name: "Turya", category: "Vegetables", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 1, unit: "pcs" },
  { id: "custom_1764252187889", name: "Corriander", category: "Vegetables", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 1, unit: "pcs" },
  { id: "custom_1764252202350", name: "Mint", category: "Vegetables", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 1, unit: "pcs" },
  { id: "custom_1764252219756", name: "Eggs", category: "Dairy", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 1, unit: "pcs" },
  { id: "custom_1764252230190", name: "Cauliflower", category: "Vegetables", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 1, unit: "pcs" },
  { id: "custom_1764252319680", name: "French Beans", category: "Vegetables", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 1, unit: "pcs" },
  { id: "custom_1764252330431", name: "Brinjal", category: "Vegetables", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 1, unit: "pcs" },
  { id: "custom_1764252347211", name: "Garlic", category: "Vegetables", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 1, unit: "pcs"},
  { id: "custom_1764252354415", name: "Ginger", category: "Vegetables", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 1, unit: "pcs" },
  { id: "custom_1764252680079", name: "Bread", category: "Bakery", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 1, unit: "pcs" },
  { id: "custom_1764252691434", name: "Tomatoes", category: "Vegetables", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 1, unit: "pcs" },
  { id: "custom_1764252723897", name: "Methi", category: "Vegetables", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 1, unit: "pcs" },
  { id: "custom_1764252736590", name: "Spinach", category: "Vegetables", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 1, unit: "pcs" },
  { id: "custom_1764425171848", name: "Green Chillies", category: "Vegetables", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 1, unit: "pcs" },
  { id: "custom_1764425226706", name: "Rice", category: "Grains", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 1, unit: "pcs" },
  { id: "custom_1764425274023", name: "Moong Daal", category: "Grains", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 1, unit: "pcs" },
  { id: "custom_1764730128098", name: "Toilet Tissue Paper Roll", category: "Household", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: 7, avgDailyConsumption: null, lastQuantity: 18, lastOrdered: null, orderCount: 0, quantity: 18, unit: "pcs" },
  { id: "custom_1764730284339", name: "Dishwash Liquid Gel", category: "Household", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: 7, avgDailyConsumption: null, lastQuantity: 500, lastOrdered: null, orderCount: 0, quantity: 500, unit: "ml" },
  { id: "custom_1764730340120", name: "Butter", category: "Dairy", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: 7, avgDailyConsumption: null, lastQuantity: 100, lastOrdered: null, orderCount: 0, quantity: 100, unit: "gm" },
  { id: "custom_1764730380551", name: "Cheese Cubes", category: "Dairy", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: 7, avgDailyConsumption: null, lastQuantity: 200, lastOrdered: null, orderCount: 0, quantity: 200, unit: "gm" },
  { id: "custom_1764730461300", name: "Phool Makhana", category: "Bakery", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: 7, avgDailyConsumption: null, lastQuantity: 200, lastOrdered: null, orderCount: 0, quantity: 200, unit: "gm" },
  { id: "custom_1764730500021", name: "Raisins", category: "Fruits", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: 7, avgDailyConsumption: null, lastQuantity: 200, lastOrdered: null, orderCount: 0, quantity: 200, unit: "gm" },
  { id: "custom_1764730534880", name: "Almonds", category: "Fruits", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: 7, avgDailyConsumption: null, lastQuantity: 500, lastOrdered: null, orderCount: 0, quantity: 500, unit: "gm" },
  { id: "custom_1764730545424", name: "Cashew Nuts", category: "Fruits", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: 7, avgDailyConsumption: null, lastQuantity: 500, lastOrdered: null, orderCount: 0, quantity: 500, unit: "gm" },
  { id: "custom_1764730619866", name: "Sanitary Pads", category: "Household", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: 7, avgDailyConsumption: null, lastQuantity: 28, lastOrdered: null, orderCount: 0, quantity: 28, unit: "pcs" },
  { id: "custom_1764730695585", name: "Floor Surface Liquid", category: "Household", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: 7, avgDailyConsumption: null, lastQuantity: 500, lastOrdered: null, orderCount: 0, quantity: 500, unit: "ml" },
  { id: "custom_1764746929789", name: "Testing 2", category: "Beverages", vendor: "BigBasket", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: 7, avgDailyConsumption: null, lastQuantity: 2, lastOrdered: null, orderCount: 0, quantity: 2, unit: "L" },
  { id: "custom_1764771538857", name: "Classic French Ham", category: "Meat", vendor: "Meatigo", availableVendors: GENERIC_GROCERY_APPS, frequencyDays: 7, avgDailyConsumption: null, lastQuantity: 100, lastOrdered: null, orderCount: 0, quantity: 100, unit: "gm" },
];

// --- FIREBASE INIT ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  apiKey: "AIzaSyCzvNJ03g-VqQ7TJnh-qlPs1Y0IoLgE8k0",
  authDomain: "mypantrypilot-ed34b.firebaseapp.com",
  projectId: "mypantrypilot-ed34b",
  storageBucket: "mypantrypilot-ed34b.firebasestorage.app",
  messagingSenderId: "440159001492",
  appId: "1:440159001492:web:cf993628cf44f053218d81",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- LOGIC HELPERS ---
const normalizeQuantity = (qty, unit) => {
  if (!qty) return 0;
  const val = parseFloat(qty);
  if (isNaN(val)) return 0;
  const u = unit ? unit.toLowerCase() : '';
  if (u.includes('kg') || u.includes('ltr')) return val * 1000;
  if (u.includes('gm') || u.includes('ml')) return val;
  return val;
};

// --- AUTH COMPONENT ---
const AuthView = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error("Auth error", err);
      let msg = "Authentication failed.";
      if (err.code === 'auth/invalid-credential') msg = "Invalid email or password.";
      if (err.code === 'auth/email-already-in-use') msg = "Email already registered. Try logging in.";
      if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Google Auth error", err);
      setError("Google Sign-In failed. Check your internet or popup blocker.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-indigo-200">P</div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-center text-gray-500 mb-8 text-sm">Sync your pantry across all your devices.</p>

        <button onClick={handleGoogleLogin} disabled={loading} className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-all flex justify-center items-center mb-4">
           <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
           Sign in with Google
        </button>

        <div className="flex items-center mb-4">
           <div className="flex-1 border-t border-gray-200"></div>
           <span className="px-3 text-gray-400 text-xs">OR WITH EMAIL</span>
           <div className="flex-1 border-t border-gray-200"></div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="name@example.com" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="••••••••" required />
            </div>
          </div>
          {error && <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg flex items-start"><AlertCircle className="w-4 h-4 mr-2 shrink-0" /> {error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-70 flex justify-center items-center mt-4">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm text-indigo-600 font-semibold hover:underline">
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- STABLE COMPONENTS ---
const PantryView = ({ items, cart, isLoading, dbError, hasNewItems, onAddCustom, onSync, onAddToCart, onRemoveFromCart, onManualReceive, onNotDelivered }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredItems = items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const orderedItems = filteredItems.filter(item => item.isOrdered);
  const regularItems = filteredItems.filter(item => !item.isOrdered);
  const groupedItems = regularItems.reduce((acc, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});
  const sortedCategories = Object.keys(groupedItems).sort();

  return (
    <div className="space-y-4 pb-20">
      <div className="flex justify-between items-center mb-2 px-1">
         <h1 className="text-2xl font-bold text-gray-900">My Pantry</h1>
         <button onClick={onAddCustom} className="text-indigo-600 text-sm font-semibold">+ Custom Item</button>
      </div>

      {hasNewItems && !isLoading && (
          <button onClick={onSync} className="w-full bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-center justify-between text-blue-700 mb-2 shadow-sm animate-pulse">
              <div className="flex items-center"><ArrowDownCircle className="w-5 h-5 mr-2" /><span className="text-sm font-bold">New items available from Master List</span></div>
              <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-bold">Sync Now</span>
          </button>
      )}

      <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center shadow-sm mb-4">
        <Search className="w-5 h-5 text-gray-400 mr-2" />
        <input type="text" placeholder="Search items..." className="flex-1 outline-none text-gray-700 placeholder-gray-400" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
        {searchQuery && <button onClick={() => setSearchQuery('')}><X className="w-4 h-4 text-gray-400" /></button>}
      </div>

      {dbError && <div className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-xl mb-4 text-xs"><p className="font-bold flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> Connection Error</p><p>{dbError}</p></div>}

      {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" /><p className="text-gray-500">Syncing with cloud...</p></div>
      ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4"><Database className="w-8 h-8 text-indigo-500" /></div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Pantry is Empty</h3>
              <p className="text-gray-500 text-sm mb-6">Load the standard list to get started.</p>
              <button onClick={onSync} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 transition-colors flex items-center justify-center"><RefreshCw className="w-5 h-5 mr-2" /> Load Standard Items</button>
          </div>
      ) : (
      <div className="space-y-6">
          {/* ORDERED ITEMS */}
          {orderedItems.length > 0 && (
              <div>
                  <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2 ml-1 flex items-center"><Clock className="w-4 h-4 mr-1" /> On the Way</h3>
                  <div className="bg-blue-50/50 rounded-2xl shadow-sm border border-blue-100 overflow-hidden divide-y divide-blue-100">
                      {orderedItems.map(item => (
                          <div key={item.id} className="p-4 flex items-center justify-between bg-white">
                              <div className="flex items-center">
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg mr-3 bg-blue-100 text-blue-600"><Truck className="w-5 h-5" /></div>
                                  <div><div className="text-sm font-bold text-gray-800">{item.name}</div><div className="text-xs flex items-center text-blue-600 font-medium">{item.vendor} • On the Way</div></div>
                              </div>
                              <div className="flex items-center gap-2">
                                  <button onClick={() => onNotDelivered(item.id)} className="text-red-500 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors"><XCircle className="w-4 h-4" /></button>
                                  <button onClick={() => onManualReceive(item)} className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center hover:bg-blue-100 transition-colors"><ClipboardCheck className="w-4 h-4 mr-1" /> Received?</button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}
          {/* REGULAR CATEGORIES */}
          {sortedCategories.map(category => (
              <div key={category}>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{category}</h3>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                      {groupedItems[category].sort((a, b) => a.name.localeCompare(b.name)).map(item => {
                              const isInCart = cart.find(c => c.id === item.id);
                              return (
                                  <div key={item.id} className={`p-4 flex items-center justify-between transition-colors ${item.isOverdue ? 'bg-red-50' : 'bg-white'}`}>
                                  <div className="flex items-center">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mr-3 ${item.isOverdue ? 'bg-red-100 text-red-600' : item.hasPattern ? 'bg-indigo-50 text-gray-800' : 'bg-gray-100 text-gray-400'}`}>
                                      {item.isOverdue ? <AlertCircle className="w-5 h-5" /> : item.hasPattern ? '🧠' : '❔'}
                                      </div>
                                      <div>
                                      <div className={`text-sm font-bold ${item.isOverdue ? 'text-red-700' : 'text-gray-700'}`}>{item.name}</div>
                                      <div className={`text-xs flex items-center ${item.isOverdue ? 'text-red-500' : 'text-gray-400'}`}>{item.vendor} • {item.hasPattern ? <span className="ml-1 font-medium">Last: {item.daysSinceLastOrder}d</span> : <span className="ml-1">Learning... ({item.orderCount} orders)</span>}</div>
                                      </div>
                                  </div>
                                  {isInCart ? (
                                      <div className="flex items-center gap-2">
                                          <div className="text-emerald-500 font-medium text-sm flex items-center bg-emerald-50 px-3 py-1.5 rounded-lg"><Check className="w-4 h-4 mr-1" /> Added</div>
                                          <button onClick={() => onRemoveFromCart(item.id)} className="bg-gray-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                                      </div>
                                  ) : (
                                      <button onClick={() => onAddToCart(item)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${item.isOverdue ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>Add</button>
                                  )}
                                  </div>
                              );
                          })
                      }
                  </div>
              </div>
          ))}
      </div>
      )}
    </div>
  );
};

// 2. Pending Orders Modal
const PendingOrdersModal = ({ items, onCancel, onManualReceive, onNotDelivered }) => {
    const orderedItems = items.filter(i => i.isOrdered);
    return (
        <div className="absolute inset-0 bg-black/50 z-[70] flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full rounded-2xl p-6 shadow-xl animate-slide-up max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center"><Truck className="w-6 h-6 text-blue-600 mr-2"/> Pending Deliveries</h2>
                    <button onClick={onCancel} className="bg-gray-100 p-2 rounded-full"><X className="w-5 h-5 text-gray-600" /></button>
                </div>
                <div className="overflow-y-auto custom-scrollbar flex-1 space-y-3">
                    {orderedItems.length === 0 ? <p className="text-center text-gray-500 py-8">No items currently on the way.</p> : orderedItems.map(item => (
                        <div key={item.id} className="p-4 border border-blue-100 bg-blue-50/30 rounded-xl flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div><div className="font-bold text-gray-800">{item.name}</div><div className="text-xs text-gray-500">{item.vendor}</div></div>
                                <div className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">Ordered</div>
                            </div>
                            <div className="flex gap-2 pt-2 border-t border-blue-100/50">
                                <button onClick={() => onNotDelivered(item.id)} className="flex-1 py-2 bg-white border border-gray-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50">Not Delivered</button>
                                <button onClick={() => onManualReceive(item)} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">Confirm Receipt</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AddToCartModal = ({ item, config, setConfig, onCancel, onConfirm }) => (
    <div className="absolute inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
        <div className="bg-white w-full rounded-2xl p-6 shadow-xl animate-slide-up">
            <h2 className="text-xl font-bold mb-1 text-gray-800">Add to List</h2>
            <p className="text-sm text-gray-500 mb-6">Confirm details for <span className="font-semibold text-gray-900">{item?.name}</span></p>

            <div className="space-y-6">
                <div><label className="flex items-center text-xs font-bold text-gray-500 uppercase mb-2"><Scale className="w-3 h-3 mr-1" /> Packet Size</label><div className="flex gap-3"><div className="flex-1 relative"><button onClick={() => setConfig({...config, packetSize: Math.max(0.5, config.packetSize - 0.5)})} className="absolute left-2 top-2 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-bold hover:bg-gray-200">-</button><input type="number" value={config.packetSize} onChange={(e) => setConfig({...config, packetSize: parseFloat(e.target.value) || 0})} className="w-full p-3 text-center font-bold text-gray-800 bg-gray-50 rounded-xl border border-gray-200"/><button onClick={() => setConfig({...config, packetSize: config.packetSize + 0.5})} className="absolute right-2 top-2 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-bold hover:bg-gray-200">+</button></div><div className="w-1/3"><select value={config.unit} onChange={(e) => setConfig({...config, unit: e.target.value})} className="w-full h-full p-3 font-medium bg-gray-50 rounded-xl border border-gray-200 text-center appearance-none">{UNITS.map(u => <option key={u} value={u}>{u}</option>)}</select></div></div></div>
                <div><label className="flex items-center text-xs font-bold text-gray-500 uppercase mb-2"><Package className="w-3 h-3 mr-1" /> Number of Packs</label><div className="flex gap-3 items-center"><div className="flex-1 relative"><button onClick={() => setConfig({...config, packCount: Math.max(1, config.packCount - 1)})} className="absolute left-2 top-2 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-bold hover:bg-gray-200">-</button><input type="number" value={config.packCount} onChange={(e) => setConfig({...config, packCount: parseInt(e.target.value) || 1})} className="w-full p-3 text-center font-bold text-gray-800 bg-gray-50 rounded-xl border border-gray-200"/><button onClick={() => setConfig({...config, packCount: config.packCount + 1})} className="absolute right-2 top-2 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-bold hover:bg-gray-200">+</button></div></div></div>
                <div><label className="flex items-center text-xs font-bold text-gray-500 uppercase mb-2"><Store className="w-3 h-3 mr-1" /> Select Store</label><div className="grid grid-cols-2 gap-2">{(item?.availableVendors || VENDORS).map(v => (<button key={v} onClick={() => setConfig({...config, vendor: v})} className={`p-3 rounded-xl border text-sm font-medium transition-all text-left flex items-center justify-between ${config.vendor === v ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>{v} {config.vendor === v && <Check className="w-4 h-4" />}</button>))}</div></div>
            </div>
            <div className="flex gap-3 mt-8">
                <button onClick={onCancel} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={onConfirm} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors">Add to List</button>
            </div>
        </div>
    </div>
  );

  const ReceiveModal = ({ item, config, setConfig, onCancel, onConfirm }) => (
    <div className="absolute inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
        <div className="bg-white w-full rounded-2xl p-6 shadow-xl animate-slide-up">
            <h2 className="text-xl font-bold mb-1 text-gray-800">Confirm Receipt</h2>
            <p className="text-sm text-gray-500 mb-6">Verify what actually arrived for <span className="font-semibold text-gray-900">{item?.name}</span></p>

            <div className="space-y-6">
                <div>
                    <label className="flex items-center text-xs font-bold text-gray-500 uppercase mb-2"><Scale className="w-3 h-3 mr-1" /> Packet Size (Received)</label>
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <button onClick={() => setConfig({...config, packetSize: Math.max(0.5, config.packetSize - 0.5)})} className="absolute left-2 top-2 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-bold hover:bg-gray-200">-</button>
                            <input type="number" value={config.packetSize} onChange={(e) => setConfig({...config, packetSize: parseFloat(e.target.value) || 0})} className="w-full p-3 text-center font-bold text-gray-800 bg-gray-50 rounded-xl border border-gray-200"/>
                            <button onClick={() => setConfig({...config, packetSize: config.packetSize + 0.5})} className="absolute right-2 top-2 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-bold hover:bg-gray-200">+</button>
                        </div>
                        <div className="w-1/3">
                            <select value={config.unit} onChange={(e) => setConfig({...config, unit: e.target.value})} className="w-full h-full p-3 font-medium bg-gray-50 rounded-xl border border-gray-200 text-center appearance-none">{UNITS.map(u => <option key={u} value={u}>{u}</option>)}</select>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="flex items-center text-xs font-bold text-gray-500 uppercase mb-2"><Package className="w-3 h-3 mr-1" /> Packs Received</label>
                    <div className="flex gap-3 items-center">
                        <div className="flex-1 relative">
                            <button onClick={() => setConfig({...config, packCount: Math.max(1, config.packCount - 1)})} className="absolute left-2 top-2 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-bold hover:bg-gray-200">-</button>
                            <input type="number" value={config.packCount} onChange={(e) => setConfig({...config, packCount: parseInt(e.target.value) || 1})} className="w-full p-3 text-center font-bold text-gray-800 bg-gray-50 rounded-xl border border-gray-200"/>
                            <button onClick={() => setConfig({...config, packCount: config.packCount + 1})} className="absolute right-2 top-2 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-bold hover:bg-gray-200">+</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 mt-8">
                <button onClick={onCancel} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={onConfirm} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors">Confirm</button>
            </div>
        </div>
    </div>
  );

  const ScanView = () => (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
       <button onClick={() => setIsScanning(false)} className="absolute top-4 right-4 text-white z-50 p-2 bg-gray-800/50 rounded-full">
         <X className="w-6 h-6" />
       </button>
       {scanStep === 'camera' && (
           <div className="flex-1 flex flex-col items-center justify-center relative">
               <div className="w-full h-full absolute inset-0 bg-gray-900">
                   <div className="w-full h-full flex items-center justify-center opacity-30">
                       <p className="text-white text-lg">Camera Feed</p>
                   </div>
               </div>
               <div className="w-64 h-80 border-2 border-emerald-500 rounded-lg relative z-10 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-emerald-500 absolute top-0 animate-scan"></div>
               </div>
               <p className="text-white mt-8 z-10 bg-black/50 px-4 py-2 rounded-full">Align receipt within frame</p>
               <button onClick={() => { setScanStep('processing'); setTimeout(() => { setScannedData([]); setScanStep('review'); }, 2000); }} className="absolute bottom-10 w-16 h-16 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center">
                   <div className="w-12 h-12 bg-emerald-600 rounded-full"></div>
               </button>
           </div>
       )}
       {scanStep === 'processing' && (
           <div className="flex-1 flex flex-col items-center justify-center bg-gray-900">
               <ScanLine className="w-16 h-16 text-emerald-500 animate-pulse mb-4" />
               <h2 className="text-xl font-bold text-white">Learning Patterns...</h2>
           </div>
       )}
       {scanStep === 'review' && (
           <div className="flex-1 bg-gray-50 flex flex-col">
               <div className="bg-white p-4 border-b border-gray-200 shadow-sm mt-12 rounded-t-2xl flex-1">
                   <h2 className="text-xl font-bold text-gray-800 mb-1">Receipt Processed</h2>
                   <p className="text-sm text-gray-500 mb-6">We'll update your usage frequency based on this.</p>
                   <div className="space-y-4">
                       {scannedData.map((data, idx) => (
                           <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-white">
                               <div className="flex justify-between items-start mb-2">
                                   <div className="font-semibold text-gray-800">{data.name}</div>
                                   <div className="flex items-center text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded">
                                       <BrainCircuit className="w-3 h-3 mr-1" /> Pattern Updated
                                   </div>
                               </div>
                               <div className="flex items-center space-x-4 text-sm">
                                   <div className="text-gray-600">Confirmed: <strong>{data.detectedQty} {data.detectedUnit}</strong></div>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
               <div className="p-4 bg-white border-t border-gray-200">
                   <button onClick={() => { setIsScanning(false); }} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-emerald-200">
                       Done
                   </button>
               </div>
           </div>
       )}
    </div>
  );

// --- MAIN COMPONENT ---

export default function GroceryApp() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('pantry');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState(null);
  const [hasNewItems, setHasNewItems] = useState(false);

  // UI States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddToCartModalOpen, setIsAddToCartModalOpen] = useState(false);
  const [itemToAdd, setItemToAdd] = useState(null);
  const [isPendingOrdersModalOpen, setIsPendingOrdersModalOpen] = useState(false);

  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [itemToReceive, setItemToReceive] = useState(null);
  const [receiveConfig, setReceiveConfig] = useState({ packCount: 1, packetSize: 1, unit: 'pcs' });
  const [addConfig, setAddConfig] = useState({ packCount: 1, packetSize: 1, unit: 'pcs', vendor: '' });

  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('camera');
  const [scannedData, setScannedData] = useState([]);
  const [showNotification, setShowNotification] = useState(false);

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Vegetables',
    vendor: 'BigBasket',
    frequencyDays: 7,
    quantity: 1,
    unit: 'pcs'
  });

  const orderedItemsCount = useMemo(() => items.filter(i => i.isOrdered).length, [items]);

  // --- AUTH ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        }
        // No auto-login as per request. AuthView handles explicit login.
      } catch (e) {
        console.error("Auth Error:", e);
        setDbError(`Authentication Failed: ${e.message}`);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.isAnonymous) {
        // Enforce strict login: Logout if anonymous
        signOut(auth).catch(console.error);
        setUser(null);
      } else {
        setUser(currentUser);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- SYNC & CHECK UPDATES ---
  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    setDbError(null);

    const pantryRef = collection(db, 'artifacts', appId, 'users', user.uid, 'pantry');
    const unsubscribePantry = onSnapshot(pantryRef, (snapshot) => {
      const fetchedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(fetchedItems);
      setIsLoading(false);

      const missingCount = SEED_ITEMS.filter(seedItem => {
          return !fetchedItems.some(i => (i.name || '').toLowerCase() === seedItem.name.toLowerCase());
      }).length;
      setHasNewItems(missingCount > 0);

    }, (error) => {
      setDbError(`Database Error: ${error.message}`);
      setIsLoading(false);
    });

    const cartRef = collection(db, 'artifacts', appId, 'users', user.uid, 'cart');
    const unsubscribeCart = onSnapshot(cartRef, (snapshot) => {
      const fetchedCart = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCart(fetchedCart);
    }, (error) => console.error("Cart error:", error));

    return () => {
      unsubscribePantry();
      unsubscribeCart();
    };
  }, [user]);

  // --- AUTO CLEANUP ---
  useEffect(() => {
    if (!user || items.length === 0) return;
    const checkAutoReceive = () => {
        const now = new Date();
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        const itemsToAutoReceive = items.filter(item => item.isOrdered && item.orderPlacedAt && (now - new Date(item.orderPlacedAt) > ONE_DAY_MS));
        if (itemsToAutoReceive.length === 0) return;
        const batch = writeBatch(db);
        itemsToAutoReceive.forEach(item => {
             const stats = calculateReceivedStats(item, now, item.quantity, item.unit);
             const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'pantry', item.id);
             batch.update(docRef, stats);
        });
        batch.commit().catch(e => console.error("Cleanup failed", e));
    };
    const interval = setInterval(checkAutoReceive, 60000);
    checkAutoReceive();
    return () => clearInterval(interval);
  }, [items, user]);

  // --- LOGIC ---
  const calculateReceivedStats = (item, receiveDate, receivedQty, receivedUnit) => {
    let newAvgRate = item.avgDailyConsumption;
    let newOrderCount = (item.orderCount || 0) + 1;
    const normReceivedQty = normalizeQuantity(receivedQty, receivedUnit);
    const normLastQty = item.lastQuantity ? normalizeQuantity(item.lastQuantity, item.lastUnit) : normReceivedQty;

    if (item.lastOrdered) {
        const lastDate = new Date(item.lastOrdered);
        const diffTime = Math.abs(receiveDate - lastDate);
        const daysBetween = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        const observedRate = normLastQty / daysBetween;
        if (!item.avgDailyConsumption) newAvgRate = observedRate;
        else newAvgRate = (item.avgDailyConsumption * 0.7) + (observedRate * 0.3);
    }
    const estimatedDays = newAvgRate && newAvgRate > 0 ? Math.ceil(normReceivedQty / newAvgRate) : (item.frequencyDays || 7);

    return {
        lastOrdered: receiveDate.toISOString(),
        lastQuantity: receivedQty,
        lastUnit: receivedUnit,
        avgDailyConsumption: newAvgRate,
        frequencyDays: estimatedDays,
        orderCount: newOrderCount,
        isOrdered: false,
        orderPlacedAt: null,
        orderedPackCount: null,
        orderedPacketSize: null
    };
  };

  const processedItems = useMemo(() => {
    const today = new Date();
    const enrichedItems = items.map(item => {
      if (item.isOrdered) return { ...item, daysSinceLastOrder: 0, stockStatus: 'On the Way', urgencyRatio: -1, isOverdue: false, hasPattern: true };
      if (!item.lastOrdered) return { ...item, daysSinceLastOrder: 0, stockStatus: 'New', urgencyRatio: 0, isOverdue: false, hasPattern: false };

      const lastOrder = new Date(item.lastOrdered);
      const diffTime = Math.abs(today - lastOrder);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let percentConsumed = 0;
      let predictedDuration = 0;

      if (item.avgDailyConsumption && item.lastQuantity) {
          const normLastQty = normalizeQuantity(item.lastQuantity, item.lastUnit);
          predictedDuration = normLastQty / item.avgDailyConsumption;
          percentConsumed = diffDays / predictedDuration;
      } else if (item.frequencyDays) {
          predictedDuration = item.frequencyDays;
          percentConsumed = diffDays / item.frequencyDays;
      }

      let stockStatus = 'High';
      if (percentConsumed >= 1.1) stockStatus = 'Critical';
      else if (percentConsumed >= 0.8) stockStatus = 'Low';
      else stockStatus = 'Good';

      return {
        ...item, daysSinceLastOrder: diffDays, stockStatus, urgencyRatio: percentConsumed, predictedDuration: Math.round(predictedDuration), isOverdue: percentConsumed >= 1.0, hasPattern: !!item.lastOrdered
      };
    });

    return enrichedItems.sort((a, b) => {
        if (a.isOrdered && !b.isOrdered) return 1;
        if (!a.isOrdered && b.isOrdered) return -1;
        if (a.hasPattern && !b.hasPattern) return -1;
        if (!a.hasPattern && b.hasPattern) return 1;
        if (a.hasPattern && b.hasPattern) return b.urgencyRatio - a.urgencyRatio;
        return b.daysSinceLastOrder - a.daysSinceLastOrder;
    });
  }, [items]);

  const suggestions = processedItems.filter(item => !item.isOrdered && item.hasPattern && item.urgencyRatio >= 0.8);

  // --- ACTIONS ---
  const initiateAddToCart = (item) => {
    if (cart.find(c => c.id === item.id)) return;
    setItemToAdd(item);
    setAddConfig({ packCount: 1, packetSize: item.quantity || 1, unit: item.unit || 'pcs', vendor: item.vendor || 'BigBasket' });
    setIsAddToCartModalOpen(true);
  };

  const confirmAddToCart = async () => {
    if (!itemToAdd || !user) return;
    const totalQty = addConfig.packetSize * addConfig.packCount;
    const finalItem = { ...itemToAdd, packCount: addConfig.packCount, packetSize: addConfig.packetSize, unit: addConfig.unit, vendor: addConfig.vendor, quantity: totalQty };
    try {
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'cart', finalItem.id), finalItem);
        setIsAddToCartModalOpen(false);
        setItemToAdd(null);
    } catch (e) { alert(`Error: ${e.message}`); }
  };

  const removeFromCart = async (itemId) => {
    if (!user) return;
    try { await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'cart', itemId)); }
    catch (e) { console.error("Error removing", e); }
  };

  const handleCreateNewItem = async () => {
    if (!user) return alert("Not authenticated.");
    if (!newItem.name || newItem.name.trim().length === 0) return alert("Name required.");
    const normalizedName = newItem.name.trim().toLowerCase();
    if (items && items.some(item => (item.name || '').trim().toLowerCase() === normalizedName)) return alert("Duplicate item.");

    const newItemId = `custom_${Date.now()}`;
    const newItemObj = { ...newItem, id: newItemId, lastOrdered: null, frequencyDays: null, avgDailyConsumption: null, orderCount: 0, availableVendors: GENERIC_GROCERY_APPS };
    try {
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'pantry', newItemId), newItemObj);
        setIsAddModalOpen(false);
        setNewItem({ name: '', category: 'Vegetables', vendor: 'BigBasket', frequencyDays: 7, quantity: 1, unit: 'pcs' });
    } catch (e) { alert(`Save failed: ${e.message}`); }
  };

  const handleCheckout = async (vendorName) => {
    if (!user) return;
    const itemsToCheckout = cart.filter(c => c.vendor === vendorName);
    const now = new Date().toISOString();
    const orderText = `*${vendorName} Order List:*\n\n` + itemsToCheckout.map(item => item.packCount > 1 ? `• ${item.name} - ${item.packCount} packs x ${item.packetSize} ${item.unit}` : `• ${item.name} - ${item.quantity} ${item.unit}`).join('\n');

    try { await navigator.clipboard.writeText(orderText); } catch (err) { console.error('Clip failed', err); }
    window.open(`https://wa.me/?text=${encodeURIComponent(orderText)}`, '_blank');

    const batch = writeBatch(db);
    itemsToCheckout.forEach(item => {
        const pantryRef = doc(db, 'artifacts', appId, 'users', user.uid, 'pantry', item.id);
        batch.update(pantryRef, { isOrdered: true, orderPlacedAt: now, quantity: item.quantity, unit: item.unit, orderedPackCount: item.packCount, orderedPacketSize: item.packetSize });
    });
    itemsToCheckout.forEach(item => {
        const cartRef = doc(db, 'artifacts', appId, 'users', user.uid, 'cart', item.id);
        batch.delete(cartRef);
    });
    await batch.commit();
    alert(`List copied & WhatsApp opened.`);
    setTimeout(() => setShowNotification(true), 3000);
  };

  const initiateManualReceive = (item) => {
      setItemToReceive(item);
      setReceiveConfig({ packCount: item.orderedPackCount || 1, packetSize: item.orderedPacketSize || item.quantity || 1, unit: item.unit || 'pcs' });
      setIsReceiveModalOpen(true);
      setIsPendingOrdersModalOpen(false); // Close pending list to focus on modal
  };

  const confirmManualReceive = async () => {
      if (!user || !itemToReceive) return;
      const today = new Date();
      const totalReceivedQty = receiveConfig.packCount * receiveConfig.packetSize;
      const updates = calculateReceivedStats(itemToReceive, today, totalReceivedQty, receiveConfig.unit);
      try {
          await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'pantry', itemToReceive.id), updates, { merge: true });
          setIsReceiveModalOpen(false);
          setItemToReceive(null);
      } catch (e) { alert(`Error: ${e.message}`); }
  };

  const handleNotDelivered = async (itemId) => {
      if (!user) return;
      try { await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'pantry', itemId), { isOrdered: false, orderPlacedAt: null, orderedPackCount: null, orderedPacketSize: null }, { merge: true }); } catch (e) { alert(`Error: ${e.message}`); }
  };

  const handleSkipCycle = async (itemId) => {
      if (!user) return;
      try { await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'pantry', itemId), { lastOrdered: new Date().toISOString() }, { merge: true }); } catch (e) { alert(`Error: ${e.message}`); }
  };

  const handleBulkSync = async () => {
      if (!user) return;
      if (!confirm("Add missing items?")) return;
      const batch = writeBatch(db);
      let count = 0;
      SEED_ITEMS.forEach(seedItem => {
          const exists = items.some(i => (i.name || '').toLowerCase() === seedItem.name.toLowerCase());
          if (!exists) {
              const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'pantry', seedItem.id);
              batch.set(docRef, seedItem);
              count++;
          }
      });
      try { if (count > 0) { await batch.commit(); alert(`Added ${count} items.`); } else { alert("Up to date."); } } catch (e) { alert(`Sync failed: ${e.message}`); }
      setIsAdminOpen(false);
  };

  const handleExportSeed = () => {
    const cleanItems = items.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      vendor: item.vendor,
      availableVendors: item.availableVendors || GENERIC_GROCERY_APPS,
      frequencyDays: item.frequencyDays,
      avgDailyConsumption: item.avgDailyConsumption,
      lastQuantity: item.lastQuantity || null,
      lastOrdered: null,
      orderCount: 0,
      quantity: item.quantity,
      unit: item.unit
    }));
    const jsonString = JSON.stringify(cleanItems, null, 2);
    navigator.clipboard.writeText(jsonString);
    alert("Data copied to clipboard!");
  };

  const handleLogout = async () => {
      try { await signOut(auth); }
      catch(e) { console.error("Sign out error", e); }
  }

  // --- MAIN RENDER ---
  if (!user && !isLoading) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-gray-200">

      <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
            <h1 className="text-xl font-bold tracking-tight text-indigo-900">PantryPilot</h1>
        </div>
        <div className="relative flex items-center gap-4">
             {orderedItemsCount > 0 && (
                 <button onClick={() => setIsPendingOrdersModalOpen(true)} className="relative">
                     <Truck className="w-6 h-6 text-blue-600" />
                     <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold animate-pulse">{orderedItemsCount}</div>
                 </button>
             )}

             <div className="relative">
                {cart.length > 0 && <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold animate-pulse">{cart.length}</div>}
                <button onClick={() => setActiveTab('cart')}><ShoppingCart className="w-6 h-6 text-gray-600" /></button>
             </div>
        </div>
      </div>

      <div className="p-4 h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'pantry' && <PantryView
            items={processedItems}
            cart={cart} isLoading={isLoading} dbError={dbError} hasNewItems={hasNewItems}
            onAddCustom={() => setIsAddModalOpen(true)}
            onSync={handleBulkSync}
            onAddToCart={initiateAddToCart}
            onRemoveFromCart={removeFromCart}
            onManualReceive={initiateManualReceive}
            onNotDelivered={handleNotDelivered}
        />}
        {activeTab === 'cart' && <CartView />}
      </div>

      {showNotification && (
        <div className="absolute top-20 left-4 right-4 bg-white rounded-xl shadow-xl p-4 border border-gray-100 z-40 animate-slide-down flex items-start gap-3">
             <div className="bg-orange-100 p-2 rounded-full"><Bell className="w-5 h-5 text-orange-600" /></div>
             <div className="flex-1"><h4 className="text-sm font-bold text-gray-900">Delivery Detected</h4><p className="text-xs text-gray-500 mt-1">Order arrived? Scan receipt to update patterns.</p></div>
             <div className="flex gap-2">
                <button onClick={() => setShowNotification(false)} className="text-gray-500 text-xs px-2 hover:bg-gray-100 rounded">Dismiss</button>
                <button onClick={() => { setIsScanning(true); setShowNotification(false); }} className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold">Scan</button>
             </div>
        </div>
      )}

      {/* MODALS */}
      {isScanning && <ScanView />}
      {isAddToCartModalOpen && <AddToCartModal item={itemToAdd} config={addConfig} setConfig={setAddConfig} onCancel={() => setIsAddToCartModalOpen(false)} onConfirm={confirmAddToCart} />}
      {isReceiveModalOpen && <ReceiveModal item={itemToReceive} config={receiveConfig} setConfig={setReceiveConfig} onCancel={() => setIsReceiveModalOpen(false)} onConfirm={confirmManualReceive} />}
      {isPendingOrdersModalOpen && <PendingOrdersModal items={processedItems} onCancel={() => setIsPendingOrdersModalOpen(false)} onManualReceive={initiateManualReceive} onNotDelivered={handleNotDelivered} />}

      {isAdminOpen && (
          <div className="absolute bottom-20 left-4 bg-gray-800 text-white p-4 rounded-xl shadow-xl z-50 w-64 animate-fade-in">
              <h3 className="text-sm font-bold mb-2 flex items-center"><Database className="w-4 h-4 mr-2" /> Database Admin</h3>
              <div className="mb-3 p-2 bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-gray-400 uppercase">Current User ID:</p>
                    <button onClick={() => navigator.clipboard.writeText(user?.uid)} title="Copy ID"><Copy className="w-3 h-3 text-gray-400 hover:text-white" /></button>
                  </div>
                  <p className="text-xs font-mono break-all">{user?.uid || 'Not Connected'}</p>
              </div>
              <p className="text-xs text-gray-400 mb-3">Sync local code changes to cloud DB.</p>
              <button onClick={handleBulkSync} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-lg mb-3">Sync Master List</button>
              <button onClick={handleExportSeed} className="w-full bg-gray-600 hover:bg-gray-500 text-white text-xs font-bold py-2 rounded-lg mb-3 flex items-center justify-center"><FileJson className="w-4 h-4 mr-2" /> Export Data for Code</button>

              <div className="border-t border-gray-600 my-2"></div>
              <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center">
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </button>
          </div>
      )}

      <div className="absolute bottom-0 w-full bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center z-10">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center space-y-1 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-gray-400'}`}><TrendingUp className="w-6 h-6" /><span className="text-xs font-medium">Overview</span></button>
        <button onClick={() => setActiveTab('pantry')} className={`flex flex-col items-center space-y-1 ${activeTab === 'pantry' ? 'text-indigo-600' : 'text-gray-400'}`}><List className="w-6 h-6" /><span className="text-xs font-medium">My Pantry</span></button>
        <div className="relative">
            <button onClick={() => setIsAdminOpen(!isAdminOpen)} className="absolute -top-10 -right-2 text-gray-300 hover:text-gray-600"><Settings className="w-4 h-4" /></button>
            <button onClick={() => setIsScanning(true)} className={`flex flex-col items-center space-y-1 text-gray-400 hover:text-indigo-600`}><Camera className="w-6 h-6" /><span className="text-xs font-medium">Scan</span></button>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full rounded-2xl p-6 shadow-xl animate-slide-up">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Staple</h2>
            <div className="space-y-4">
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Item Name</label><input type="text" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Olive Oil" /></div>
              <div className="grid grid-cols-2 gap-4">
                 <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vendor</label><select value={newItem.vendor} onChange={(e) => setNewItem({...newItem, vendor: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200">{VENDORS.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                 <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label><select value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold">Cancel</button>
                <button onClick={handleCreateNewItem} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200">Save Item</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}