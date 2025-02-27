import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private username = 'liveviewer';
    private password = 'tpain';
    private cachedToken: string | null = null;

    /** Generate Base64-encoded token for authentication */
    getAuthToken(): string {
        if (!this.cachedToken) {
            const credentials = `${this.username}:${this.password}`;
            this.cachedToken = `Basic ${btoa(credentials)}`;
        }
        return this.cachedToken;
    }
}
