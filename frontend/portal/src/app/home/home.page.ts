import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { appsOutline, gridOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon],
})
export class HomePage {

  constructor(private router: Router) {
    addIcons({ appsOutline, gridOutline });
  }

  navigateToApp1() {
    // Por ahora navegamos a una ruta local, después se podría configurar para abrir app1
    this.router.navigate(['/app1']);
  }

  navigateToApp2() {
    // Por ahora navegamos a una ruta local, después se podría configurar para abrir app2
    this.router.navigate(['/app2']);
  }
}