import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, openOutline } from 'ionicons/icons';

@Component({
  selector: 'app-app1',
  templateUrl: 'app1.page.html',
  styleUrls: ['app1.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonIcon, IonButton],
})
export class App1Page {

  constructor() {
    addIcons({ checkmarkCircle, openOutline });
  }

  openExternalApp() {
    // En un entorno real, esto podría abrir la aplicación externa app1
    // Por ejemplo: window.open('http://localhost:8101', '_blank');
    console.log('Abrir aplicación externa App1');
    // Simulación de apertura externa
    window.open('http://localhost:8101', '_blank');
  }
}