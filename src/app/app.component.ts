import { Component } from '@angular/core';
import { CameraViewerComponent } from './components/camera-viewer/camera-viewer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CameraViewerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent { }
