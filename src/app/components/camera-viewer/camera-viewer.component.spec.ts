import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CameraViewerComponent } from './camera-viewer.component';
import { ApiService } from '../../services/api/api.service';
import { of } from 'rxjs';

describe('CameraViewerComponent', () => {
    let component: CameraViewerComponent;
    let fixture: ComponentFixture<CameraViewerComponent>;
    let apiServiceSpy: jasmine.SpyObj<ApiService>;

    beforeEach(async () => {
        // ? Create a mock ApiService
        const apiSpy = jasmine.createSpyObj('ApiService', ['getCameras', 'getCameraImage']);

        await TestBed.configureTestingModule({
            imports: [CameraViewerComponent], // ? Import standalone component
            providers: [{ provide: ApiService, useValue: apiSpy }] // ? Use mock API service
        }).compileComponents();

        fixture = TestBed.createComponent(CameraViewerComponent);
        component = fixture.componentInstance;
        apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;

        // ? Mock API responses
        apiServiceSpy.getCameras.and.returnValue(of([
            { id: 1, name: 'Camera 1', primaryStream: { href: 'stream/1' } },
            { id: 2, name: 'Camera 2', primaryStream: { href: 'stream/2' } }
        ]));
        apiServiceSpy.getCameraImage.and.returnValue(of('blob:test-url'));
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch and store camera list on initialization', () => {
        fixture.detectChanges(); // ? Trigger `ngOnInit()`
        expect(component.cameras().length).toBe(2);
        expect(component.selectedCamera()?.name).toBe('Camera 1'); // ? First camera should be selected
    });

    it('should update selected camera when `selectCamera()` is called', () => {
        fixture.detectChanges();
        const newCamera = { id: 2, name: 'Camera 2', primaryStream: { href: 'stream/2' } };

        component.selectCamera(newCamera);
        fixture.detectChanges();

        expect(component.selectedCamera()?.name).toBe('Camera 2');
    });

    it('should call API and update selected camera image', () => {
        fixture.detectChanges();
        component.refreshSelectedCameraImage();
        fixture.detectChanges();

        expect(apiServiceSpy.getCameraImage).toHaveBeenCalledWith('stream/1/frame/?width=864&height=484');
        expect(component.selectedCameraImage()).toBe('blob:test-url');
    });

    it('should return empty string if `getImageUrl()` is called with an unknown camera ID', () => {
        expect(component.getImageUrl(999)).toBe('');
    });

    it('should return placeholder if `getSelectedImageUrl()` is called with no image', () => {
        component.selectedCameraImage.set('');
        expect(component.getSelectedImageUrl()).toBe('');
    });
});
