import os

from django.conf import settings
from django.utils.text import slugify
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import VideoUpload, VideoFrame
from .serializers import VideoUploadSerializer
from .utils import (
    VideoProcessingError,
    extract_evenly_spaced_frames,
    get_video_duration,
)


def build_unique_folder_name(base_name):
    """
    Turn the uploaded video's filename (without extension) into a safe,
    unique slug to use as its frames folder name, e.g.
    'My Vacation Clip.mp4' -> 'my-vacation-clip', or 'my-vacation-clip-2'
    if that folder is already taken.
    """
    slug = slugify(base_name) or 'video'
    candidate = slug
    counter = 2
    frames_root = os.path.join(settings.MEDIA_ROOT, 'frames')
    while os.path.isdir(os.path.join(frames_root, candidate)):
        candidate = f"{slug}-{counter}"
        counter += 1
    return candidate


class VideoUploadView(APIView):
    """
    POST multipart/form-data with a 'video_file' field.

    Validates that the video is between MIN_VIDEO_DURATION_SECONDS and
    MAX_VIDEO_DURATION_SECONDS (1–3 minutes by default), then extracts
    FRAME_EXTRACTION_COUNT (30) evenly spaced frames and saves them to
    media/frames/<video-name-slug>/frame_001.jpg ... frame_030.jpg
    """
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        video_file = request.FILES.get('video_file')
        if not video_file:
            return Response(
                {'error': "No file uploaded. Send it as 'video_file' in form-data."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        original_filename = video_file.name
        name_without_ext, _ext = os.path.splitext(original_filename)

        # Resolve tenant company hierarchy
        from company.models import Company
        company = Company.resolve_from_request(request)

        # 1. Save the DB row + raw video file first.
        video_upload = VideoUpload.objects.create(
            company=company,
            video_file=video_file,
            original_filename=original_filename,
            status=VideoUpload.STATUS_PROCESSING,
        )

        try:
            video_path = video_upload.video_file.path

            # 2. Check the video's duration.
            duration_seconds, fps, total_frames = get_video_duration(video_path)

            min_secs = getattr(settings, 'MIN_VIDEO_DURATION_SECONDS', 0.5)
            max_secs = getattr(settings, 'MAX_VIDEO_DURATION_SECONDS', 300.0)
            if not (min_secs <= duration_seconds <= max_secs):
                video_upload.status = VideoUpload.STATUS_FAILED
                video_upload.duration_seconds = duration_seconds
                video_upload.fps = fps
                video_upload.error_message = (
                    f"Video duration is {duration_seconds:.1f}s. "
                    f"Only videos between {min_secs}s and {max_secs}s "
                    f"are accepted."
                )
                video_upload.save()
                # Clean up the stored file for rejected videos.
                video_upload.video_file.delete(save=False)
                return Response(
                    {'error': video_upload.error_message},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 3. Build a unique output folder named after the uploaded video.
            folder_name = build_unique_folder_name(name_without_ext)
            output_folder = os.path.join(settings.MEDIA_ROOT, 'frames', folder_name)

            # 4. Extract N evenly spaced frames across the whole video.
            num_frames = getattr(settings, 'FRAME_EXTRACTION_COUNT', 30)
            saved_filenames = extract_evenly_spaced_frames(
                video_path, output_folder, num_frames=num_frames
            )

            # 5. Update the DB row with the results.
            video_upload.folder_name = folder_name
            video_upload.duration_seconds = duration_seconds
            video_upload.fps = fps
            video_upload.frame_count = len(saved_filenames)
            video_upload.status = VideoUpload.STATUS_COMPLETED
            video_upload.save()

            # 6. Create VideoFrame records in the database
            for index, filename in enumerate(saved_filenames, start=1):
                VideoFrame.objects.create(
                    video=video_upload,
                    sequence_number=index,
                    folder_location=folder_name,
                    image=os.path.join('frames', folder_name, filename)
                )

        except VideoProcessingError as exc:
            video_upload.status = VideoUpload.STATUS_FAILED
            video_upload.error_message = str(exc)
            video_upload.save()
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as exc:  # noqa: BLE001 - surface unexpected errors too
            video_upload.status = VideoUpload.STATUS_FAILED
            video_upload.error_message = f"Unexpected error: {exc}"
            video_upload.save()
            return Response(
                {'error': f"Unexpected error while processing video: {exc}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        serializer = VideoUploadSerializer(video_upload, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class VideoListView(ListAPIView):
    serializer_class = VideoUploadSerializer

    def get_queryset(self):
        qs = VideoUpload.objects.all()
        from company.models import Company
        company = Company.resolve_from_request(self.request)
        if company:
            qs = qs.filter(company=company)
        return qs


class VideoDetailView(RetrieveAPIView):
    serializer_class = VideoUploadSerializer

    def get_queryset(self):
        qs = VideoUpload.objects.all()
        from company.models import Company
        company = Company.resolve_from_request(self.request)
        if company:
            qs = qs.filter(company=company)
        return qs


import zipfile
import io
from django.http import HttpResponse
from django.shortcuts import get_object_or_404

class VideoDownloadZipView(APIView):
    def get(self, request, pk, *args, **kwargs):
        video_upload = get_object_or_404(VideoUpload, pk=pk)
        
        if video_upload.status != VideoUpload.STATUS_COMPLETED:
            return Response({'error': 'Video processing not completed.'}, status=400)
            
        frames_dir = os.path.join(settings.MEDIA_ROOT, 'frames', video_upload.folder_name)
        if not os.path.isdir(frames_dir):
            return Response({'error': 'Frames directory not found.'}, status=404)

        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for root, _, files in os.walk(frames_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.join(video_upload.folder_name, file)
                    zip_file.write(file_path, arcname)

        zip_buffer.seek(0)
        
        response = HttpResponse(zip_buffer, content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename="{video_upload.folder_name}_frames.zip"'
        return response
