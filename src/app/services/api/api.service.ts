import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private apiUrl = 'https://orchid.ipconfigure.com';

    /** Fetch camera list */
    getCameras(): Observable<any[]> {
        const headers = new HttpHeaders({
            Authorization: this.authService.getAuthToken()
        });

        return this.http.get<{ cameras: any[] }>(`${this.apiUrl}/service/cameras`, { headers }).pipe(
            map(response => response.cameras || []), // ? Always ensure `camera[]` exists
            catchError(error => {
                console.error('Failed to fetch cameras:', error);
                return of([]); // ? Return an empty array on failure
            })
        );
    }

    /** Fetch image from camera stream (Appending `/frame`) */
    getCameraImage(streamUrl: string): Observable<string> {
        const headers = new HttpHeaders({
            Authorization: this.authService.getAuthToken()
        });

        return this.http.get(streamUrl, { headers, responseType: 'arraybuffer' }).pipe(
            map(arrayBuffer => {
                const blob = new Blob([arrayBuffer], { type: 'image/jpeg' }); // Convert to JPEG
                return URL.createObjectURL(blob); // Convert Blob to object URL
            }),
            catchError((error: HttpErrorResponse) => {
                return of('assets/placeholder.jpg'); // ? Return a placeholder on error
            })
        );
    }
}


