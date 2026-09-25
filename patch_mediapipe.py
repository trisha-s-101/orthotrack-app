import pathlib, sys

target = pathlib.Path(sys.argv[1]) / "mediapipe/tasks/python/vision/drawing_utils.py"
if target.exists():
    src = target.read_text()
    src = src.replace("import cv2", "try:\n    import cv2\nexcept ImportError:\n    cv2 = None")
    target.write_text(src)
    print(f"Patched {target}")
else:
    print(f"Not found: {target}")
