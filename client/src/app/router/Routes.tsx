import { createBrowserRouter, Navigate } from "react-router-dom";
import AboutPage from "../../features/about/AboutPage";
import Login from "../../features/account/Login";
import Register from "../../features/account/Register";
import Inventory from "../../features/admin/Inventory";
import BasketPage from "../../features/basket/BasketPage";
import Catalog from "../../features/catalog/Catalog";
import ProductDetails from "../../features/catalog/ProductDetails";
import CheckoutWrapper from "../../features/checkout/CheckoutWrapper";
import ContactPage from "../../features/contact/ContactPage";
import Orders from "../../features/orders/Orders";
import NotFound from "../errors/NotFound";
import ServerError from "../errors/ServerError";
import App from "../layout/App";
import RequireAuth from "./RequireAuth";
import Dashboard from "../../features/dashboard/Dashboard";
import Chat from "../../features/Chats/Chat";
import UserManagement from "../../features/userManagement";
import Coupon from "../../features/coupon/coupon";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // authenticated routes
      {
        element: <RequireAuth />,
        children: [
          { path: "checkout", element: <CheckoutWrapper /> },
          { path: "orders", element: <Orders /> },
          { path: "chat", element: <Chat /> },
        ],
      },
      // admin routes
      {
        element: <RequireAuth roles={["Admin"]} />,
        children: [{ path: "inventory", element: <Inventory /> }],
      },
      {
        element: <RequireAuth roles={["Admin"]} />,
        children: [{ path: "coupons", element: <Coupon /> }],
      },
      {
        element: <RequireAuth roles={["Admin"]} />,
        children: [{ path: "dashboard", element: <Dashboard /> }],
      },
      {
        element: <RequireAuth roles={["Admin"]} />,
        children: [{ path: "users", element: <UserManagement /> }],
      },
      { path: "catalog", element: <Catalog /> },
      { path: "catalog/:id", element: <ProductDetails /> },
      { path: "about", element: <AboutPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "server-error", element: <ServerError /> },
      { path: "not-found", element: <NotFound /> },
      { path: "basket", element: <BasketPage /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "*", element: <Navigate replace to="/not-found" /> },
    ],
  },
]);
