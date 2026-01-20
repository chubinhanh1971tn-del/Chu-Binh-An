import { ChangeDetectionStrategy, Component, computed, input, output, signal, ElementRef, viewChild } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-image-carousel-modal',
  standalone: true,
  templateUrl: './image-carousel-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
  host: {
    '(document:keydown.escape)': 'closeModal()',
  },
})
export class ImageCarouselModalComponent {
  images = input.required<string[]>();
  initialIndex = input<number>(0);
  close = output<void>();

  currentIndex = signal(this.initialIndex());

  // Zoom and Pan state
  scale = signal(1);
  translateX = signal(0);
  translateY = signal(0);
  isPanning = signal(false);
  panStartX = signal(0);
  panStartY = signal(0);

  imageContainer = viewChild<ElementRef<HTMLDivElement>>('imageContainer');
  zoomableImage = viewChild<ElementRef<HTMLImageElement>>('zoomableImage');

  readonly MIN_SCALE = 1;
  readonly MAX_SCALE = 3;

  transformStyle = computed(() => `scale(${this.scale()}) translate(${this.translateX()}px, ${this.translateY()}px)`);

  closeModal() {
    this.close.emit();
  }

  private resetZoomAndPan() {
    this.scale.set(this.MIN_SCALE);
    this.translateX.set(0);
    this.translateY.set(0);
  }

  nextImage() {
    this.resetZoomAndPan();
    this.currentIndex.update(i => (i + 1) % this.images().length);
  }

  prevImage() {
    this.resetZoomAndPan();
    this.currentIndex.update(i => (i - 1 + this.images().length) % this.images().length);
  }

  toggleZoom(event: MouseEvent) {
    event.stopPropagation();
    this.scale.update(s => s > this.MIN_SCALE ? this.MIN_SCALE : this.MAX_SCALE);
    // Reset pan when zooming out
    if (this.scale() === this.MIN_SCALE) {
        this.resetZoomAndPan();
    } else {
      this.clampTranslation();
    }
  }

  onMouseDown(event: MouseEvent) {
    if (this.scale() <= this.MIN_SCALE) return;
    event.preventDefault();
    event.stopPropagation();
    this.isPanning.set(true);
    this.panStartX.set(event.clientX - this.translateX());
    this.panStartY.set(event.clientY - this.translateY());
  }
  
  onMouseUp(event: MouseEvent) {
    event.stopPropagation();
    this.isPanning.set(false);
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isPanning()) return;
    event.preventDefault();
    event.stopPropagation();
    this.translateX.set(event.clientX - this.panStartX());
    this.translateY.set(event.clientY - this.panStartY());
    this.clampTranslation();
  }

  onWheel(event: WheelEvent) {
    if (this.scale() <= this.MIN_SCALE && event.deltaY > 0) return;
    event.preventDefault();
    event.stopPropagation();
    const scaleAmount = -event.deltaY > 0 ? 0.2 : -0.2;
    this.scale.update(s => Math.min(Math.max(s + scaleAmount, this.MIN_SCALE), this.MAX_SCALE));
    if (this.scale() === this.MIN_SCALE) {
      this.resetZoomAndPan();
    } else {
      this.clampTranslation();
    }
  }

  private clampTranslation() {
    const imageEl = this.zoomableImage()?.nativeElement;
    const containerEl = this.imageContainer()?.nativeElement;
    if (!imageEl || !containerEl) return;

    const scale = this.scale();
    // Use clientWidth/Height as it represents the rendered size of the element before transforms.
    const scaledWidth = imageEl.clientWidth * scale;
    const scaledHeight = imageEl.clientHeight * scale;

    const maxX = Math.max(0, (scaledWidth - containerEl.clientWidth) / 2);
    const maxY = Math.max(0, (scaledHeight - containerEl.clientHeight) / 2);

    this.translateX.update(x => Math.max(-maxX, Math.min(maxX, x)));
    this.translateY.update(y => Math.max(-maxY, Math.min(maxY, y)));
  }
}