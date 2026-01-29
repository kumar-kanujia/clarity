from PyQt6.QtCore import QThread, pyqtSignal

from modules import processor, scanner


class ScanWorker(QThread):
    progress = pyqtSignal(int, int)  # Signals: current, total
    finished = pyqtSignal(object)  # Signal: groups (list)

    def __init__(self, folder_path, threshold):
        super().__init__()
        self.folder_path = folder_path
        self.threshold = threshold

    def run(self):
        images = scanner.get_image_files(self.folder_path)

        # Pass a lambda to bridge the processor callback to the Qt signal
        hashes = processor.compute_hashes(
            images, progress_callback=lambda c, t: self.progress.emit(c, t)
        )

        groups = processor.group_images(hashes, self.threshold)
        self.finished.emit(groups)
