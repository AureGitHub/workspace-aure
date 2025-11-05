import { Component } from '@angular/core';
import { IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { AppLayoutComponent, AppLayoutConfig } from 'shared-lib';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    CommonModule,
    AppLayoutComponent
  ],
})
export class HomePage {
  // Layout Configuration
  layoutConfig: AppLayoutConfig = {
    showHeader: true,
    showFooter: true,
    headerTitle: 'App2 - Segunda Aplicación',
    headerSubtitle: 'Demostrando el layout compartido',
    footerText: 'Workspace Aure © 2025 - App2',
    showBackButton: false,
    showMenuButton: true,
    showUserProfile: true
  };

  constructor() {}

  // Layout Event Handlers
  onMenuClick() {
    console.log('App2: Menú clickeado');
  }

  onBackClick() {
    console.log('App2: Botón atrás clickeado');
  }

  onUserProfileClick() {
    console.log('App2: Perfil de usuario clickeado');
  }
}
