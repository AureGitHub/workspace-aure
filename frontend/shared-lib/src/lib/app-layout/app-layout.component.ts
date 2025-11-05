import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBack, personCircle, menu } from 'ionicons/icons';

export interface AppLayoutConfig {
  showHeader?: boolean;
  showFooter?: boolean;
  headerTitle?: string;
  headerSubtitle?: string;
  footerText?: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  showUserProfile?: boolean;
  color?: string;
}

@Component({
  selector: 'lib-app-layout',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ],
  template: `
    <!-- Header -->
    <ion-header *ngIf="config.showHeader" [translucent]="false">
      <ion-toolbar [color]="config.color || 'primary'">
        <ion-buttons slot="start">
          <ion-menu-button 
            *ngIf="config.showMenuButton"
            (click)="onMenuClick()">
          </ion-menu-button>
          <ion-button 
            *ngIf="config.showBackButton"
            fill="clear"
            (click)="onBackClick()">
            <ion-icon name="arrow-back" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
        
        <ion-title>
          {{ config.headerTitle || 'Workspace Aure' }}
          <p *ngIf="config.headerSubtitle" class="header-subtitle">
            {{ config.headerSubtitle }}
          </p>
        </ion-title>
        
        <ion-buttons slot="end">
          <ion-button 
            *ngIf="config.showUserProfile"
            fill="clear"
            (click)="onUserProfileClick()">
            <ion-icon name="person-circle" slot="icon-only"></ion-icon>
          </ion-button>
          <ng-content select="[slot=header-actions]"></ng-content>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <!-- Main Content -->
    <ion-content [fullscreen]="false" [class.has-footer]="config.showFooter">
      <ion-header collapse="condense" *ngIf="config.showHeader">
        <ion-toolbar [color]="config.color || 'primary'">
          <ion-title size="large">{{ config.headerTitle }}</ion-title>
        </ion-toolbar>
      </ion-header>
      
      <div class="main-content">
        <ng-content></ng-content>
      </div>
    </ion-content>

    <!-- Footer fijo en la parte inferior -->
    <div class="custom-footer" *ngIf="config.showFooter">
      <div class="footer-content">
        <div class="footer-left">
          <span class="footer-text">
            {{ config.footerText || 'Workspace Aure © 2025' }}
          </span>
        </div>
        <div class="footer-center">
          <ng-content select="[slot=footer-center]"></ng-content>
        </div>
        <div class="footer-right">
          <ng-content select="[slot=footer-actions]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      position: relative;
    }

    .header-subtitle {
      margin: 0.25rem 0 0 0;
      font-size: 0.875rem;
      opacity: 0.9;
      font-weight: 300;
    }

    ion-content {
      --padding-start: 0;
      --padding-end: 0;
      --padding-top: 20px;
      --padding-bottom: 0;
    }

    ion-content.has-footer {
      --padding-bottom: 70px;
    }

    .main-content {
      padding: 1rem;
      padding-top: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      min-height: calc(100vh - 200px);
    }

    .custom-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: var(--ion-color-dark, #222428);
      color: var(--ion-color-dark-contrast, #ffffff);
      border-top: 1px solid var(--ion-color-medium-shade, #92949c);
      min-height: 56px;
      display: flex;
      align-items: center;
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    }



    .footer-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 1rem;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
    }

    .footer-left {
      display: flex;
      align-items: center;
    }

    .footer-text {
      font-size: 0.875rem;
      color: var(--ion-color-light, #f4f5f8);
    }

    .footer-center {
      flex: 1;
      display: flex;
      justify-content: center;
    }

    .footer-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .main-content {
        padding: 0.75rem;
      }

      .footer-content {
        flex-direction: column;
        gap: 0.5rem;
        text-align: center;
        padding: 0.75rem;
      }

      .footer-center,
      .footer-right {
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .header-subtitle {
        font-size: 0.75rem;
      }

      .main-content {
        padding: 0.5rem;
      }
    }
  `]
})
export class AppLayoutComponent {
  @Input() config: AppLayoutConfig = {
    showHeader: true,
    showFooter: true,
    headerTitle: 'Workspace Aure',
    headerSubtitle: '',
    footerText: 'Workspace Aure © 2025',
    showBackButton: false,
    showMenuButton: true,
    showUserProfile: true
  };

  @Output() menuClick = new EventEmitter<void>();
  @Output() backClick = new EventEmitter<void>();
  @Output() userProfileClick = new EventEmitter<void>();

  constructor() {
    // Registrar los iconos que vamos a usar
    addIcons({ arrowBack, personCircle, menu });
  }

  onMenuClick() {
    this.menuClick.emit();
  }

  onBackClick() {
    this.backClick.emit();
  }

  onUserProfileClick() {
    this.userProfileClick.emit();
  }
}