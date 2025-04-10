import { animate, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroMoonSolid, heroSunSolid } from '@ng-icons/heroicons/solid';
import { ThemeService } from '@theme/theme.service';

@Component({
  selector: 'app-header',
  imports: [NgIcon],
  templateUrl: './header.component.html',
  providers: [
    provideIcons({
      heroSunSolid,
      heroMoonSolid,
    }),
  ],
  animations: [
    trigger('iconRotate', [
      transition('* <=> *', [
        style({ opacity: 0, transform: 'rotate(180deg)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'rotate(0)' }),
        ),
      ]),
    ]),
  ],
})
export class HeaderComponent {
  constructor(private _themeService: ThemeService) {}

  toggleTheme(): void {
    this._themeService.toggleTheme();
  }

  isDarkTheme(): boolean {
    return this._themeService.isDarkTheme();
  }
}
