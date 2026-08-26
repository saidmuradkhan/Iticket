import { Routes, Route, Navigate } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import MainLayout from './layouts/MainLayout'
import ProfileLayout from './layouts/ProfileLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home/Home'
import EventList from './pages/EventList/EventList'
import EventDetail from './pages/EventDetail/EventDetail'
import Cart from './pages/Cart/Cart'
import Order from './pages/Order/Order'
import PaymentResult from './pages/PaymentResult/PaymentResult'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Tickets from './Profile/Tickets'
import Transfers from './Profile/Transfers'
import Orders from './Profile/Orders'
import AccountInfo from './Profile/AccountInfo'
import Favorites from './Profile/Favorites'
import Wallet from './Profile/Wallet'
import GiftCard from './Profile/GiftCard'
import ChangePassword from './Profile/ChangePassword'
import NotificationSettings from './Profile/NotificationSettings'
import RefundRequests from './Profile/RefundRequests'
import Faq from './Profile/Faq'

const App = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/events/:category" element={<EventList />} />
        <Route path="/search/:query" element={<EventList />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order/:orderId" element={<Order />} />
        <Route path="/payment/result" element={<PaymentResult />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<ProfileLayout />}>
            <Route path="/profile" element={<Navigate to="/profile/tickets" replace />} />
            <Route path="/profile/tickets" element={<Tickets />} />
            <Route path="/profile/transfers" element={<Transfers />} />
            <Route path="/profile/orders" element={<Orders />} />
            <Route path="/profile/account" element={<AccountInfo />} />
            <Route path="/profile/favorites" element={<Favorites />} />
            <Route path="/profile/wallet" element={<Wallet />} />
            <Route path="/profile/gift-card" element={<GiftCard />} />
            <Route path="/profile/change-password" element={<ChangePassword />} />
            <Route path="/profile/notifications" element={<NotificationSettings />} />
            <Route path="/profile/refunds" element={<RefundRequests />} />
            <Route path="/profile/faq" element={<Faq />} />
          </Route>
        </Route>
      </Route>
    </Routes>
    </>
  )
}

export default App
