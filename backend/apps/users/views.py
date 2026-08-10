from rest_framework import generics, status, views, permissions
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from .models import User, UserRole, PasswordResetToken
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    ChangePasswordSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer
)
from .permissions import IsAdminUser

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Log welcome email (or send)
        try:
            send_mail(
                subject='Welcome to EventSphere!',
                message=f'Hello {user.full_name},\n\nThank you for registering at EventSphere – Smart Event Management Platform.\n\nBest regards,\nEventSphere Team',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except Exception:
            pass

        return Response({
            'message': 'Registration successful! You can now log in.',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class CurrentUserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'message': 'Password updated successfully.'}, status=status.HTTP_200_OK)


class PasswordResetRequestView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
            reset_token = PasswordResetToken.objects.create(user=user)
            
            # Send password reset email
            try:
                send_mail(
                    subject='EventSphere - Password Reset Request',
                    message=f'Hello {user.full_name},\n\nUse token {reset_token.token} to reset your password within 2 hours.\n\nBest regards,\nEventSphere Team',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=True,
                )
            except Exception:
                pass

            return Response({
                'message': 'If an account exists with this email, a reset token has been sent.',
                'token': str(reset_token.token) if settings.DEBUG else None
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'message': 'If an account exists with this email, a reset token has been sent.'}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token_str = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        try:
            token_obj = PasswordResetToken.objects.get(token=token_str)
            if not token_obj.is_valid():
                return Response({'error': 'Reset token is invalid or expired.'}, status=status.HTTP_400_BAD_REQUEST)

            token_obj.user.set_password(new_password)
            token_obj.user.save()
            token_obj.used = True
            token_obj.save()

            return Response({'message': 'Password reset successful. You can now login.'}, status=status.HTTP_200_OK)
        except PasswordResetToken.DoesNotExist:
            return Response({'error': 'Invalid reset token.'}, status=status.HTTP_400_BAD_REQUEST)


class AdminUserListView(generics.ListCreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = User.objects.all().order_by('-created_at')
        role = self.request.query_params.get('role')
        search = self.request.query_params.get('search')
        if role:
            queryset = queryset.filter(role=role)
        if search:
            queryset = queryset.filter(username__icontains=search) | queryset.filter(email__icontains=search) | queryset.filter(first_name__icontains=search)
        return queryset


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    queryset = User.objects.all()


class OrganizerPublicListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return User.objects.filter(role=UserRole.ORGANIZER, is_active=True).order_by('-created_at')[:10]
