# EventSphere REST API Documentation

Base URL: `http://localhost:8000/api/`

---

## 1. Authentication Endpoints (`/api/auth/`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register/` | Register a new user (`ADMIN`, `ORGANIZER`, `ATTENDEE`) | No |
| `POST` | `/api/auth/login/` | Log in and receive JWT access & refresh tokens | No |
| `POST` | `/api/auth/token/refresh/` | Refresh expired access token | No |
| `GET` | `/api/auth/profile/` | Get current logged-in user profile | Bearer Token |
| `PUT/PATCH` | `/api/auth/profile/` | Update profile information | Bearer Token |
| `POST` | `/api/auth/change-password/` | Change password for authenticated user | Bearer Token |
| `POST` | `/api/auth/password-reset/request/` | Request password reset email / token | No |
| `POST` | `/api/auth/password-reset/confirm/` | Confirm new password using token | No |
| `GET` | `/api/auth/organizers/popular/` | List top verified organizers | No |
| `GET` | `/api/auth/admin/users/` | List all registered users with role & search filter | Admin |
| `GET/PUT/DELETE` | `/api/auth/admin/users/{id}/` | Manage specific user record | Admin |

---

## 2. Events Endpoints (`/api/`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/categories/` | List all event categories | No |
| `GET` | `/api/events/` | Public discovery: filter by `category`, `search`, `city`, `date_filter`, `max_price`, `sort` | No |
| `GET` | `/api/events/featured/` | Get featured events list | No |
| `GET` | `/api/events/trending/` | Get trending events list | No |
| `GET` | `/api/events/upcoming/` | Get upcoming events list | No |
| `GET` | `/api/events/{slug}/` | Get full event details with tickets, speakers, schedule, gallery | No |
| `GET` | `/api/wishlist/` | Get user's saved wishlist events | Bearer Token |
| `POST` | `/api/wishlist/toggle/{event_id}/` | Toggle event in wishlist | Bearer Token |
| `GET/POST` | `/api/organizer/events/` | List or create events for organizer | Organizer / Admin |
| `GET/PUT/DELETE` | `/api/organizer/events/{id}/` | Retrieve, update or delete organizer event | Organizer / Admin |
| `GET` | `/api/organizer/analytics/` | Organizer KPIs, sales charts, attendee breakdown | Organizer / Admin |
| `GET` | `/api/admin/event-approvals/` | List events pending approval | Admin |
| `POST` | `/api/admin/event-approvals/{id}/approve/` | Approve event and publish live | Admin |
| `POST` | `/api/admin/event-approvals/{id}/reject/` | Reject event with feedback notes | Admin |
| `GET` | `/api/admin/analytics/` | Admin KPIs, platform revenue, category distribution | Admin |

---

## 3. Bookings & Coupons Endpoints (`/api/`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/coupons/validate/` | Validate coupon code against subtotal | Bearer Token |
| `POST` | `/api/bookings/create/` | Initialize booking with selected ticket items | Bearer Token |
| `GET` | `/api/bookings/` | Get booking history of current user | Bearer Token |
| `GET` | `/api/bookings/{id}/` | Get single booking details with line items | Bearer Token |
| `POST` | `/api/bookings/{id}/cancel/` | Cancel booking and release inventory | Bearer Token |
| `GET` | `/api/organizer/bookings/` | List all attendee bookings for organizer's events | Organizer / Admin |
| `GET` | `/api/admin/bookings/` | List all platform bookings | Admin |
| `GET/POST/PUT/DELETE` | `/api/admin/coupons/` | Admin CRUD for promo coupons | Admin |

---

## 4. Payments Endpoints (`/api/payments/`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/payments/create-order/` | Create Razorpay order for pending booking | Bearer Token |
| `POST` | `/api/payments/verify/` | Verify Razorpay payment signature & issue digital tickets | Bearer Token |
| `GET` | `/api/admin/payments/` | List all transactions with status and details | Admin |

---

## 5. Digital Tickets Endpoints (`/api/tickets/`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/tickets/` | Get digital ticket wallet for current user | Bearer Token |
| `GET` | `/api/tickets/{id}/` | View single digital ticket with QR payload | Bearer Token |
| `POST` | `/api/tickets/verify/` | Public / Scanner validation of QR ticket payload | No |
| `POST` | `/api/tickets/{id}/check-in/` | Check-in attendee at event gate | Organizer / Admin |

---

## 6. Reviews & Ratings Endpoints (`/api/`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/events/{event_id}/reviews/` | Get reviews and ratings for event | No |
| `POST` | `/api/events/{event_id}/reviews/` | Submit review (auto-flags verified attendee) | Bearer Token |
| `PUT/DELETE` | `/api/reviews/{id}/` | Edit or delete review | Bearer Token |

---

## 7. Notifications Endpoints (`/api/notifications/`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/notifications/` | List in-app alerts for logged-in user | Bearer Token |
| `POST` | `/api/notifications/{id}/read/` | Mark single notification as read | Bearer Token |
| `POST` | `/api/notifications/read-all/` | Mark all notifications as read | Bearer Token |
