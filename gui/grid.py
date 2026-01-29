import io

from PIL import Image, ImageOps
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QImage, QPixmap
from PyQt6.QtWidgets import QCheckBox, QFrame, QGridLayout, QLabel, QVBoxLayout, QWidget


class ImageCard(QFrame):
    """A custom widget representing a single image card."""

    def __init__(self, file_path, is_best, parent=None):
        super().__init__(parent)
        self.file_path = file_path
        self.setFrameShape(QFrame.Shape.StyledPanel)

        # Layout
        layout = QVBoxLayout(self)
        layout.setContentsMargins(5, 5, 5, 5)

        # Image Label
        self.lbl_image = QLabel()
        self.lbl_image.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.lbl_image.setStyleSheet("background-color: #eee; border-radius: 4px;")
        self.lbl_image.setFixedSize(180, 180)  # Fixed square size
        self.load_thumbnail(file_path)
        layout.addWidget(self.lbl_image)

        # Metadata / Best Badge
        if is_best:
            lbl_info = QLabel("⭐ Best Quality")
            lbl_info.setStyleSheet("color: green; font-weight: bold;")
        else:
            lbl_info = QLabel("Duplicate")
            lbl_info.setStyleSheet("color: gray;")
        layout.addWidget(lbl_info)

        # Checkbox
        self.checkbox = QCheckBox("Select to Delete")
        layout.addWidget(self.checkbox)

    def load_thumbnail(self, path):
        """Loads and crops image to square using PIL, then converts to Qt."""
        try:
            # 1. Open & Crop with PIL
            img = Image.open(path)
            img = ImageOps.fit(img, (180, 180), Image.Resampling.LANCZOS)

            # 2. Convert to QPixmap
            # Save to bytes in memory -> Load into QImage
            with io.BytesIO() as bio:
                img.save(bio, format="PNG")
                qimg = QImage.fromData(bio.getvalue())
                pixmap = QPixmap.fromImage(qimg)
                self.lbl_image.setPixmap(pixmap)
        except Exception:
            self.lbl_image.setText("Error")


class GroupWidget(QWidget):
    """Displays a header and a grid of ImageCards."""

    def __init__(self, group_index, files, best_file):
        super().__init__()
        layout = QVBoxLayout(self)

        # Header
        lbl_header = QLabel(f"Group {group_index}")
        lbl_header.setStyleSheet(
            "font-size: 14px; font-weight: bold; margin-top: 10px;"
        )
        layout.addWidget(lbl_header)

        # Grid Layout for Cards
        grid = QGridLayout()
        grid.setSpacing(10)

        self.cards = []

        # Create cards (Max 4 columns)
        row, col = 0, 0
        for f in files:
            card = ImageCard(f, is_best=(f == best_file))

            # Auto-Select Logic: Check if NOT the best image
            if f != best_file:
                card.checkbox.setChecked(True)

            grid.addWidget(card, row, col)
            self.cards.append(card)

            col += 1
            if col > 3:  # 4 columns (0,1,2,3)
                col = 0
                row += 1

        layout.addLayout(grid)
