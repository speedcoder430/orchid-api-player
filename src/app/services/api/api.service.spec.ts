import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { AuthService } from '../auth/auth.service';

describe('ApiService', () => {
    let service: ApiService;
    let httpMock: HttpTestingController;
    let authServiceSpy: jasmine.SpyObj<AuthService>;

    beforeEach(() => {
        // ? Create a mock AuthService
        const authSpy = jasmine.createSpyObj('AuthService', ['getAuthToken']);
        authSpy.getAuthToken.and.returnValue('Basic bGl2ZXZpZXdlcjp0cGFpbg=='); // ? Mock Auth Token

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                ApiService,
                { provide: AuthService, useValue: authSpy } // ? Inject Mock AuthService
            ]
        });

        service = TestBed.inject(ApiService);
        httpMock = TestBed.inject(HttpTestingController);
        authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    });

    afterEach(() => {
        httpMock.verify(); // ? Ensure no unexpected requests
    });

    it('should fetch cameras successfully', () => {
        const mockResponse = { cameras: [{ id: 1, name: 'Camera 1', primaryStream: { href: 'stream/1' } }] };

        service.getCameras().subscribe(cameras => {
            expect(cameras.length).toBe(1);
            expect(cameras[0].name).toBe('Camera 1'); // ? Ensure correct data
        });

        const req = httpMock.expectOne(`${service['apiUrl']}/service/cameras`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse); // ? Ensure correct mock response format
    });

    it('should return an empty array when fetching cameras fails', () => {
        service.getCameras().subscribe(cameras => {
            expect(cameras).toEqual([]); // ? Should return an empty array on failure
        });

        const req = httpMock.expectOne(`${service['apiUrl']}/service/cameras`);
        req.flush(null, { status: 500, statusText: 'Server Error' }); // ? Simulate API failure
    });

    it('should fetch a camera image and return a blob URL', () => {
        // ? Create a mock ArrayBuffer for image data
        const mockImageArray = new Uint8Array([137, 80, 78, 71]); // Simulated PNG header
        const mockImageBuffer = mockImageArray.buffer;

        service.getCameraImage('test-stream-url').subscribe(url => {
            expect(url.startsWith('blob:')).toBeTrue(); // ? Ensure it's a valid Blob URL
        });

        const req = httpMock.expectOne('test-stream-url');
        expect(req.request.method).toBe('GET');
        expect(req.request.responseType).toBe('arraybuffer');
        req.flush(mockImageBuffer); // ? Correctly flush an ArrayBuffer
    });

    it('should return placeholder image on API error', () => {
        service.getCameraImage('invalid-url').subscribe(url => {
            expect(url).toBe('assets/placeholder.jpg'); // ? Ensure fallback image is returned
        });

        const req = httpMock.expectOne('invalid-url');
        req.flush(null, { status: 404, statusText: 'Not Found' }); // ? Simulate API failure
    });
});
