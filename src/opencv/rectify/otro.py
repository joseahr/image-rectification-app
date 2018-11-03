
# Probando con puntos para obtener la transformación proyectiva no funciona

# if __name__ == '__main__':
#     try:
#         print 'hjjhj'
#         args = sys.argv[1:]

#         #Input Image
#         src = args[0]
#         dest = args[1]


#         points = eval(args[2])
#         imagePoints = np.array([[point[0] for point in points]], np.float32)
#         objectPoints = np.array([[point[1] for point in points]], np.float32)
#         objectPointsTransform = np.array([[point[1][:2] for point in points]], np.float32)

#         print objectPoints

#         R = cv2.getPerspectiveTransform(objectPointsTransform, imagePoints)
#         rms, camMatrix, distCoefs, _, _ = cv2.calibrateCamera(objectPoints, imagePoints, (480, 320), None, None)
        
#         ncm = cv2.getOptimalNewCameraMatrix(camMatrix, distCoefs, (480, 320), 1)

#         map1, map2 = cv2.initUndistortRectifyMap(camMatrix, distCoefs, R, None, (480, 320), cv2.CV_32FC1)

#         imginput = cv2.imread(src)

#         img = cv2.remap(imginput, map1, map2, interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT_101)

#         cv2.imwrite(dest, img)
#         # cv2.imshow(img)
#         print 'fgfgfg'
        
#     except Exception as e: