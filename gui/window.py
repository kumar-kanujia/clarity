import os

from PyQt6.QtCore import Qt
from PyQt6.QtWidgets import (
    QFileDialog,
    QHBoxLayout,
    QLabel,
    QMainWindow,
    QMessageBox,
    QProgressBar,
    QPushButton,
    QScrollArea,
    QSlider,
    QVBoxLayout,
    QWidget,
)

from gui.grid import GroupWidget
from gui.workers import ScanWorker
from modules import processor, scanner


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("✨ Clarity")
        self.resize(1100, 800)

        # Main Container
        central = QWidget()
        self.setCentralWidget(central)
        main_layout = QVBoxLayout(central)

        # --- Toolbar ---
        toolbar = QHBoxLayout()

        self.btn_folder = QPushButton("📂 Select Folder")
        self.btn_folder.clicked.connect(self.select_folder)

        self.lbl_status = QLabel("Ready")
        self.lbl_status.setStyleSheet("color: #666; margin-right: 10px;")

        # Threshold Slider
        lbl_thresh = QLabel("Sensitivity:")
        self.slider = QSlider(Qt.Orientation.Horizontal)
        self.slider.setMinimum(0)
        self.slider.setMaximum(20)
        self.slider.setValue(5)
        self.slider.setFixedWidth(150)
        self.slider.setToolTip("Lower = Stricter, Higher = Looser")

        # Slider Value Label
        self.lbl_slider_val = QLabel("5")
        self.slider.valueChanged.connect(lambda v: self.lbl_slider_val.setText(str(v)))

        self.btn_scan = QPushButton("Start Scan")
        self.btn_scan.clicked.connect(self.start_scan)
        self.btn_scan.setEnabled(False)

        toolbar.addWidget(self.btn_folder)
        toolbar.addWidget(self.lbl_status)
        toolbar.addSpacing(20)
        toolbar.addWidget(lbl_thresh)
        toolbar.addWidget(self.slider)
        toolbar.addWidget(self.lbl_slider_val)
        toolbar.addWidget(self.btn_scan)
        toolbar.addStretch()

        main_layout.addLayout(toolbar)

        # --- Progress Bar ---
        self.progress = QProgressBar()
        self.progress.hide()
        main_layout.addWidget(self.progress)

        # --- Scroll Area (The Grid) ---
        # Ensure QScrollArea is instantiated correctly
        self.scroll_area = QScrollArea()  # Renamed variable to avoid conflicts
        self.scroll_area.setWidgetResizable(True)

        self.grid_container = QWidget()
        self.grid_layout = QVBoxLayout(self.grid_container)
        self.grid_layout.addStretch()  # Pushes content up

        self.scroll_area.setWidget(self.grid_container)
        main_layout.addWidget(self.scroll_area)

        # --- Footer Action Bar ---
        self.btn_delete = QPushButton("🗑️ Trash Selected Images")
        self.btn_delete.setStyleSheet(
            "background-color: #ff4b4b; color: white; font-weight: bold; padding: 10px;"
        )
        self.btn_delete.clicked.connect(self.delete_selected)
        self.btn_delete.hide()
        main_layout.addWidget(self.btn_delete)

        # State
        self.folder_path = None
        self.all_group_widgets = []

    def select_folder(self):
        path = QFileDialog.getExistingDirectory(self, "Select Images")
        if path:
            self.folder_path = path
            self.lbl_status.setText(f"📂 {os.path.basename(path)}")
            self.btn_scan.setEnabled(True)

    def start_scan(self):
        # Reset UI
        self.clear_grid()
        self.progress.setValue(0)
        self.progress.show()
        self.btn_scan.setEnabled(False)
        self.btn_delete.hide()

        # Get Threshold from Slider
        threshold_value = self.slider.value()

        # Start Thread
        self.worker = ScanWorker(self.folder_path, threshold=threshold_value)
        self.worker.progress.connect(
            lambda c, t: self.progress.setValue(int((c / t) * 100))
        )
        self.worker.finished.connect(self.on_scan_complete)
        self.worker.start()

    def on_scan_complete(self, groups):
        self.progress.hide()
        self.btn_scan.setEnabled(True)
        self.lbl_status.setText(f"Found {len(groups)} groups")

        if not groups:
            QMessageBox.information(self, "Done", "No similar images found.")
            return

        # Render Groups
        for i, group in enumerate(groups):
            best = processor.identify_best_image(group)

            # Create the widget and add it to layout
            group_widget = GroupWidget(i + 1, group, best)
            # Insert at the top (before the spacer)
            self.grid_layout.insertWidget(self.grid_layout.count() - 1, group_widget)

            self.all_group_widgets.append(group_widget)

        self.btn_delete.show()

    def clear_grid(self):
        """Removes all widgets from the layout."""
        for widget in self.all_group_widgets:
            widget.setParent(None)
            widget.deleteLater()
        self.all_group_widgets = []

    def delete_selected(self):
        files_to_delete = []

        for group_widget in self.all_group_widgets:
            for card in group_widget.cards:
                if card.checkbox.isChecked():
                    files_to_delete.append(card.file_path)

        if not files_to_delete:
            QMessageBox.warning(self, "Wait", "No images selected.")
            return

        confirm = QMessageBox.question(
            self,
            "Confirm",
            f"Move {len(files_to_delete)} images to Trash?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
        )

        if confirm == QMessageBox.StandardButton.Yes:
            count, errors = scanner.safe_delete(files_to_delete)
            QMessageBox.information(self, "Success", f"Moved {count} files to Trash.")
            self.clear_grid()
            self.btn_delete.hide()
            self.lbl_status.setText("Cleanup complete. Rescan to verify.")
