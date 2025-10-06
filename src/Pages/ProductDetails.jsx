import React from "react";
import { useParams } from "react-router-dom";
import AdditionalInfo from "../Components/Product/AdditonInfo/AdditionalInfo";
import Product from "../Components/Product/ProductMain/Product";
import RelatedProducts from "../Components/Product/RelatedProducts/RelatedProducts";

const ProductDetails = () => {
  const { id } = useParams();

  return (
    <>
      <Product />
      <AdditionalInfo />
      <RelatedProducts currentProductId={id} />
    </>
  );
};

export default ProductDetails;
