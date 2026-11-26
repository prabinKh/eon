"""
Core video-processing helpers.

Uses OpenCV (cv2) to:
  1. Inspect an uploaded video to determine its duration (in seconds).
  2. Extract N evenly-spaced frames across the full length of the video
     and save them as JPG images into a per-video folder.

OpenCV is used here (instead of shelling out to ffmpeg directly) so the
whole pipeline works from a single pip-installable dependency
(opencv-python-headless). If you run into videos with unusual codecs that
OpenCV's bundled backend can't decode, installing the system `ffmpeg`
binary generally fixes it too, since OpenCV can use it under the hood.
"""
import os

import cv2


class VideoProcessingError(Exception):
    """Raised when a video file can't be read or processed."""
    pass


def get_video_duration(video_path):
    """
    Return (duration_seconds, fps, total_frame_count) for the video at video_path.
    Includes robust fallbacks for videos without stream header frame counts/FPS.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        cap.release()
        raise VideoProcessingError(
            "Could not open the video file. It may be corrupted or in an unsupported format."
        )

    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)

    if not fps or fps <= 0:
        fps = 30.0

    if total_frames <= 0:
        # Fallback: read through stream to count frames if header doesn't specify frame count
        count = 0
        while True:
            ret, _ = cap.read()
            if not ret:
                break
            count += 1
        total_frames = count
        cap.release()
    else:
        cap.release()

    if total_frames <= 0:
        raise VideoProcessingError("Video file appears to contain no readable frames.")

    duration_seconds = total_frames / fps
    return duration_seconds, fps, total_frames


def extract_evenly_spaced_frames(video_path, output_folder, num_frames=30):
    """
    Extract `num_frames` evenly spaced frames from video_path and save
    them as frame_001.jpg, frame_002.jpg, ... inside output_folder.

    Returns a list of the saved filenames, in order.
    """
    os.makedirs(output_folder, exist_ok=True)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        cap.release()
        raise VideoProcessingError("Could not open the video file for frame extraction.")

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)

    # Fallback path if header frame count is missing or 0
    if total_frames <= 0:
        frames_list = []
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frames_list.append(frame)
        cap.release()

        total_frames = len(frames_list)
        if total_frames == 0:
            raise VideoProcessingError("Video appears to have no readable frames.")

        effective_num_frames = min(num_frames, total_frames)
        frame_indices = [
            int(round(i * total_frames / effective_num_frames))
            for i in range(effective_num_frames)
        ]
        frame_indices = [min(idx, total_frames - 1) for idx in frame_indices]

        saved_filenames = []
        for order, frame_no in enumerate(frame_indices, start=1):
            frame = frames_list[frame_no]
            filename = f"frame_{order:03d}.jpg"
            filepath = os.path.join(output_folder, filename)
            cv2.imwrite(filepath, frame)
            saved_filenames.append(filename)

        return saved_filenames

    # Fast path when header total_frames is available
    effective_num_frames = min(num_frames, total_frames)

    frame_indices = [
        int(round(i * total_frames / effective_num_frames))
        for i in range(effective_num_frames)
    ]
    frame_indices = [min(idx, total_frames - 1) for idx in frame_indices]

    saved_filenames = []
    for order, frame_no in enumerate(frame_indices, start=1):
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_no)
        success, frame = cap.read()
        if not success:
            continue

        filename = f"frame_{order:03d}.jpg"
        filepath = os.path.join(output_folder, filename)
        cv2.imwrite(filepath, frame)
        saved_filenames.append(filename)

    cap.release()

    if not saved_filenames:
        raise VideoProcessingError("No frames could be extracted from this video.")

    return saved_filenames
