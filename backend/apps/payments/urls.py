from django.urls import path
from .views import CreateRazorpayOrderView, VerifyRazorpayPaymentView, AdminPaymentListView

urlpatterns = [
    path('payments/create-order/', CreateRazorpayOrderView.as_view(), name='create-razorpay-order'),
    path('payments/verify/', VerifyRazorpayPaymentView.as_view(), name='verify-razorpay-payment'),
    path('admin/payments/', AdminPaymentListView.as_view(), name='admin-payments-list'),
]
