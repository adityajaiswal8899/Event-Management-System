import json
import io
import qrcode
from django.core.files.base import ContentFile
from django.db import transaction
from .models import Ticket

def generate_tickets_for_booking(booking):
    """
    Generates unique digital QR tickets for every ticket item in a confirmed booking,
    and decrements inventory.
    """
    created_tickets = []
    
    with transaction.atomic():
        for item in booking.items.all():
            ticket_type = item.ticket_type
            qty = item.quantity

            # Decrement inventory
            ticket_type.available_quantity = max(0, ticket_type.available_quantity - qty)
            ticket_type.save()

            for i in range(qty):
                # Unique QR data
                seat_label = f"{ticket_type.name[:3].upper()}-{ticket_type.total_quantity - ticket_type.available_quantity + i + 1:03d}"
                
                ticket = Ticket.objects.create(
                    booking=booking,
                    booking_item=item,
                    event=booking.event,
                    user=booking.user,
                    ticket_type=ticket_type,
                    attendee_name=booking.attendee_name,
                    attendee_email=booking.attendee_email,
                    seat_label=seat_label
                )

                qr_payload = {
                    'ticket_id': str(ticket.id),
                    'ticket_number': ticket.ticket_number,
                    'event_id': str(booking.event.id),
                    'event_title': booking.event.title,
                    'user_id': booking.user.id,
                    'user_email': booking.user.email,
                    'attendee_name': booking.attendee_name,
                    'ticket_type': ticket_type.name,
                    'seat_label': seat_label,
                    'start_date': str(booking.event.start_date),
                    'start_time': str(booking.event.start_time),
                    'venue': booking.event.venue_name or booking.event.city or 'Online',
                    'status': 'VALID'
                }
                
                ticket.qr_code_data = json.dumps(qr_payload)

                # Generate QR code image
                try:
                    qr = qrcode.QRCode(
                        version=1,
                        error_correction=qrcode.constants.ERROR_CORRECT_M,
                        box_size=8,
                        border=2,
                    )
                    qr.add_data(ticket.qr_code_data)
                    qr.make(fit=True)
                    img = qr.make_image(fill_color="black", back_color="white")
                    
                    buffer = io.BytesIO()
                    img.save(buffer, format='PNG')
                    file_name = f"qr_{ticket.ticket_number}.png"
                    ticket.qr_code_image.save(file_name, ContentFile(buffer.getvalue()), save=False)
                except Exception:
                    pass

                ticket.save()
                created_tickets.append(ticket)

    return created_tickets
