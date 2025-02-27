import { Component, OnInit, inject, Signal, signal, PLATFORM_ID } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { ApiService } from '../../services/api/api.service';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';

// ? Expose method for browser

declare global {
    interface Window {
        getSelectedImageUrl: () => any;
    }
}

interface Camera {
    id: number;
    name: string;
    primaryStream: { href: string };
}

@Component({
    selector: 'app-camera-viewer',
    standalone: true,
    imports: [NgFor, NgIf, AsyncPipe],
    templateUrl: './camera-viewer.component.html',
    styleUrls: ['./camera-viewer.component.scss']
})
export class CameraViewerComponent implements OnInit {
    private apiService = inject(ApiService);
    private platformId = inject(PLATFORM_ID);
    cameras: Signal<Camera[]> = signal([]); // ? Camera list
    cameraImages: Map<number, string> = new Map(); // ? Store all camera images
    selectedCamera = signal<Camera | null>(null); // ? Selected camera
    selectedCameraImage = signal<string>(''); // ? Store only the selected camera's image

    ngOnInit() {
        this.fetchCameras();

        if (isPlatformBrowser(this.platformId)) {
            // ? Expose `getSelectedImageUrl()` globally for JavaScript
            window.getSelectedImageUrl = async () => {
                const selected = this.selectedCamera();
                console.log('Fetching image for selected camera:', selected);

                if (!selected) return 'assets/placeholder.jpg'; // ? Return placeholder if no camera selected

                try {
                    return await firstValueFrom(
                        this.apiService.getCameraImage(selected.primaryStream.href + '/frame/?width=864&height=484')
                    );
                } catch (error) {
                    console.error('Error fetching image:', error);
                    return 'assets/placeholder.jpg'; // ? Return placeholder on error
                }
            };
        }
    }

    private fetchCameras() {
        this.apiService.getCameras().subscribe(cameras => {
            this.cameras = signal(cameras); // ? Correctly update the camera list

            if (cameras.length > 0 && !this.selectedCamera()) {
                this.selectedCamera.set(cameras[0]); // ? Default to first camera
                this.refreshSelectedCameraImage(); // ? Load first camera image immediately
            }

            this.loadAllCameraImages(); // ? Fetch images for all cameras initially
        });
    }

    private loadAllCameraImages() {
        this.cameras().forEach(camera => {
            this.apiService.getCameraImage(camera.primaryStream.href + '/frame/?width=200&height=200').subscribe(blobUrl => {
                this.cameraImages.set(camera.id, blobUrl); // ? Store all camera images
            });
        });
    }

    /** ? Fetch selected camera image synchronously */
    public refreshSelectedCameraImage() {
        const selected = this.selectedCamera();
        if (!selected) return; // ? Prevent unnecessary API calls

        this.apiService.getCameraImage(selected.primaryStream.href + '/frame/?width=864&height=484').subscribe(blobUrl => {
            this.selectedCameraImage.set(blobUrl); // ? Update the selected camera's image immediately
        });
    }

    /** Get stored image URL for a camera */
    getImageUrl(cameraId: number | undefined): string {
        if (!cameraId) return ''; // ? Return empty string if no camera
        return this.cameraImages.get(cameraId) || ''; // ? Return empty string if no image
    }

    /** Get image URL for the selected camera */
    getSelectedImageUrl(): string {
        return this.selectedCameraImage(); // ? Return the separate selected camera image
    }

    selectCamera(camera: Camera) {
        this.selectedCamera.set(camera); // ? Update selected camera
        this.refreshSelectedCameraImage(); // ? Fetch new image immediately
    }
}
