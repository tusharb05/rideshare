from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model

class Ride(models.Model):
    class RideStatus(models.TextChoices):
        UPCOMING = 'UPCOMING', 'Upcoming'
        ONGOING = 'ONGOING', 'Ongoing'
        COMPLETED = 'COMPLETED', 'Completed'
        ABORTED = 'ABORTED', 'Aborted'

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_rides'
    )

    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='rides_joined',
        blank=True
    )

    pickup_latitude = models.FloatField()
    pickup_longitude = models.FloatField()

    destination_latitude = models.FloatField()
    destination_longitude = models.FloatField()

    total_seats = models.PositiveIntegerField(default=1)
    seats_available = models.PositiveIntegerField()
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)
    cost_per_seat = models.DecimalField(max_digits=10, decimal_places=2, editable=False)

    status = models.CharField(
        max_length=10,
        choices=RideStatus.choices,
        default=RideStatus.UPCOMING
    )

    departure_datetime = models.DateTimeField()

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.pk:
            self.seats_available = max(self.total_seats - 1, 0)
        if self.total_seats > 0:
            self.cost_per_seat = self.total_cost / self.total_seats
        else:
            self.cost_per_seat = 0
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.owner.full_name}'s ride on {self.departure_datetime.strftime('%Y-%m-%d %H:%M')}"


class RideJoinRequest(models.Model):
    class RequestStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        REJECTED = 'REJECTED', 'Rejected'

    ride = models.ForeignKey('rides.Ride', on_delete=models.CASCADE, related_name='join_requests')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ride_requests')
    status = models.CharField(max_length=10, choices=RequestStatus.choices, default=RequestStatus.PENDING)
    requested_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['ride', 'user']

    def __str__(self):
        return f"{self.user.full_name} → {self.ride} ({self.status})"