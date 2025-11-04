import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star, rocket } from 'ionicons/icons';

@Component({
  selector: 'app-app2',
  templateUrl: 'app2.page.html',
  styleUrls: ['app2.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonIcon, IonButton],
})
export class App2Page {

  constructor() {
    addIcons({ star, rocket });
  }

  openExternalApp() {
    // En un entorno real, esto podría abrir la aplicación externa app2
    // Por ejemplo: window.open('http://localhost:8102', '_blank');
    console.log('Abrir aplicación externa App2');
    // Simulación de apertura externa
    window.open('http://localhost:8102', '_blank');
  }
}