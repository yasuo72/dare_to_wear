import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import Home from "./Pages/Home";
import About from "./Pages/About";
import Shop from "./Pages/Shop";
import Contact from "./Pages/Contact";
import Blog from "./Pages/Blog";
import Header from "./Components/Header/Navbar";
import Footer from "./Components/Footer/Footer";
import ProductDetails from "./Pages/ProductDetails";
import NotFound from "./Pages/NotFound";
import ScrollToTop from "./Components/ScrollButton/ScrollToTop";
import Authentication from "./Pages/Authentication";
import ResetPass from "./Components/Authentication/Reset/ResetPass";
import BlogDetails from "./Components/Blog/BlogDetails/BlogDetails";
import TermsConditions from "./Pages/TermsConditions";
import ShoppingCart from "./Components/ShoppingCart/ShoppingCart";
import Popup from "./Components/PopupBanner/Popup";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { ProductsProvider } from "./contexts/ProductsContext";
import { CartProvider } from "./contexts/CartContext";
import { BlogProvider } from "./contexts/BlogContext";
import { ContactProvider } from "./contexts/ContactContext";

const App = () => {
  return (
    <>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <BlogProvider>
              <ContactProvider>
                <Popup />
                <ScrollToTop />
                <BrowserRouter>
                  <Header />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/product" element={<ProductDetails />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/loginSignUp" element={<Authentication />} />
                    <Route path="/resetPassword" element={<ResetPass />} />
                    <Route path="/BlogDetails" element={<BlogDetails />} />
                    <Route path="/blog/:id" element={<BlogDetails />} />
                    <Route path="/terms" element={<TermsConditions />} />
                    <Route path="/cart" element={<ShoppingCart />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Footer />
                  <Toaster />
                </BrowserRouter>
              </ContactProvider>
            </BlogProvider>
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </>
  );
};

export default App;
