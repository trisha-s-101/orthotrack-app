from app import count_repetitions, calculate_angle
from types import SimpleNamespace
import numpy as np
import math

def make_landmark(x, y):
    return SimpleNamespace(x=x, y=y)

def test_calculate_angle_90_degrees():
    angle_a = make_landmark(1,0)
    vertex = make_landmark(0,0)
    angle_b = make_landmark(0,1)

    result = calculate_angle(angle_a, vertex, angle_b)
    assert(abs(result - 90.0) < 0.001)

    #Floating-point imprecision means acos rarely returns an exact integer
    #So we have a tolerance of 0.001°, that is well within reason for any measurement we'll need

def test_calculate_angle_180_degrees():
    angle_a = make_landmark(1,0)
    vertex = make_landmark(1, 1)
    angle_b = make_landmark(1, 2)

    result = calculate_angle(angle_a, vertex, angle_b)
    assert(abs(result - 180.0) < 0.01)

def test_calculate_angle_45_degrees():
    angle_a = make_landmark(1,0)
    vertex = make_landmark(0,0)
    angle_b = make_landmark(1,1)

    result = calculate_angle(angle_a, vertex, angle_b)
    assert(abs(result - 45.0) < 0.01)

def test_calculate_angle_same_degrees():
    angle_a = make_landmark(0, 0)
    vertex = make_landmark(0, 0)
    angle_b = make_landmark(1, 1)

    result = calculate_angle(angle_a, vertex, angle_b)
    assert(result is None)
    

def test_short_signals_returns_zero():
    '''
    Verifiying that if the signal array length is less than 10, it returns 0 and an empty array
    '''
    assert count_repetitions(np.array([1,2,3,4,5,6,7,8,9]),fps=50) == (0, [])

def test_count_repetitions_sine():
    num_peaks = 3
    fps = 60
    values_array = np.linspace(0, 2 * math.pi * num_peaks, num_peaks * fps)
    sine = np.sin(values_array) * fps + 90

    num_reps = count_repetitions(sine, fps)
    assert (num_reps[0] == num_peaks)
