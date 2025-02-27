import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule], // ? Added `HttpClientTestingModule`
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should render the CameraViewerComponent', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;

    // ? Ensure `app-camera-viewer` exists instead of searching for a div
    expect(compiled.querySelector('app-camera-viewer')).toBeTruthy();
  });
});
