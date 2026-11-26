from django.contrib import admin
from django.utils.html import format_html

from .models import VideoUpload, VideoFrame

class VideoFrameInline(admin.TabularInline):
    model = VideoFrame
    extra = 0
    readonly_fields = ('image_preview', 'folder_location', 'sequence_number')
    fields = ('sequence_number', 'folder_location', 'image_preview')

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:100px;"/>', obj.image.url)
        return ""
    image_preview.short_description = "Image Preview"

from fixitall_backend.admin_site import fixitall_admin

@admin.register(VideoUpload)
class VideoUploadAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'original_filename', 'company', 'status', 'duration_seconds',
        'frame_count', 'folder_name', 'created_at',
    )
    list_filter = ('status', 'company')
    search_fields = ('original_filename', 'folder_name')
    inlines = [VideoFrameInline]

try:
    fixitall_admin.register(VideoUpload, VideoUploadAdmin)
except admin.sites.AlreadyRegistered:
    pass
