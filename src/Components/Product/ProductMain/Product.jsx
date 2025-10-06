import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";

import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../../Features/Cart/cartSlice";
import { useProducts } from "../../../contexts/ProductsContext";
import { useCart } from "../../../contexts/CartContext";

import product1 from "../../../Assets/ProductDetail/productdetail-1.jpg";
import product2 from "../../../Assets/ProductDetail/productdetail-2.jpg";
import product3 from "../../../Assets/ProductDetail/productdetail-3.jpg";
import product4 from "../../../Assets/ProductDetail/productdetail-4.jpg";

import { GoChevronLeft } from "react-icons/go";
import { GoChevronRight } from "react-icons/go";
import { FaStar } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import { PiShareNetworkLight } from "react-icons/pi";

import { Link } from "react-router-dom";

import toast from "react-hot-toast";
import { formatPrice } from "../../../utils/currency";

import "./Product.css";

const Product = () => {
  const { id } = useParams();
  const { fetchProduct } = useProducts();
  const { addToCart: addToBackendCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadedProductId = useRef(null);

  // Product images Gallery
  const productImg = [product1, product2, product3, product4];
  const [currentImg, setCurrentImg] = useState(0);

  const prevImg = () => {
    setCurrentImg(currentImg === 0 ? productImg.length - 1 : currentImg - 1);
  };

  const nextImg = () => {
    setCurrentImg(currentImg === productImg.length - 1 ? 0 : currentImg + 1);
  };

  // Product Quantity

  const [quantity, setQuantity] = useState(1);

  const increment = () => {
    setQuantity(quantity + 1);
  };

  const decrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleInputChange = (event) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  // Product WishList

  const [clicked, setClicked] = useState(false);

  const handleWishClick = () => {
    setClicked(!clicked);
  };

  // Fetch product data on component mount
  useEffect(() => {
    const loadProduct = async () => {
      if (id && loadedProductId.current !== id) { // Only fetch if we haven't loaded this product yet
        try {
          setIsLoading(true);
          setError(null);
          const result = await fetchProduct(id);
          console.log('Fetch product result:', result);
          if (result.success) {
            console.log('Product data received:', result.data);
            setProduct(result.data);
            loadedProductId.current = id; // Mark this product as loaded
          } else {
            console.error('Failed to fetch product:', result.error);
            setError(result.error || 'Failed to load product');
            toast.error('Failed to load product details');
          }
        } catch (err) {
          setError(err.message || 'Failed to load product');
          toast.error('Failed to load product details');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadProduct();
  }, [id]); // Only depend on id

  // Product Sizes - use backend data if available
  const sizes = product?.sizes 
    ? product.sizes.map(size => typeof size === 'object' ? size.size : size)
    : ["XS", "S", "M", "L", "XL"];
    
  const sizesFullName = [
    "Extra Small",
    "Small",
    "Medium",
    "Large",
    "Extra Large",
  ];
  const [selectSize, setSelectSize] = useState("S");

  // Product Colors - use backend data if available
  const [highlightedColor, setHighlightedColor] = useState("#C8393D");
  
  // Handle backend color format (objects with name and code) or fallback to simple strings
  const colors = product?.colors 
    ? product.colors.map(color => {
        if (typeof color === 'object' && color.code) {
          return color.code;
        }
        return typeof color === 'string' ? color : '#cccccc';
      })
    : ["#222222", "#C8393D", "#E4E4E4"];
    
  const colorsName = product?.colors 
    ? product.colors.map(color => {
        if (typeof color === 'object' && color.name) {
          return color.name;
        }
        return typeof color === 'string' ? color : 'Unknown';
      })
    : ["Black", "Red", "Grey"];

  // Update selected size and color when product loads
  useEffect(() => {
    if (product) {
      const firstSize = product.sizes?.[0];
      const sizeValue = typeof firstSize === 'object' ? firstSize.size : firstSize;
      setSelectSize(sizeValue || "S");
      
      const firstColor = product.colors?.[0];
      if (firstColor) {
        const colorCode = typeof firstColor === 'object' ? firstColor.code : firstColor;
        setHighlightedColor(colorCode || "#C8393D");
      }
    }
  }, [product]);

  // Product Detail to Redux

  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart.items);

  const handleAddToCart = async () => {
    if (!product || !product.productID) {
      toast.error('Product not loaded yet. Please wait.');
      return;
    }

    // Ensure color object has the correct structure for backend validation
    let colorObj = null;
    if (highlightedColor) {
      // Try to find the color from product colors first
      const productColor = product.colors?.find(c => c.code === highlightedColor);
      
      if (productColor) {
        colorObj = {
          name: productColor.name || 'Default',
          code: productColor.code
        };
      } else {
        // Fallback: create color object with hex code validation
        const isValidHex = /^#[0-9A-F]{6}$/i.test(highlightedColor);
        colorObj = {
          name: 'Custom',
          code: isValidHex ? highlightedColor : '#000000'
        };
      }
    }

    console.log('Adding to cart:', {
      productID: product.productID,
      quantity,
      size: selectSize,
      color: colorObj
    });

    try {
      await addToBackendCart(product.productID, quantity, selectSize, colorObj);
      toast.success(`${product.name} added to cart!`, {
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
    } catch (error) {
      // Fallback to Redux if backend fails
      const fallbackProductDetails = {
        productID: product._id,
        productName: product.name,
        productPrice: product.price,
        frontImg: product.images?.[0] || productImg[0],
        productReviews: `${product.reviewCount || 0} reviews`,
        quantity: quantity,
        size: selectSize,
        color: highlightedColor
      };

      const productInCart = cartItems.find(
        (item) => item.productID === fallbackProductDetails.productID
      );

      if (productInCart && productInCart.quantity >= 20) {
        toast.error("Product limit reached", {
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
      } else {
        dispatch(addToCart(fallbackProductDetails));
        toast.success(`${product.name} added to cart!`, {
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
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="productSection">
        <div className="loading-container" style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Loading product details...</h2>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="productSection">
        <div className="error-container" style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Error loading product</h2>
          <p>{error}</p>
          <Link to="/shop" style={{ color: '#007bff', textDecoration: 'underline' }}>
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  // No product found
  if (!product) {
    return (
      <div className="productSection">
        <div className="error-container" style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Product not found</h2>
          <Link to="/shop" style={{ color: '#007bff', textDecoration: 'underline' }}>
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  // Use product images if available, otherwise fallback to default images
  const displayImages = product.images && product.images.length > 0 ? product.images : productImg;

  return (
    <>
      <div className="productSection">
        <div className="productShowCase">
          <div className="productGallery">
            <div className="productThumb">
              {displayImages.map((img, index) => (
                <img 
                  key={index}
                  src={img} 
                  onClick={() => setCurrentImg(index)} 
                  alt={`${product.name} ${index + 1}`} 
                />
              ))}
            </div>
            <div className="productFullImg">
              <img src={displayImages[currentImg]} alt={product.name} />
              <div className="buttonsGroup">
                <button onClick={prevImg} className="directionBtn">
                  <GoChevronLeft size={18} />
                </button>
                <button onClick={nextImg} className="directionBtn">
                  <GoChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
          <div className="productDetails">
            <div className="productBreadcrumb">
              <div className="breadcrumbLink">
                <Link to="/">Home</Link>&nbsp;/&nbsp;
                <Link to="/shop">The Shop</Link>
              </div>
              <div className="prevNextLink">
                <Link to="/product">
                  <GoChevronLeft />
                  <p>Prev</p>
                </Link>
                <Link to="/product">
                  <p>Next</p>
                  <GoChevronRight />
                </Link>
              </div>
            </div>
            <div className="productName">
              <h1>{product.name}</h1>
            </div>
            <div className="productRating">
              {[...Array(5)].map((_, index) => (
                <FaStar 
                  key={index}
                  color={index < Math.floor(product.rating || 5) ? "#FEC78A" : "#e0e0e0"} 
                  size={10} 
                />
              ))}
              <p>{product.reviewCount || 0} reviews</p>
            </div>
            <div className="productPrice">
              <h3>{formatPrice(product.price)}</h3>
            </div>
            <div className="productDescription">
              <p>{product.description}</p>
            </div>
            <div className="productSizeColor">
              <div className="productSize">
                <p>Sizes</p>
                <div className="sizeBtn">
                  {sizes.map((size, index) => (
                    <Tooltip
                      key={size}
                      title={sizesFullName[index]}
                      placement="top"
                      TransitionComponent={Zoom}
                      enterTouchDelay={0}
                      arrow
                    >
                      <button
                        style={{
                          borderColor: selectSize === size ? "#000" : "#e0e0e0",
                        }}
                        onClick={() => setSelectSize(size)}
                      >
                        {size}
                      </button>
                    </Tooltip>
                  ))}
                </div>
              </div>
              <div className="productColor">
                <p>Color</p>
                <div className="colorBtn">
                  {colors.filter(color => color && typeof color === 'string').map((color, index) => (
                    <Tooltip
                      key={`${color}-${index}`}
                      title={typeof colorsName[index] === 'string' ? colorsName[index] : 'Color'}
                      placement="top"
                      enterTouchDelay={0}
                      TransitionComponent={Zoom}
                      arrow
                    >
                      <button
                        className={
                          highlightedColor === color ? "highlighted" : ""
                        }
                        style={{
                          backgroundColor: color.toLowerCase(),
                          border:
                            highlightedColor === color
                              ? "0px solid #000"
                              : "0px solid white",
                          padding: "8px",
                          margin: "5px",
                          cursor: "pointer",
                        }}
                        onClick={() => setHighlightedColor(color)}
                      />
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>
            <div className="productCartQuantity">
              <div className="productQuantity">
                <button onClick={decrement}>-</button>
                <input
                  type="text"
                  value={quantity}
                  onChange={handleInputChange}
                />
                <button onClick={increment}>+</button>
              </div>
              <div className="productCartBtn">
                <button onClick={handleAddToCart}>Add to Cart</button>
              </div>
            </div>
            <div className="productWishShare">
              <div className="productWishList">
                <button onClick={handleWishClick}>
                  <FiHeart color={clicked ? "red" : ""} size={17} />
                  <p>Add to Wishlist</p>
                </button>
              </div>
              <div className="productShare">
                <PiShareNetworkLight size={22} />
                <p>Share</p>
              </div>
            </div>
            <div className="productTags">
              <p>
                <span>SKU: </span>{product.sku || 'N/A'}
              </p>
              <p>
                <span>CATEGORIES: </span>{product.category || 'General'}
              </p>
              <p>
                <span>TAGS: </span>{product.tags?.join(', ') || 'No tags'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Product;
