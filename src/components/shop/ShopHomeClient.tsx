"use client";

import React, { useState } from "react";
import { Vegetable, Category, UserSession } from "@/types";
import { CartProvider } from "@/context/CartContext";
import Header from "./Header";
import HeroBanner from "./HeroBanner";
import CategorySection from "./CategorySection";
import PopularVegetables from "./PopularVegetables";
import PromotionalBanner from "./PromotionalBanner";
import WhyChooseUs from "./WhyChooseUs";
import BestSellersSection from "./BestSellersSection";
import HowItWorks from "./HowItWorks";
import CustomerReviews from "./CustomerReviews";
import NewsletterSection from "./NewsletterSection";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import CheckoutModal from "./CheckoutModal";
import LocationModal from "./LocationModal";
import ProductQuickViewModal from "./ProductQuickViewModal";

interface ShopHomeClientProps {
  initialVegetables: Vegetable[];
  initialCategories: Category[];
  initialBestSellers: (Vegetable & { salesRank?: number })[];
  currentUser: UserSession | null;
}

export default function ShopHomeClient({
  initialVegetables,
  initialCategories,
  initialBestSellers,
  currentUser,
}: ShopHomeClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-emerald-200 selection:text-emerald-950 font-sans">
        {/* Section 1: Header and Navigation */}
        <Header
          currentUser={currentUser}
          searchQuery={searchQuery}
          onSearch={(q) => setSearchQuery(q)}
        />

        <main className="flex-1">
          {/* Section 2: Hero Banner */}
          <HeroBanner />

          {/* Section 3: Shop by Category */}
          <CategorySection
            categories={initialCategories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(id) => setSelectedCategoryId(id)}
          />

          {/* Section 4: Popular Vegetables */}
          <PopularVegetables
            vegetables={initialVegetables}
            categories={initialCategories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(id) => setSelectedCategoryId(id)}
            searchQuery={searchQuery}
            onSearchQueryChange={(q) => setSearchQuery(q)}
          />

          {/* Section 5: Promotional Banner */}
          <PromotionalBanner />

          {/* Section 6: Why Choose Us? */}
          <WhyChooseUs />

          {/* Section 7: Best Sellers */}
          <BestSellersSection bestSellers={initialBestSellers} />

          {/* Section 8: How It Works */}
          <HowItWorks />

          {/* Section 9: Customer Reviews */}
          <CustomerReviews />

          {/* Section 10: Newsletter or Updates */}
          <NewsletterSection />
        </main>

        {/* Section 11: Footer */}
        <Footer
          categories={initialCategories}
          onSelectCategory={(id) => setSelectedCategoryId(id)}
        />

        {/* Interactive Modals and Drawers */}
        <CartDrawer />
        <CheckoutModal />
        <LocationModal />
        <ProductQuickViewModal />
      </div>
    </CartProvider>
  );
}
