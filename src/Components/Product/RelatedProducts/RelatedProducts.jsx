import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./RelatedProducts.css";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

import { Navigation } from "swiper/modules";

import { useProducts } from "../../../contexts/ProductsContext";

import { FiHeart } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { formatPrice } from "../../../utils/currency";

const RelatedProducts = ({ currentProductId }) => {
  const { products, fetchProducts } = useProducts();
  const [wishList, setWishList] = useState({});
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const loadRelatedProducts = async () => {
      if (products.length === 0) {
        await fetchProducts({ limit: 8 });
      }
      // Filter out current product and get first 8 products
      const filtered = products.filter(product => product._id !== currentProductId).slice(0, 8);
      setRelatedProducts(filtered);
    };

    loadRelatedProducts();
  }, [products, currentProductId, fetchProducts]);

  const handleWishlistClick = (productID) => {
    setWishList((prevWishlist) => ({
      ...prevWishlist,
      [productID]: !prevWishlist[productID],
    }));
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <div className="relatedProductSection">
        <div className="relatedProducts">
          <h2>
            RELATED <span>PRODUCTS</span>
          </h2>
        </div>
        <div className="relatedProductSlider">
          <div className="swiper-button image-swiper-button-next">
            <IoIosArrowForward />
          </div>
          <div className="swiper-button image-swiper-button-prev">
            <IoIosArrowBack />
          </div>
          <Swiper
            slidesPerView={4}
            slidesPerGroup={4}
            spaceBetween={30}
            loop={true}
            navigation={{
              nextEl: ".image-swiper-button-next",
              prevEl: ".image-swiper-button-prev",
            }}
            modules={[Navigation]}
            breakpoints={{
              320: {
                slidesPerView: 2,
                slidesPerGroup: 2,
                spaceBetween: 14,
              },
              768: {
                slidesPerView: 3,
                slidesPerGroup: 3,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 4,
                slidesPerGroup: 4,
                spaceBetween: 30,
              },
            }}
          >
            {relatedProducts.map((product) => {
              return (
                <SwiperSlide key={product._id}>
                  <div className="rpContainer">
                    <Link to={`/product/${product._id}`}>
                      <div className="rpImages" onClick={scrollToTop}>
                        <img
                          src={product.images?.[0] || product.frontImg}
                          alt={product.name}
                          className="rpFrontImg"
                        />
                        <img
                          src={product.images?.[1] || product.backImg}
                          className="rpBackImg"
                          alt={product.name}
                        />
                        <h4>Add to Cart</h4>
                      </div>
                    </Link>

                    <div className="relatedProductInfo">
                      <div className="rpCategoryWishlist">
                        <p>{product.category || 'General'}</p>
                        <FiHeart
                          onClick={() => handleWishlistClick(product._id)}
                          style={{
                            color: wishList[product._id]
                              ? "red"
                              : "#767676",
                            cursor: "pointer",
                          }}
                        />
                      </div>
                      <div className="productNameInfo">
                        <Link to={`/product/${product._id}`}>
                          <h5 onClick={scrollToTop}>{product.name}</h5>
                        </Link>
                        <p>{formatPrice(product.price)}</p>
                        <div className="productRatingReviews">
                          <div className="productRatingStar">
                            {[...Array(5)].map((_, index) => (
                              <FaStar 
                                key={index}
                                color={index < Math.floor(product.rating || 5) ? "#FEC78A" : "#e0e0e0"} 
                                size={10} 
                              />
                            ))}
                          </div>

                          <span>{product.reviewCount || 0} reviews</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </>
  );
};

export default RelatedProducts;
