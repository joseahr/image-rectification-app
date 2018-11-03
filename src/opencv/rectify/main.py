import sys
from os import path
import cv2
import numpy as np


if __name__ == '__main__':
    try:
        args = sys.argv[1:]
        src = args[0]
        dest = args[1]

        fx, fy, cx, cy, r11, r12, r13, r21, r22, r23, r31, r32, r33 = \
            map(lambda x: float(x), args[2: 15])

        distortions = np.array(map(lambda x: float(x), args[15:]))
        camArray = np.array([[fx, 0, cx], [0, fy, cy], [0, 0, 1]], np.float32)
        rotation = np.array([[r11, r12, r13], [r21, r22, r23], [r31, r32, r33]])

        m1Type = cv2. CV_16SC2

        srcArray = cv2.imread(src)
        height, width, channels = srcArray.shape

        map1, map2 = cv2.initUndistortRectifyMap(camArray, distortions, rotation, camArray, (width, height), m1Type)
        

        destArray = cv2.remap(srcArray, map1, map2, cv2.INTER_NEAREST, cv2.BORDER_TRANSPARENT)
        
        cv2.imwrite(dest, destArray)
    except Exception as e:
        print e

