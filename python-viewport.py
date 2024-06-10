import sys
import RPi.GPIO as GPIO
import cv2
import numpy as np
from PyQt5.QtCore import QTimer, Qt, pyqtSignal
from PyQt5.QtGui import QImage, QPixmap, QFont, QColor
from PyQt5.QtWidgets import QApplication, QWidget, QVBoxLayout, QLabel, QSlider, QPushButton, QSizePolicy, QMessageBox
from picamera.array import PiRGBArray
from picamera import PiCamera


class LidarReader:
    def __init__(self, pin):
        self.pin = pin
        GPIO.setmode(GPIO.BOARD)
        GPIO.setup(self.pin, GPIO.IN)
        self.distance = 0

    def read_distance(self):
        # pulse_start = GPIO.time()
        # GPIO.output(self.pin, GPIO.HIGH)
        # GPIO.wait_for_edge(self.pin, GPIO.FALLING)
        # pulse_end = GPIO.time()
  
        pulse_start = 0
        pulse_end = 0
        while GPIO.input(self.pin) == 0:
            pulse_start = GPIO.time()
        while GPIO.input(self.pin) == 1:
            pulse_end = GPIO.time()
        
        pulse_duration = pulse_end - pulse_start

        distance = round(pulse_duration * 17150, 2)
        self.distance = distance
        return distance

class LidarVideoStreamApp(QWidget):
    display_signal = pyqtSignal(np.ndarray)
    lidar_signal = pyqtSignal(float)
 
    def __init__(self, parent=None):
        super().__init__(parent)
        # Initialize GUI components
        self.initUI()
        
         # Camera and Lidar setup
        self.camera = PiCamera()
        self.camera.resolution = (640, 480)
        self.camera.framerate = 30
        self.rawCapture = PiRGBArray(self.camera, size=(640, 480))
  
        self.lidar_reader = LidarReader(pin=15)
        self.timer = QTimer(self)
        self.timer.timeout.connect(self.process_frame)
        self.timer.start(30) # 30 ms interval

    def initUI(self):
        self.setGeometry(300, 300, 800, 480)
        vbox = QVBoxLayout()
        self.setLayout(vbox)
      
        self.label = QLabel(self)
        self.label.setAlignment(Qt.
        self.label.setStyleSheet("background-color: black; color: white;")
		font = QFont()
        font.setPointSize(24)
        self.label.setFont(font)
 
        vbox.addWidget(self.label, alignment=Qt.AlignCenter)
   
        self.showFullScreen()

    def process_frame(self):
        # Read frame from camera
        self.camera.capture(self.
        frame = self.rawCapture.array
        
        # Read lidar distance
        distance = self.lidar_reader.read_
  
      
        self.display_signal.emit(
        self.lidar_signal.emit(  
 
    def display_video(self, frame):
        # Display the video frame
        height, width, channel = frame.shape
        bytesPerLine = 3 * width
        qImg = QImage(frame, width, height, bytesPerLine, QImage.Format_BGR888)
        pixmap = QPixmap.fromImage(qImg)
        self.label.setPixmap(pixmap)
        self.label.setFixedSize(
  
    def display_lidar(self, distance):
        # Display lidar data
        lidar_text = f"Lidar Distance: {distance} cm"
        self.label.setText(lidar_text)
 
if __name__ == '__main__':
    app = QApplication(sys.argv)
    ex = LidarVideoStreamApp()
    ex.display_signal.connect(ex.  
    ex.lidar_signal.connect(ex.
    sys.exit(app.exec_())