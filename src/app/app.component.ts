import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@core/layout/header/header.component';
import { GenerateCertificateComponent } from '@features/certificate/components/generate/generate-certificate.component';
import { provideIcons } from '@ng-icons/core';
import { featherAirplay } from '@ng-icons/feather-icons';
import { heroEye, heroUsers } from '@ng-icons/heroicons/outline';
import { heroUserCircleSolid } from '@ng-icons/heroicons/solid';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, GenerateCertificateComponent],
  templateUrl: './app.component.html',
  viewProviders: [
    provideIcons({
      featherAirplay,
      heroUsers,
      heroEye,
      heroUserCircleSolid,
    }),
  ],
})
export class AppComponent {}
