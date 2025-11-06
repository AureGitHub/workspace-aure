import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

export interface ApiInterceptorConfig {
  showLoadingForRoutes?: string[];
  excludeLoadingForRoutes?: string[];
  tokenHeaderName?: string;
  tokenPrefix?: string;
  refreshTokenEndpoint?: string;
  loginRedirectRoute?: string;
}

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  private config: ApiInterceptorConfig = {
    showLoadingForRoutes: [],
    excludeLoadingForRoutes: [],
    tokenHeaderName: 'Authorization',
    tokenPrefix: 'Bearer',
    refreshTokenEndpoint: '/auth/refresh',
    loginRedirectRoute: '/login'
  };

  private loadingRequests: Set<string> = new Set();
  private onLoadingChange?: (loading: boolean) => void;
  private getToken?: () => string | null;
  private onUnauthorized?: () => void;

  configure(config: Partial<ApiInterceptorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  setTokenProvider(tokenProvider: () => string | null): void {
    this.getToken = tokenProvider;
  }

  setLoadingCallback(callback: (loading: boolean) => void): void {
    this.onLoadingChange = callback;
  }

  setUnauthorizedCallback(callback: () => void): void {
    this.onUnauthorized = callback;
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clonar la request para poder modificarla
    let modifiedRequest = request.clone();

    // Agregar token de autenticación si existe
    const token = this.getToken?.();
    if (token && !this.isExcludedFromAuth(request.url)) {
      modifiedRequest = modifiedRequest.clone({
        setHeaders: {
          [this.config.tokenHeaderName!]: `${this.config.tokenPrefix} ${token}`
        }
      });
    }

    // Manejar loading state
    const shouldShowLoading = this.shouldShowLoading(request.url);
    if (shouldShowLoading) {
      this.startLoading(request.url);
    }

    // Agregar headers adicionales
    modifiedRequest = this.addCommonHeaders(modifiedRequest);

    return next.handle(modifiedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleError(error);
        return throwError(() => error);
      }),
      finalize(() => {
        if (shouldShowLoading) {
          this.stopLoading(request.url);
        }
      })
    );
  }

  private addCommonHeaders(request: HttpRequest<any>): HttpRequest<any> {
    const headers: { [key: string]: string } = {
      'X-Requested-With': 'XMLHttpRequest',
      'Accept-Language': this.getBrowserLanguage()
    };

    // Solo agregar Content-Type si no es una request de FormData
    if (!(request.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    return request.clone({
      setHeaders: headers
    });
  }

  private shouldShowLoading(url: string): boolean {
    // Si hay rutas específicas configuradas para mostrar loading
    if (this.config.showLoadingForRoutes?.length) {
      return this.config.showLoadingForRoutes.some(route => url.includes(route));
    }

    // Si hay rutas excluidas del loading
    if (this.config.excludeLoadingForRoutes?.length) {
      return !this.config.excludeLoadingForRoutes.some(route => url.includes(route));
    }

    // Por defecto mostrar loading para todas las requests
    return true;
  }

  private isExcludedFromAuth(url: string): boolean {
    const excludedEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/public'
    ];

    return excludedEndpoints.some(endpoint => url.includes(endpoint));
  }

  private startLoading(url: string): void {
    this.loadingRequests.add(url);
    this.updateLoadingState();
  }

  private stopLoading(url: string): void {
    this.loadingRequests.delete(url);
    this.updateLoadingState();
  }

  private updateLoadingState(): void {
    const isLoading = this.loadingRequests.size > 0;
    this.onLoadingChange?.(isLoading);
  }

  private handleError(error: HttpErrorResponse): void {
    console.error('HTTP Error:', error);

    switch (error.status) {
      case 401:
        this.handleUnauthorized();
        break;
      case 403:
        this.handleForbidden();
        break;
      case 404:
        this.handleNotFound();
        break;
      case 422:
        this.handleValidationError(error);
        break;
      case 500:
        this.handleServerError();
        break;
      default:
        this.handleGenericError(error);
    }
  }

  private handleUnauthorized(): void {
    console.warn('Unauthorized access - redirecting to login');
    this.onUnauthorized?.();
  }

  private handleForbidden(): void {
    console.warn('Forbidden access');
    // Aquí podrías mostrar un mensaje de error específico
  }

  private handleNotFound(): void {
    console.warn('Resource not found');
    // Aquí podrías redirigir a una página 404
  }

  private handleValidationError(error: HttpErrorResponse): void {
    console.warn('Validation error:', error.error);
    // Los errores de validación generalmente se manejan en el componente
  }

  private handleServerError(): void {
    console.error('Server error');
    // Aquí podrías mostrar un mensaje de error genérico
  }

  private handleGenericError(error: HttpErrorResponse): void {
    console.error('Generic HTTP error:', error);
  }

  private getBrowserLanguage(): string {
    return navigator.language || 'en';
  }

  // Métodos públicos para controlar el interceptor
  getLoadingState(): boolean {
    return this.loadingRequests.size > 0;
  }

  clearLoadingState(): void {
    this.loadingRequests.clear();
    this.updateLoadingState();
  }
}