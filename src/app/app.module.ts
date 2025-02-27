import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './intercepters/auth/auth.interceptor';

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, HttpClientModule], // ✅ Import HttpClientModule
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // ✅ Register AuthInterceptor
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
