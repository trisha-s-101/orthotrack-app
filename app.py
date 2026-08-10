import mediapipe as mp
import math
import numpy as np
import cv2 
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import tempfile 
import base64
from supabase_config import get_supabase
import json

app = Flask(__name__)
CORS(app, resources={r"/analyze-rom": {"origins": "http://localhost:5173"}})

# --- Read the model file into RAM once when the server starts ---
MODEL_PATH = "./pose_landmarker_lite.task"
with open(MODEL_PATH, "rb") as f:
    MODEL_BYTES = f.read()

JOINT_CONFIG = {
    "left_elbow": {
        "landmarks": (11, 13, 15),   # shoulder, elbow, wrist
        "display_name": "Left Elbow"
    },
    "right_elbow": {
        "landmarks": (12, 14, 16),
        "display_name": "Right Elbow"
    },
    "left_knee": {
        "landmarks": (23, 25, 27),   # hip, knee, ankle
        "display_name": "Left Knee"
    },
    "right_knee": {
        "landmarks": (24, 26, 28),
        "display_name": "Right Knee"
    },
    "left_shoulder": {
        "landmarks": (13, 11, 23),   # elbow, shoulder, hip
        "display_name": "Left Shoulder"
    },
    "right_shoulder": {
        "landmarks": (14, 12, 24),
        "display_name": "Right Shoulder"
    },
    "left_hip": {
        "landmarks": (11, 23, 25),   # shoulder, hip, knee
        "display_name": "Left Hip"
    },
    "right_hip": {
        "landmarks": (12, 24, 26),
        "display_name": "Right Hip"
    }
}

# ---------------------------------------------------------------------

@app.route("/analyze-rom", methods=['POST'])
def analyzeVideo():

    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return jsonify({"error": "No Authorization header"}), 401

    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Invalid Authorization header"}), 401

    access_token = auth_header.split(" ", 1)[1]
    user_supabase = get_supabase(access_token)

    try:
        user_response = user_supabase.auth.get_user(access_token)
        user = user_response.user

        if user is None:
            return jsonify({"error": "Invalid authentication token"}), 401

        user_id = user.id

    except Exception as e:
        print("Authentication failed:", e)
        return jsonify({"error": "Authentication failed"}), 401

    response_data = None

    if 'video' not in request.files:
        response_data = {'error': 'No video file provided'}
    else:  # Save temporarily to disk
        file = request.files['video']  # 'video' is the field name, not the filename
        injury_id = request.form.get('injury_id')

        # Look up the injury in Supabase
        injury_response = (
            user_supabase
            .table("injuries")
            .select("joint")
            .eq("id", injury_id)
            .single()
            .execute()
        )

        joint = injury_response.data.get("joint")
        print("Joint/Injury Response: ", injury_response)
        print("Type of Injury Response: ", type(injury_response))

        suffix = os.path.splitext(file.filename)[1]  # preserves .mp4, .mov etc
        temp_fd, temp_path = tempfile.mkstemp(suffix=suffix)
        os.close(temp_fd)  # close the file descriptor, we just need the path
    
        try:
            print("GOING TO SAVE THE FILE")
            file.save(temp_path)
            # Run MediaPipe processing with the saved path
            response_data = process_video(temp_path, joint)
            # Save to Supabase
            print("PROCESSING THE VIDEO WORKED")
            session_data = {
                "user_id": user_id,
                "injury_id": injury_id,
                "joint": joint,
                "max_angle": response_data["metrics"]["max_angle"],
                "min_angle": response_data["metrics"]["min_angle"],
                "average_angle": response_data["metrics"]["average_angle"],
                "range_of_motion": response_data["metrics"]["range_of_motion"],
                "total_frames": response_data["total_frames_processed"],
                "measurements": response_data["joint_measurements"],
                "preview_image_base64": response_data["preview_image"]
            }
            
            # Insert into Supabase
            print("Session data being inserted:", session_data)

            response = (
            user_supabase
            .table("rom_sessions")
            .insert(session_data)
            .execute()
            )

            print(response)

            if response.data:
                response_data["session_id"] = response.data[0]["id"]

        except Exception as e:
            print(f"ERROR in process video: {e}") # THIS LOGS TO FLASK TERMINAL
            response_data = {'error': str(e)}

        finally: #cleaning up temp files
            if os.path.exists(temp_path):
                os.remove(temp_path)

    # Create response with explicit CORS headers
    response = jsonify(response_data)
    print("Final results being sent to React:", response)
    return response

