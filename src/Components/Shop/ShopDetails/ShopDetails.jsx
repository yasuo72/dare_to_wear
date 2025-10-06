import React, { useState, useEffect } from "react";
import "./ShopDetails.css";

import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../../App/store";

import Filter from "../Filters/Filter";
import { Link } from "react-router-dom";
import { useProducts } from "../../../contexts/ProductsContext";
import { useCart } from "../../../contexts/CartContext";
import { FiHeart } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { IoFilterSharp, IoClose } from "react-icons/io5";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import { FaCartPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import { formatPrice } from "../../../utils/currency";

const ShopDetails = () => {
  const dispatch = useDispatch();
  const { products, isLoading, error, pagination, fetchProducts } = useProducts();
  const { addToCart: addToBackendCart } = useCart();

  const [wishList, setWishList] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [sortBy, setSortBy] = useState('default');

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

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const cartItems = useSelector((state) => state.cart.items);

  const handleAddToCart = async (product) => {
    try {
      const result = await addToBackendCart(product.productID, 1);
      
      if (result.success) {
        toast.success(`${product.productName} added to cart!`, {
          duration: 2000,
          style: {
            backgroundColor: "#07bc0c",
            color: "white",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#07bc0c",
          },
        });
      } else {
        toast.error(result.error || "Failed to add to cart", {
          duration: 2000,
          style: {
            backgroundColor: "#ff4b4b",
            color: "white",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#ff4b4b",
          },
        });
      }
    } catch (error) {
      toast.error("Failed to add to cart", {
        duration: 2000,
        style: {
          backgroundColor: "#ff4b4b",
          color: "white",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#ff4b4b",
        },
      });
    }
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    
    let sortParams = {};
    switch (value) {
      case 'Featured':
        sortParams = { featured: true };
        break;
      case 'lowToHigh':
        sortParams = { sortBy: 'productPrice', sortOrder: 'asc' };
        break;
      case 'highToLow':
        sortParams = { sortBy: 'productPrice', sortOrder: 'desc' };
        break;
      case 'a-z':
        sortParams = { sortBy: 'productName', sortOrder: 'asc' };
        break;
      case 'z-a':
        sortParams = { sortBy: 'productName', sortOrder: 'desc' };
        break;
      case 'newToOld':
        sortParams = { sortBy: 'createdAt', sortOrder: 'desc' };
        break;
      case 'oldToNew':
        sortParams = { sortBy: 'createdAt', sortOrder: 'asc' };
        break;
      default:
        sortParams = {};
    }
    
    fetchProducts(sortParams);
  };

  const handlePageChange = (page) => {
    fetchProducts({ page });
    scrollToTop();
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <>
      <div className="shopDetails">
        <div className="shopDetailMain">
          <div className="shopDetails__left">
            <Filter />
          </div>
          <div className="shopDetails__right">
            <div className="shopDetailsSorting">
              <div className="shopDetailsBreadcrumbLink">
                <Link to="/" onClick={scrollToTop}>
                  Home
                </Link>
                &nbsp;/&nbsp;
                <Link to="/shop">The Shop</Link>
              </div>
              <div className="filterLeft" onClick={toggleDrawer}>
                <IoFilterSharp />
                <p>Filter</p>
              </div>
              <div className="shopDetailsSort">
                <select name="sort" id="sort" value={sortBy} onChange={handleSortChange}>
                  <option value="default">Default Sorting</option>
                  <option value="Featured">Featured</option>
                  <option value="bestSelling">Best Selling</option>
                  <option value="a-z">Alphabetically, A-Z</option>
                  <option value="z-a">Alphabetically, Z-A</option>
                  <option value="lowToHigh">Price, Low to high</option>
                  <option value="highToLow">Price, high to low</option>
                  <option value="oldToNew">Date, old to new</option>
                  <option value="newToOld">Date, new to old</option>
                </select>
                <div className="filterRight" onClick={toggleDrawer}>
                  <div className="filterSeprator"></div>
                  <IoFilterSharp />
                  <p>Filter</p>
                </div>
              </div>
            </div>
            <div className="shopDetailsProducts">
              <div className="shopDetailsProductsContainer">
                {isLoading ? (
                  <div style={{ textAlign: 'center', padding: '50px' }}>
                    <p>Loading products...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '50px' }}>
                    <p>No products found.</p>
                  </div>
                ) : (
                  products.map((product) => (
                    <div key={product._id} className="sdProductContainer">
                      <div className="sdProductImages">
                        <Link to={`/product/${product._id}`} onClick={scrollToTop}>
                          <img
                            src={product.frontImg || product.images[0]}
                            alt={product.productName}
                            className="sdProduct_front"
                          />
                          {product.images[1] && (
                            <img
                              src={product.images[1]}
                              alt={product.productName}
                              className="sdProduct_back"
                            />
                          )}
                        </Link>
                        <h4 onClick={() => handleAddToCart(product)}>
                          Add to Cart
                        </h4>
                      </div>
                      <div
                        className="sdProductImagesCart"
                        onClick={() => handleAddToCart(product)}
                      >
                        <FaCartPlus />
                      </div>
                      <div className="sdProductInfo">
                        <div className="sdProductCategoryWishlist">
                          <p>{product.category}</p>
                          <FiHeart
                            onClick={() => handleWishlistClick(product.productID)}
                            style={{
                              color: wishList[product.productID]
                                ? "red"
                                : "#767676",
                              cursor: "pointer",
                            }}
                          />
                        </div>
                        <div className="sdProductNameInfo">
                          <Link to={`/product/${product._id}`} onClick={scrollToTop}>
                            <h5>{product.productName}</h5>
                          </Link>

                          <p>{formatPrice(product.price || product.productPrice)}</p>
                          <div className="sdProductRatingReviews">
                            <div className="sdProductRatingStar">
                              {[...Array(5)].map((_, i) => (
                                <FaStar 
                                  key={i}
                                  color={i < Math.floor(product.averageRating || 0) ? "#FEC78A" : "#ddd"} 
                                  size={10} 
                                />
                              ))}
                            </div>
                            <span>{product.numReviews || 0} reviews</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="shopDetailsPagination">
              <div className="sdPaginationPrev">
                <p 
                  onClick={() => pagination.hasPrevPage && handlePageChange(pagination.page - 1)}
                  style={{ 
                    opacity: pagination.hasPrevPage ? 1 : 0.5,
                    cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed'
                  }}
                >
                  <FaAngleLeft />
                  Prev
                </p>
              </div>
              <div className="sdPaginationNumber">
                <div className="paginationNum">
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <p 
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      style={{
                        backgroundColor: pagination.page === i + 1 ? '#c32929' : 'transparent',
                        color: pagination.page === i + 1 ? 'white' : 'black',
                        cursor: 'pointer'
                      }}
                    >
                      {i + 1}
                    </p>
                  ))}
                </div>
              </div>
              <div className="sdPaginationNext">
                <p 
                  onClick={() => pagination.hasNextPage && handlePageChange(pagination.page + 1)}
                  style={{ 
                    opacity: pagination.hasNextPage ? 1 : 0.5,
                    cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed'
                  }}
                >
                  Next
                  <FaAngleRight />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Drawer */}
      <div className={`filterDrawer ${isDrawerOpen ? "open" : ""}`}>
        <div className="drawerHeader">
          <p>Filter By</p>
          <IoClose onClick={closeDrawer} className="closeButton" size={26} />
        </div>
        <div className="drawerContent">
          <Filter />
        </div>
      </div>
    </>
  );
};

export default ShopDetails;
