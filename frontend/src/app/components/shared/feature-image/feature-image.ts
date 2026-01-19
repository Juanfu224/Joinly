import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

type ImageType = 'hero' | 'feature' | 'thumbnail';
type ArtDirectionMode = 'same' | 'different';

interface ImageSource {
  src: string;
  alt: string;
  sizes?: string;
  aspectRatio?: string;
}

@Component({
  selector: 'app-feature-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feature-image.html',
  styleUrl: './feature-image.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'c-feature-image-host' },
})
export class FeatureImageComponent {
  readonly imageSource = input.required<ImageSource>();
  readonly mobileSource = input<ImageSource | null>(null);
  readonly type = input<ImageType>('hero');
  readonly artDirection = input<ArtDirectionMode>('same');
  readonly lazy = input<boolean>(true);
  readonly cssClass = input<string>('');

  readonly sizesAttribute = computed(() => {
    const customSizes = this.imageSource().sizes;
    if (customSizes) return customSizes;

    switch (this.type()) {
      case 'hero':
        return '(max-width: 480px) 400px, (max-width: 1024px) 800px, 1200px';
      case 'feature':
        return '(max-width: 768px) 400px, 800px';
      case 'thumbnail':
        return '(max-width: 480px) 200px, 400px';
      default:
        return '100vw';
    }
  });

  readonly aspectRatioStyle = computed(() => {
    const ratio = this.imageSource().aspectRatio;
    return ratio ? { 'aspect-ratio': ratio } : {};
  });

  readonly usePicture = computed(() => {
    return this.artDirection() === 'different' && this.mobileSource() !== null;
  });

  readonly imageClasses = computed(() => {
    return [
      'c-feature-image__img',
      `c-feature-image__img--${this.type()}`,
      this.cssClass(),
    ].join(' ');
  });

  generateSrcset(basePath: string, format: 'avif' | 'webp' | 'jpg'): string {
    const sizes = this.getSizesForType();
    return sizes.map((size) => `${basePath}-${size}.${format} ${size}w`).join(', ');
  }

  private getSizesForType(): number[] {
    switch (this.type()) {
      case 'hero':
        return [400, 800, 1200];
      case 'feature':
        return [400, 800];
      case 'thumbnail':
        return [200, 400];
      default:
        return [400, 800];
    }
  }
}