def process_video(video_path, joint):

    print("PROCESS VIDEO FUNCTION CALLED")
    joint_measurements = []
    angle_values = []
    preview_image_b64 = None # We will store our Base64 image string here

    video = cv2.VideoCapture(video_path)

    # Create the detector
    # Use the global MODEL_BYTES from RAM instead of reading the file
    base_options = python.BaseOptions(model_asset_buffer=MODEL_BYTES)

    options = vision.PoseLandmarkerOptions(
        base_options=base_options,
        running_mode=vision.RunningMode.VIDEO
    )

    detector = vision.PoseLandmarker.create_from_options(options)

    #calculating the angle given three points

    def calculate_angle(landmark1, landmark2, landmark3):
        x1 = landmark1.x
        y1 = landmark1.y
        x2 = landmark2.x
        y2 = landmark2.y
        x3 = landmark3.x
        y3 = landmark3.y

        vector1 = [x1-x2, y1-y2]
        vector2 = [x3-x2, y3-y2]
        dot_product = (vector1[0] * vector2[0]) + (vector1[1] * vector2[1])
        magnitude1 = math.sqrt(vector1[0] ** 2 + vector1[1] ** 2)
        magnitude2 = math.sqrt(vector2[0] ** 2 + vector2[1] ** 2)

        if magnitude1 == 0 or magnitude2 == 0:
            return None

        result = dot_product / (magnitude1 * magnitude2)
        # CRITICAL FIX: Clamp the value between -1.0 and 1.0 to prevent math domain errors
        result = max(-1.0, min(1.0, result))
        result = math.acos(result)
        result_degrees = math.degrees(result)

        return result_degrees

    fps = video.get(cv2.CAP_PROP_FPS)

    if fps <= 0:
        fps = 30.0

    frame_count = 0
    config = JOINT_CONFIG.get(joint)

    if config is None:
        raise ValueError(f"Unsupported joint: {joint}")

    LANDMARK_1, LANDMARK_2, LANDMARK_3 = config["landmarks"]

    while video.isOpened():
        success, frame = video.read()
        if not success:
            break

        height, width, _ = frame.shape
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=rgb
        )

        # CRITICAL: This is guaranteed to increase sequentially every single frame
        timestamp_ms = int((frame_count * 1000) / fps)

        # Run inference
        result = detector.detect_for_video(mp_image, timestamp_ms)

        if result.pose_landmarks and len(result.pose_landmarks) > 0:
            landmarks = result.pose_landmarks[0]
            # landmark_length = len(landmarks)
            # middle = int(landmark_length / 2)
            preview_landmark = landmarks[LANDMARK_2]

            # 1. Draw tracking circles safely for the preview
            xcoordinate = int(preview_landmark.x * width)
            ycoordinate = int(preview_landmark.y * height)
            cv2.circle(frame, (xcoordinate, ycoordinate), 5, (0, 255, 0), -1)

            # 2. Capture the FIRST successfully drawn frame to send back as a preview
            if preview_image_b64 is None:
                # Encode the OpenCV frame into a JPEG image in memory
                success_encode, buffer = cv2.imencode('.jpg', frame)
                if success_encode:
                    # Convert the raw bytes to a Base64 string that JSON can transport
                    preview_image_b64 = base64.b64encode(buffer).decode('utf-8')

            # 3. Safely calculate specific target angles (e.g., Left Arm bicep curl angle)
            # This replaces the runaway loop counter completely to prevent IndexErrors
            try:
                landmark1 = landmarks[LANDMARK_1]
                landmark2 = landmarks[LANDMARK_2]
                landmark3 = landmarks[LANDMARK_3]   

                min_confidence = 0.5
                if (landmark1.visibility > min_confidence and 
                    landmark2.visibility > min_confidence and 
                    landmark3.visibility > min_confidence):

                    angle = calculate_angle(landmark1, landmark2, landmark3)
                    joint_measurements.append({
                    "frame": frame_count,
                    "timestamp": timestamp_ms,
                    "time": round(timestamp_ms / 1000, 2),
                    "angle": angle
                    })
                    angle_values = [entry["angle"] for entry in joint_measurements]

            except (IndexError, AttributeError):
                pass

        # CRITICAL FIX: Increments out here so it runs regardless of detection success
        frame_count += 1

    video.release()
    detector.close() # <-- NEW: Destroy the detector to free up server RAM!

    angles_np = np.array(angle_values)
    smoothed_angles = []
    max_angle = 0
    min_angle = 0
    average_angle = 0
    range_of_motion = 0

    if(len(angles_np) >0):
        max_angle = float(np.max(angles_np))
        min_angle = float(np.min(angles_np))
        average_angle = float(np.average(angles_np))
        range_of_motion = max_angle - min_angle 

    if(len(angles_np) > 5):
        #smoothing the angles using a rolling average for a more clear/accurate visualization
        smoothed_angles = np.convolve(angles_np, np.ones(5)/5, mode='valid')
    else:
        smoothed_angles = angles_np

    # 2. Return a dictionary that Flask will serialize into JSON
    
    return {
        "joint": joint,
        "joint_name": config["display_name"],
        "total_frames_processed": frame_count,
        "joint_measurements": joint_measurements,
        "preview_image": preview_image_b64,
        "metrics": {
            "max_angle": max_angle,
            "min_angle": min_angle,
            "average_angle": average_angle,
            "range_of_motion": range_of_motion
        },
        "smoothed_angles": smoothed_angles.tolist()  # Convert to list for JSON
    }

if __name__ == '__main__':
    app.run(debug=True, port=5001)