import os

from django.db import models


def video_upload_path(instance, filename):
    """Store the raw uploaded video under media/videos/<filename>."""
    return os.path.join('videos', filename)


class VideoUpload(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_PROCESSING = 'processing'
    STATUS_COMPLETED = 'completed'
    STATUS_FAILED = 'failed'

    STATUS_CHOICES = (
        (STATUS_PENDING, 'Pending'),
        (STATUS_PROCESSING, 'Processing'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_FAILED, 'Failed'),
    )

    video_file = models.FileField(upload_to=video_upload_path)
    company = models.ForeignKey('company.Company', on_delete=models.CASCADE, related_name='video_uploads', null=True, blank=True)
    original_filename = models.CharField(max_length=255, blank=True)
    # Name of the sub-folder under media/frames/ that holds this video's frames.
    # Derived from the video filename (without extension), de-duplicated.
    folder_name = models.SlugField(max_length=255, blank=True)

    duration_seconds = models.FloatField(null=True, blank=True)
    fps = models.FloatField(null=True, blank=True)
    frame_count = models.PositiveIntegerField(default=0)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    error_message = models.TextField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.original_filename or f"Video #{self.pk}"


def frame_upload_path(instance, filename):
    return os.path.join('frames', instance.folder_location, filename)


class VideoFrame(models.Model):
    video = models.ForeignKey(VideoUpload, related_name='frames_db', on_delete=models.CASCADE)
    sequence_number = models.PositiveIntegerField()
    folder_location = models.CharField(max_length=255)
    image = models.ImageField(upload_to=frame_upload_path, max_length=500)

    class Meta:
        ordering = ['sequence_number']

    def __str__(self):
        return f"Frame {self.sequence_number} for {self.video.original_filename}"
