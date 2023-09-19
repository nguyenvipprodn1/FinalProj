import { useState } from "react";
import {
  Product,
  ProductActionButton,
  ProductActionsWrapper,
  ProductAddToCart,
  ProductFavButton,
  ProductImage,
} from "../../styles/product";
import { Stack, Tooltip } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import FitScreenIcon from "@mui/icons-material/FitScreen";
import useDialogModal from "../../hooks/useDialogModal";
import ProductDetail from "../productdetail";
import ProductMeta from "./ProductMeta";
import { Link } from "react-router-dom";
import { useAppDispatch } from "../../../../app/store/configureStore";
import { addBasketItemAsync } from "../../../basket/basketSlice";

export default function SingleProductDesktop({ product, matches }) {
  const [ProductDetailDialog] = useDialogModal(ProductDetail);

  const dispatch = useAppDispatch();

  const [showOptions, setShowOptions] = useState(false);

  const handleMouseEnter = () => {
    setShowOptions(true);
  };
  const handleMouseLeave = () => {
    setShowOptions(false);
  };
  return (
    <>
      <Product onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <ProductImage src={product.pictureUrl} />
        <ProductFavButton isfav={0}>
          <FavoriteIcon />
        </ProductFavButton>
        {(showOptions || matches) && (
          <ProductAddToCart
            sx={{
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "#d1adcc",
                boxShadow: "none",
              },
            }}
            show={showOptions}
            variant="contained"
            onClick={() =>
              dispatch(addBasketItemAsync({ productId: product.id }))
            }
          >
            Add to cart
          </ProductAddToCart>
        )}
        <ProductActionsWrapper show={showOptions || matches}>
          <Stack direction={matches ? "row" : "column"}>
            <ProductActionButton>
              <Tooltip placement="left" title="share this product">
                <ShareIcon
                  sx={{
                    color: "#d1adcc",
                  }}
                />
              </Tooltip>
            </ProductActionButton>
            <ProductActionButton component={Link} to={`/catalog/${product.id}`}>
              <Tooltip placement="left" title="Full view">
                <FitScreenIcon
                  sx={{
                    color: "#d1adcc",
                  }}
                />
              </Tooltip>
            </ProductActionButton>
          </Stack>
        </ProductActionsWrapper>
      </Product>
      <ProductMeta product={product} />
      <ProductDetailDialog product={product} />
    </>
  );
}
