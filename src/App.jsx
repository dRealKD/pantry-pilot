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
  Settings
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCustomToken
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
const UNITS = ['kg(s)', 'gm(s)', 'ltr', 'ml', 'pcs', 'pack', 'loaf', 'bunch', 'bottles'];
const GENERIC_GROCERY_APPS = ['BigBasket', 'Swiggy Instamart', 'Zepto', 'Blinkit', 'Amazon Fresh'];
const CATEGORIES = ['Vegetables', 'Fruits', 'Dairy', 'Meat', 'Bakery', 'Grains', 'Cooking', 'Beverages', 'Household'];

// --- MASTER LIST (Edit this to update your database) ---
const SEED_ITEMS = [
  { id: 'item_1', name: 'Full Cream Milk', category: 'Dairy', vendor: 'Swiggy Instamart', availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 1, unit: 'L' },
  { id: 'item_2', name: 'Curd/Dahi', category: 'Dairy', vendor: 'BigBasket', availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 400, unit: 'g' },
  { id: 'item_3', name: 'Eggs (12 pack)', category: 'Dairy', vendor: 'Zepto', availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 1, unit: 'pack' },
  { id: 'item_4', name: 'Sourdough Bread', category: 'Bakery', vendor: 'BigBasket', availableVendors: ['BigBasket', 'The Baker\'s Dozen', 'Amazon Fresh'], frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 1, unit: 'loaf' },
  { id: 'item_6', name: 'Tomatoes', category: 'Vegetables', vendor: 'Zepto', availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 1, unit: 'kg' },
  { id: 'item_7', name: 'Onions', category: 'Vegetables', vendor: 'BigBasket', availableVendors: GENERIC_GROCERY_APPS, frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 1, unit: 'kg' },
  { id: 'item_10', name: 'Curry Cut Chicken', category: 'Meat', vendor: 'Meatigo', availableVendors: ['Meatigo', 'Licious', 'BigBasket'], frequencyDays: null, avgDailyConsumption: null, lastQuantity: null, lastOrdered: null, orderCount: 0, quantity: 500, unit: 'g' },
  // ADD NEW ITEMS HERE...
];

// --- FIREBASE INIT ---
// IMPORTANT: WHEN DEPLOYING, REPLACE THIS SECTION WITH YOUR OWN FIREBASE CONFIG
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  apiKey: "AIzaSyCzvNJ03g-VqQ7TJnh-qlPs1Y0IoLgE8k0",
  authDomain: "mypantrypilot-ed34b.firebaseapp.com",
  projectId: "mypantrypilot-ed34b",
  storageBucket: "mypantrypilot-ed34b.firebasestorage.app",
  messagingSenderId: "440159001492",
  appId: "1:440159001492:web:cf993628cf44f053218d81"
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

