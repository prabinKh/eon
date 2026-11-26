from django.urls import path

from .views import VideoUploadView, VideoListView, VideoDetailView, VideoDownloadZipView

urlpatterns = [
    path('upload/', VideoUploadView.as_view(), name='video-upload'),
    path('', VideoListView.as_view(), name='video-list'),
    path('<int:pk>/', VideoDetailView.as_view(), name='video-detail'),
    path('<int:pk>/download-zip/', VideoDownloadZipView.as_view(), name='video-download-zip'),
]
