import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import ProfileLayout from './layouts/ProfileLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home/Home'
import EventList from './pages/EventList/EventList'
import EventDetail from './pages/EventDetail/EventDetail'
import SeatSelection from './pages/SeatSelection/SeatSelection'
import Cart from './pages/Cart/Cart'
import Order from './pages/Order/Order'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Tickets from './Profile/Tickets'
import Orders from './Profile/Orders'
import Favorites from './Profile/Favorites'
import AccountInfo from './Profile/AccountInfo'

const App = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<EventList type="concert" />} />
        <Route path="/shows" element={<EventList type="theatre" />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/event/:id/seats" element={<SeatSelection />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order/:orderId" element={<Order />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<ProfileLayout />}>
            <Route path="/profile/tickets" element={<Tickets />} />
            <Route path="/profile/orders" element={<Orders />} />
            <Route path="/profile/favorites" element={<Favorites />} />
            <Route path="/profile/account" element={<AccountInfo />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default App