export default function GroceryApp() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('pantry');
  const [isAdminOpen, setIsAdminOpen] = useState(false); // Developer Menu Toggle

  // UI States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddToCartModalOpen, setIsAddToCartModalOpen] = useState(false);
  const [itemToAdd, setItemToAdd] = useState(null);
  const [addConfig, setAddConfig] = useState({ qty: 1, unit: 'pcs', vendor: '' });

  // Scanning States
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

  // --- 1. AUTHENTICATION ---
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. DATA SYNC (FIRESTORE) ---
  useEffect(() => {
    if (!user) return;

    // Listen to PANTRY items
    const pantryRef = collection(db, 'artifacts', appId, 'users', user.uid, 'pantry');
    const unsubscribePantry = onSnapshot(pantryRef, (snapshot) => {
      const fetchedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(fetchedItems);
    }, (error) => console.error("Pantry sync error:", error));

    // Listen to CART items
    const cartRef = collection(db, 'artifacts', appId, 'users', user.uid, 'cart');
    const unsubscribeCart = onSnapshot(cartRef, (snapshot) => {
      const fetchedCart = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCart(fetchedCart);
    }, (error) => console.error("Cart sync error:", error));

    return () => {
      unsubscribePantry();
      unsubscribeCart();
    };
  }, [user]);

  // --- 3. AUTO-CLEANUP EFFECT ---
  useEffect(() => {
    if (!user || items.length === 0) return;

    const checkAutoReceive = () => {
        const now = new Date();
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;

        const itemsToAutoReceive = items.filter(item =>
            item.isOrdered &&
            item.orderPlacedAt &&
            (now - new Date(item.orderPlacedAt) > ONE_DAY_MS)
        );

        if (itemsToAutoReceive.length === 0) return;

        const batch = writeBatch(db);
        itemsToAutoReceive.forEach(item => {
             // For auto-cleanup, assume default quantity was received
             const stats = calculateReceivedStats(item, now, item.quantity, item.unit);
             const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'pantry', item.id);
             batch.update(docRef, stats);
        });
        batch.commit().then(() => console.log('Auto-cleanup completed'));
    };

    const interval = setInterval(checkAutoReceive, 60000);
    checkAutoReceive();
    return () => clearInterval(interval);
  }, [items, user]);


  // --- LOGIC HELPERS ---
  const calculateReceivedStats = (item, receiveDate, receivedQty, receivedUnit) => {
    let newAvgRate = item.avgDailyConsumption;
    let newOrderCount = (item.orderCount || 0) + 1;

    const normReceivedQty = normalizeQuantity(receivedQty, receivedUnit);
    const normLastQty = item.lastQuantity
        ? normalizeQuantity(item.lastQuantity, item.lastUnit)
        : normReceivedQty;

    if (item.lastOrdered) {
        const lastDate = new Date(item.lastOrdered);
        const diffTime = Math.abs(receiveDate - lastDate);
        const daysBetween = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        const observedRate = normLastQty / daysBetween;

        if (!item.avgDailyConsumption) {
            newAvgRate = observedRate;
        } else {
            newAvgRate = (item.avgDailyConsumption * 0.7) + (observedRate * 0.3);
        }
    }

    const estimatedDays = newAvgRate && newAvgRate > 0
        ? Math.ceil(normReceivedQty / newAvgRate)
        : (item.frequencyDays || 7);

    return {
        lastOrdered: receiveDate.toISOString(),
        lastQuantity: receivedQty,
        lastUnit: receivedUnit,
        avgDailyConsumption: newAvgRate,
        frequencyDays: estimatedDays,
        orderCount: newOrderCount,
        isOrdered: false,
        orderPlacedAt: null
    };
  };

  const processedItems = useMemo(() => {
    const today = new Date();

    const enrichedItems = items.map(item => {
      // 1. Status: On the Way
      if (item.isOrdered) {
         return {
            ...item,
            daysSinceLastOrder: 0,
            stockStatus: 'On the Way',
            urgencyRatio: -1,
            isOverdue: false,
            hasPattern: true
         };
      }

      // 2. Status: New Item
      if (!item.lastOrdered) {
        return {
          ...item,
          daysSinceLastOrder: 0,
          stockStatus: 'New',
          urgencyRatio: 0,
          isOverdue: false,
          hasPattern: false
        };
      }

      // 3. Status: Tracking & Prediction
      const lastOrder = new Date(item.lastOrdered);
      const diffTime = Math.abs(today - lastOrder);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let percentConsumed = 0;
      let predictedDuration = 0;

      if (item.avgDailyConsumption && item.lastQuantity) {
          const normLastQty = normalizeQuantity(item.lastQuantity, item.lastUnit);
          predictedDuration = normLastQty / item.avgDailyConsumption;
          percentConsumed = diffDays / predictedDuration;
      }
      else if (item.frequencyDays) {
          predictedDuration = item.frequencyDays;
          percentConsumed = diffDays / item.frequencyDays;
      }

      let stockStatus = 'High';
      if (percentConsumed >= 1.1) stockStatus = 'Critical';
      else if (percentConsumed >= 0.8) stockStatus = 'Low';
      else stockStatus = 'Good';

      return {
        ...item,
        daysSinceLastOrder: diffDays,
        stockStatus,
        urgencyRatio: percentConsumed,
        predictedDuration: Math.round(predictedDuration),
        isOverdue: percentConsumed >= 1.0,
        hasPattern: !!item.lastOrdered
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

  const suggestions = processedItems.filter(item =>
    !item.isOrdered &&
    item.hasPattern &&
    item.urgencyRatio >= 0.8
  );

  // --- ACTIONS ---

  const initiateAddToCart = (item) => {
    if (cart.find(c => c.id === item.id)) return;
    setItemToAdd(item);
    setAddConfig({
        qty: item.quantity || 1,
        unit: item.unit || 'pcs',
        vendor: item.vendor || 'BigBasket'
    });
    setIsAddToCartModalOpen(true);
  };

  const confirmAddToCart = async () => {
    if (!itemToAdd || !user) return;

    const finalItem = {
        ...itemToAdd,
        quantity: addConfig.qty,
        unit: addConfig.unit,
        vendor: addConfig.vendor
    };

    try {
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'cart', finalItem.id), finalItem);
        setIsAddToCartModalOpen(false);
        setItemToAdd(null);
    } catch (e) {
        console.error("Error adding to cart", e);
    }
  };

  const removeFromCart = async (itemId) => {
    if (!user) return;
    try {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'cart', itemId));
    } catch (e) {
        console.error("Error removing from cart", e);
    }
  };

  const handleCreateNewItem = async () => {
    if (!user) return;
    const newItemId = `custom_${Date.now()}`;
    const newItemObj = {
      ...newItem,
      id: newItemId,
      lastOrdered: null,
      frequencyDays: null,
      avgDailyConsumption: null,
      orderCount: 0,
      availableVendors: GENERIC_GROCERY_APPS
    };

    try {
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'pantry', newItemId), newItemObj);
        setIsAddModalOpen(false);
        setNewItem({ name: '', category: 'Vegetables', vendor: 'BigBasket', frequencyDays: 7, quantity: 1, unit: 'pcs' });
    } catch (e) {
        console.error("Error creating item", e);
    }
  };

  const handleCheckout = async (vendorName) => {
    if (!user) return;
    const itemsToCheckout = cart.filter(c => c.vendor === vendorName);
    const now = new Date().toISOString();

    const orderText = `*${vendorName} Order List:*\n\n` +
        itemsToCheckout.map(item => `• ${item.name} - ${item.quantity} ${item.unit}`).join('\n');

    try {
        await navigator.clipboard.writeText(orderText);
    } catch (err) {
        console.error('Clipboard failed', err);
    }

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(orderText)}`;
    window.open(whatsappUrl, '_blank');

    const batch = writeBatch(db);
    itemsToCheckout.forEach(item => {
        const pantryRef = doc(db, 'artifacts', appId, 'users', user.uid, 'pantry', item.id);
        batch.update(pantryRef, { isOrdered: true, orderPlacedAt: now });
    });
    itemsToCheckout.forEach(item => {
        const cartRef = doc(db, 'artifacts', appId, 'users', user.uid, 'cart', item.id);
        batch.delete(cartRef);
    });

    await batch.commit();

    alert(`Opening WhatsApp with your list...\n\nList also copied to clipboard.`);
    setTimeout(() => {
        setShowNotification(true);
    }, 3000);
  };

  const handleManualReceive = async (itemId) => {
      if (!user) return;
      const today = new Date();
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      const updates = calculateReceivedStats(item, today, item.quantity, item.unit);

      try {
          await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'pantry', itemId), updates, { merge: true });
      } catch (e) {
          console.error("Error receiving item", e);
      }
  };

  // --- BULK IMPORT (Admin Feature) ---
  const handleBulkSync = async () => {
      if (!user) return;
      if (!confirm("This will add any missing items from the Code Master List to your Database. Existing items will NOT be overwritten. Continue?")) return;

      const batch = writeBatch(db);
      let count = 0;

      SEED_ITEMS.forEach(seedItem => {
          // Check if item already exists in current state
          const exists = items.find(i => i.id === seedItem.id);
          if (!exists) {
              const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'pantry', seedItem.id);
              batch.set(docRef, seedItem);
              count++;
          }
      });

      if (count > 0) {
          await batch.commit();
          alert(`Successfully added ${count} new items from Master List.`);
      } else {
          alert("Database is already up to date with Master List.");
      }
      setIsAdminOpen(false);
  };

  // --- OCR / Scanning Logic ---

  const startScan = () => {
    setIsScanning(true);
    setScanStep('camera');
  };

  const processScan = () => {
    setScanStep('processing');
    setTimeout(() => {
        // MOCK OCR
        const mockReceiptData = [
            { id: 'item_1', name: 'Full Cream Milk', detectedQty: 1, detectedUnit: 'L', expectedQty: 1, match: true },
            { id: 'item_6', name: 'Tomatoes', detectedQty: 1, detectedUnit: 'kg', expectedQty: 1, match: true },
        ];
        setScannedData(mockReceiptData);
        setScanStep('review');
    }, 2000);
  };

  const confirmReceipt = async () => {
    if (!user) return;
    const today = new Date();
    const batch = writeBatch(db);

    items.forEach(item => {
        const scanMatch = scannedData.find(s => s.id === item.id);
        if (scanMatch) {
            const stats = calculateReceivedStats(item, today, scanMatch.detectedQty, scanMatch.detectedUnit);
            const finalUpdates = {
                ...stats,
                quantity: scanMatch.detectedQty,
                unit: scanMatch.detectedUnit,
            };
            const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'pantry', item.id);
            batch.update(docRef, finalUpdates);
        }
    });

    await batch.commit();
    setIsScanning(false);
    setShowNotification(false);
    setActiveTab('pantry');
  };

  // --- VIEWS ---

  const AddToCartModal = () => (
    <div className="absolute inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
        <div className="bg-white w-full rounded-2xl p-6 shadow-xl animate-slide-up">
            <h2 className="text-xl font-bold mb-1 text-gray-800">Add to List</h2>
            <p className="text-sm text-gray-500 mb-6">Confirm details for <span className="font-semibold text-gray-900">{itemToAdd?.name}</span></p>

            <div className="space-y-5">
                <div>
                    <label className="flex items-center text-xs font-bold text-gray-500 uppercase mb-2">
                        <Scale className="w-3 h-3 mr-1" /> Quantity & Weight
                    </label>
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <button
                                onClick={() => setAddConfig({...addConfig, qty: Math.max(0.5, addConfig.qty - 0.5)})}
                                className="absolute left-2 top-2 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-bold hover:bg-gray-200"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={addConfig.qty}
                                onChange={(e) => setAddConfig({...addConfig, qty: parseFloat(e.target.value)})}
                                className="w-full p-3 text-center font-bold text-gray-800 bg-gray-50 rounded-xl border border-gray-200"
                            />
                            <button
                                onClick={() => setAddConfig({...addConfig, qty: addConfig.qty + 0.5})}
                                className="absolute right-2 top-2 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-bold hover:bg-gray-200"
                            >
                                +
                            </button>
                        </div>
                        <div className="w-1/3">
                            <select
                                value={addConfig.unit}
                                onChange={(e) => setAddConfig({...addConfig, unit: e.target.value})}
                                className="w-full h-full p-3 font-medium bg-gray-50 rounded-xl border border-gray-200 text-center appearance-none"
                            >
                                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="flex items-center text-xs font-bold text-gray-500 uppercase mb-2">
                        <Store className="w-3 h-3 mr-1" /> Select Store
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {(itemToAdd?.availableVendors || VENDORS).map(v => (
                            <button
                                key={v}
                                onClick={() => setAddConfig({...addConfig, vendor: v})}
                                className={`p-3 rounded-xl border text-sm font-medium transition-all text-left flex items-center justify-between ${
                                    addConfig.vendor === v
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600'
                                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {v}
                                {addConfig.vendor === v && <Check className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-3 mt-8">
                <button
                    onClick={() => setIsAddToCartModalOpen(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={confirmAddToCart}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
                >
                    Add to List
                </button>
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
               <button onClick={processScan} className="absolute bottom-10 w-16 h-16 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center">
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
                   <button onClick={confirmReceipt} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-emerald-200">
                       Confirm & Update AI
                   </button>
               </div>
           </div>
       )}
    </div>
  );

  const DashboardView = () => (
    <div className="space-y-6 pb-20">
      <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg flex justify-between items-center">
          <span className="text-xs text-indigo-800 font-medium">Demo Control:</span>
          <button onClick={() => handleCheckout('Swiggy Instamart')} className="text-xs bg-white border border-indigo-200 text-indigo-600 px-3 py-1 rounded shadow-sm">
            Simulate "Place Order"
          </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-2xl border border-emerald-200">
          <div className="text-emerald-800 text-sm font-semibold mb-1">Smart Stock</div>
          <div className="text-2xl font-bold text-emerald-900">
             {items.filter(i => i.avgDailyConsumption !== null).length}
          </div>
          <div className="text-xs text-emerald-700 mt-1">Patterns learned</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-2xl border border-amber-200">
          <div className="text-amber-800 text-sm font-semibold mb-1">To Order</div>
          <div className="text-2xl font-bold text-amber-900">{suggestions.length}</div>
          <div className="text-xs text-amber-700 mt-1">Predictive suggestions</div>
        </div>
      </div>

      {suggestions.length > 0 ? (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-rose-500" />
            Restock Suggestions
          </h2>
          <div className="space-y-3">
            {suggestions.map(item => {
              const isInCart = cart.find(c => c.id === item.id);
              return (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                    <div className="font-semibold text-gray-800">{item.name}</div>
                    <div className="text-xs text-gray-500 flex items-center mt-1">
                        <span className={`w-2 h-2 rounded-full mr-2 ${item.stockStatus === 'Critical' ? 'bg-rose-500' : 'bg-amber-400'}`}></span>
                        Est. Duration: {item.predictedDuration} days
                    </div>
                    </div>
                    {isInCart ? (
                         <div className="flex items-center gap-2">
                             <div className="text-emerald-600 bg-emerald-50 px-2 py-1.5 rounded-lg text-xs font-bold flex items-center">
                                 <Check className="w-3 h-3 mr-1" /> Added
                             </div>
                             <button
                                onClick={() => removeFromCart(item.id)}
                                className="bg-gray-200 p-1.5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50"
                             >
                                 <Trash2 className="w-4 h-4" />
                             </button>
                         </div>
                    ) : (
                        <button onClick={() => initiateAddToCart(item)} className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center">
                            <Plus className="w-4 h-4 mr-1" /> Add
                        </button>
                    )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <BrainCircuit className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="text-gray-800 font-bold">AI is Learning</h3>
            <p className="text-xs text-gray-400 mt-1">Order items from "My Pantry" to start establishing consumption patterns.</p>
        </div>
      )}
    </div>
  );

  const PantryView = () => (
    <div className="space-y-4 pb-20">
      <div className="flex justify-between items-center mb-2 px-1">
         <h1 className="text-2xl font-bold text-gray-900">My Pantry</h1>
         <button onClick={() => setIsAddModalOpen(true)} className="text-indigo-600 text-sm font-semibold">+ Custom Item</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
          {processedItems.map(item => {
            const isInCart = cart.find(c => c.id === item.id);
            return (
                <div
                    key={item.id}
                    className={`p-4 flex items-center justify-between transition-colors ${
                        item.isOverdue ? 'bg-red-50' : 'bg-white'
                    }`}
                >
                <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mr-3 ${
                        item.isOrdered ? 'bg-blue-100 text-blue-600' :
                        item.isOverdue ? 'bg-red-100 text-red-600' :
                        item.hasPattern ? 'bg-indigo-50 text-gray-800' : 'bg-gray-100 text-gray-400'
                    }`}>
                    {item.isOrdered ? <Truck className="w-5 h-5" /> :
                        item.isOverdue ? <AlertCircle className="w-5 h-5" /> :
                        item.hasPattern ? '🧠' : '❔'}
                    </div>
                    <div>
                    <div className={`text-sm font-bold ${item.isOverdue && !item.isOrdered ? 'text-red-700' : 'text-gray-700'}`}>
                        {item.name}
                    </div>
                    <div className={`text-xs flex items-center ${item.isOverdue && !item.isOrdered ? 'text-red-500' : 'text-gray-400'}`}>
                        {item.vendor} •
                        {item.isOrdered ? (
                            <span className="ml-1 text-blue-600 font-medium">On the Way</span>
                        ) : item.hasPattern ? (
                            <span className="ml-1 font-medium">
                                Last: {item.daysSinceLastOrder}d | Est. Left: {item.predictedDuration - item.daysSinceLastOrder}d
                            </span>
                        ) : (
                            <span className="ml-1">Learning... ({item.orderCount} orders)</span>
                        )}
                    </div>
                    </div>
                </div>

                {item.isOrdered ? (
                    <button
                        onClick={() => handleManualReceive(item.id)}
                        className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center hover:bg-blue-100 transition-colors"
                    >
                        Received?
                    </button>
                ) : isInCart ? (
                    <div className="flex items-center gap-2">
                        <div className="text-emerald-500 font-medium text-sm flex items-center bg-emerald-50 px-3 py-1.5 rounded-lg">
                            <Check className="w-4 h-4 mr-1" /> Added
                        </div>
                        <button
                            onClick={() => removeFromCart(item.id)}
                            className="bg-gray-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => initiateAddToCart(item)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            item.isOverdue
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                        }`}
                    >
                        Add
                    </button>
                )}
                </div>
            );
          })}
      </div>
    </div>
  );

  const CartView = () => {
    const groupedCart = cart.reduce((acc, item) => {
      (acc[item.vendor] = acc[item.vendor] || []).push(item);
      return acc;
    }, {});

    return (
      <div className="space-y-6 pb-20">
        <h1 className="text-2xl font-bold text-gray-900 px-1">Shopping Lists</h1>
        {cart.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Your list is empty.</p>
            <button onClick={() => setActiveTab('pantry')} className="text-sm text-indigo-600 mt-2 font-semibold">
                Browse Pantry to Add
            </button>
          </div>
        ) : (
          Object.entries(groupedCart).map(([vendor, vendorItems]) => (
            <div key={vendor} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center">
                   <h3 className="font-bold text-gray-800">{vendor}</h3>
                   <span className="ml-2 bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{vendorItems.length} items</span>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {vendorItems.map(item => (
                  <div key={item.id} className="p-4 flex justify-between items-center">
                    <div>
                        <div className="text-gray-800 font-medium">{item.name}</div>
                        <div className="text-xs text-gray-400 font-medium mt-0.5">
                            {item.quantity} {item.unit}
                        </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button onClick={() => handleCheckout(vendor)} className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-100 transition-colors flex justify-center items-center shadow-sm">
                  <span className="mr-2">Copy List & WhatsApp</span>
                  <div className="flex space-x-1">
                      <Share2 className="w-4 h-4" />
                      <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-gray-200">

      <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
            <h1 className="text-xl font-bold tracking-tight text-indigo-900">PantryPilot</h1>
        </div>
        <div className="relative">
             {cart.length > 0 && (
                <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold animate-pulse">
                    {cart.length}
                </div>
             )}
             <button onClick={() => setActiveTab('cart')}>
                <ShoppingCart className="w-6 h-6 text-gray-600" />
             </button>
        </div>
      </div>

      <div className="p-4 h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'pantry' && <PantryView />}
        {activeTab === 'cart' && <CartView />}
      </div>

      {showNotification && (
        <div className="absolute top-20 left-4 right-4 bg-white rounded-xl shadow-xl p-4 border border-gray-100 z-40 animate-slide-down flex items-start gap-3">
             <div className="bg-orange-100 p-2 rounded-full">
                <Bell className="w-5 h-5 text-orange-600" />
             </div>
             <div className="flex-1">
                 <h4 className="text-sm font-bold text-gray-900">Delivery Detected</h4>
                 <p className="text-xs text-gray-500 mt-1">Order arrived? Scan receipt to update patterns.</p>
             </div>
             <button onClick={() => { startScan(); setShowNotification(false); }} className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold">
                 Scan
             </button>
        </div>
      )}

      {/* MODALS */}
      {isScanning && <ScanView />}
      {isAddToCartModalOpen && <AddToCartModal />}

      {/* DEVELOPER TOOLS */}
      {isAdminOpen && (
          <div className="absolute bottom-20 left-4 bg-gray-800 text-white p-4 rounded-xl shadow-xl z-50 w-64 animate-fade-in">
              <h3 className="text-sm font-bold mb-2 flex items-center"><Database className="w-4 h-4 mr-2" /> Database Admin</h3>
              <p className="text-xs text-gray-400 mb-3">Sync local code changes to cloud DB.</p>
              <button
                onClick={handleBulkSync}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-lg"
              >
                  Sync Master List
              </button>
          </div>
      )}

      <div className="absolute bottom-0 w-full bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center z-10">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center space-y-1 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <TrendingUp className="w-6 h-6" />
          <span className="text-xs font-medium">Overview</span>
        </button>

        <button onClick={() => setActiveTab('pantry')} className={`flex flex-col items-center space-y-1 ${activeTab === 'pantry' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <List className="w-6 h-6" />
          <span className="text-xs font-medium">My Pantry</span>
        </button>

        <div className="relative">
            <button onClick={() => setIsAdminOpen(!isAdminOpen)} className="absolute -top-10 -right-2 text-gray-300 hover:text-gray-600">
                <Settings className="w-4 h-4" />
            </button>
            <button onClick={startScan} className={`flex flex-col items-center space-y-1 text-gray-400 hover:text-indigo-600`}>
            <Camera className="w-6 h-6" />
            <span className="text-xs font-medium">Scan</span>
            </button>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full rounded-2xl p-6 shadow-xl animate-slide-up">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Staple</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Item Name</label>
                <input type="text" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Olive Oil" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vendor</label>
                    <select value={newItem.vendor} onChange={(e) => setNewItem({...newItem, vendor: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200">
                      {VENDORS.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                    <select value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
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