import { BrowserRouter, Route, Routes } from "react-router-dom";

import SiteLayout from "./components/SiteLayout/SiteLayout";
import { RequireCustomer } from "./context/AuthContext";
import Home from "./Pages/Home/Home";
import Shop from "./Pages/Shop/Shop";
import ProductDetail from "./Pages/Product/ProductDetail";
import Cart from "./Pages/Cart/Cart";
import Checkout from "./Pages/Checkout/Checkout";
import OrderPlaced from "./Pages/Checkout/OrderPlaced";
import SignIn from "./Pages/Account/SignIn";
import AccountLayout from "./Pages/Account/AccountLayout";
import { OrderDetail, OrdersList } from "./Pages/Account/Orders";
import { RequestDetail, RequestsList } from "./Pages/Account/Requests";
import Profile from "./Pages/Account/Profile";
import Wishlist from "./Pages/Wishlist/Wishlist";
import Track from "./Pages/Track/Track";
import { RequestBook, SchoolOrders } from "./Pages/Requests/RequestForms";
import { Contact, Policy } from "./Pages/Info/InfoPages";
import ComingSoon from "./Pages/ComingSoon/ComingSoon";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<SiteLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/book/:slug" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-placed/:orderNo" element={<RequireCustomer><OrderPlaced /></RequireCustomer>} />

                    <Route path="/login" element={<SignIn />} />
                    <Route path="/account" element={<RequireCustomer><AccountLayout /></RequireCustomer>}>
                        <Route index element={<OrdersList />} />
                        <Route path="orders/:orderNo" element={<OrderDetail />} />
                        <Route path="requests" element={<RequestsList />} />
                        <Route path="requests/:requestNo" element={<RequestDetail />} />
                        <Route path="profile" element={<Profile />} />
                    </Route>
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/track" element={<Track />} />

                    <Route path="/request" element={<RequestBook />} />
                    <Route path="/school-orders" element={<SchoolOrders />} />

                    <Route path="/contact" element={<Contact />} />
                    <Route path="/policies/:policy" element={<Policy />} />
                    <Route path="*" element={<ComingSoon title="Page not found" note="That page isn't on our shelves." />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
