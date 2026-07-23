import React from 'react'

const App = () => {
  return (
    <div>
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
    </div>
  )
}

export default App
