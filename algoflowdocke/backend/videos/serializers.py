import os

from django.conf import settings
from rest_framework import serializers

from .models import VideoUpload


class VideoUploadSerializer(serializers.ModelSerializer):
    frames = serializers.SerializerMethodField()
    video_url = serializers.SerializerMethodField()

    class Meta:
        model = VideoUpload
        fields = [
            'id',
            'original_filename',
            'folder_name',
            'video_url',
            'duration_seconds',
            'fps',
            'frame_count',
            'status',
            'error_message',
            'frames',
            'created_at',
        ]
        read_only_fields = fields

    def get_video_url(self, obj):
        request = self.context.get('request')
        if not obj.video_file:
            return None
        url = obj.video_file.url
        return request.build_absolute_uri(url) if request else url

    def get_frames(self, obj):
        """List of absolute URLs for every extracted frame image, in order."""
        if obj.status != VideoUpload.STATUS_COMPLETED or not obj.folder_name:
            return []

        frames_dir = os.path.join(settings.MEDIA_ROOT, 'frames', obj.folder_name)
        if not os.path.isdir(frames_dir):
            return []

        request = self.context.get('request')
        filenames = sorted(
            f for f in os.listdir(frames_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))
        )

        urls = []
        for filename in filenames:
            rel_url = f"{settings.MEDIA_URL}frames/{obj.folder_name}/{filename}"
            urls.append(request.build_absolute_uri(rel_url) if request else rel_url)
        return urls


class VideoUploadCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoUpload
        fields = ['video_file']
