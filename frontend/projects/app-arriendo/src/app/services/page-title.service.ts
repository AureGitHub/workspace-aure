import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PageTitleService {
  private titleSubject = new BehaviorSubject<string>('');
  public title$ = this.titleSubject.asObservable();

  setTitle(title: string) {
    this.titleSubject.next(title);
  }

  clearTitle() {
    this.titleSubject.next('');
  }

  getTitle(): string {
    return this.titleSubject.value;
  }
}