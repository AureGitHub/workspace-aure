import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout, map } from 'rxjs/operators';

export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  retryAttempts?: number;
  defaultHeaders?: { [key: string]: string };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  statusCode?: number;
  timestamp?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error: string;
  timestamp: string;
  path?: string;
  details?: any;
}

export interface RequestOptions {
  headers?: { [header: string]: string };
  params?: { [param: string]: string | number | boolean };
  withCredentials?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private config: ApiConfig = {
    baseUrl: '',
    timeout: 30000, // 30 segundos
    retryAttempts: 2,
    defaultHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  constructor(private http: HttpClient) {}

  /**
   * Configura el servicio API
   */
  configure(config: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Obtiene la configuración actual
   */
  getConfig(): ApiConfig {
    return { ...this.config };
  }

  /**
   * Realiza una petición GET
   */
  get<T = any>(endpoint: string, options?: RequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpOptions = this.buildHttpOptions(options);

    return (this.http.get<T>(url, httpOptions) as Observable<T>).pipe(
      timeout(this.config.timeout!),
      retry(this.config.retryAttempts!),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Realiza una petición POST
   */
  post<T = any>(endpoint: string, body: any, options?: RequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpOptions = this.buildHttpOptions(options);

    return (this.http.post<T>(url, body, httpOptions) as Observable<T>).pipe(
      timeout(this.config.timeout!),
      retry(this.config.retryAttempts!),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Realiza una petición PUT
   */
  put<T = any>(endpoint: string, body: any, options?: RequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpOptions = this.buildHttpOptions(options);

    return (this.http.put<T>(url, body, httpOptions) as Observable<T>).pipe(
      timeout(this.config.timeout!),
      retry(this.config.retryAttempts!),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Realiza una petición PATCH
   */
  patch<T = any>(endpoint: string, body: any, options?: RequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpOptions = this.buildHttpOptions(options);

    return (this.http.patch<T>(url, body, httpOptions) as Observable<T>).pipe(
      timeout(this.config.timeout!),
      retry(this.config.retryAttempts!),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Realiza una petición DELETE
   */
  delete<T = any>(endpoint: string, options?: RequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpOptions = this.buildHttpOptions(options);

    return (this.http.delete<T>(url, httpOptions) as Observable<T>).pipe(
      timeout(this.config.timeout!),
      retry(this.config.retryAttempts!),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Realiza una petición HEAD
   */
  head<T = any>(endpoint: string, options?: RequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpOptions = this.buildHttpOptions(options);

    return (this.http.head<T>(url, httpOptions) as Observable<T>).pipe(
      timeout(this.config.timeout!),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Sube un archivo mediante POST
   */
  uploadFile<T = any>(endpoint: string, file: File, additionalData?: any): Observable<T> {
    const url = this.buildUrl(endpoint);
    const formData = new FormData();
    
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    // Para uploads, no incluimos Content-Type para que el browser lo establezca automáticamente
    const headers = new HttpHeaders();
    const httpOptions = {
      headers,
      reportProgress: true
    };

    return this.http.post<T>(url, formData, httpOptions).pipe(
      timeout(60000), // Timeout más largo para uploads
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Descarga un archivo
   */
  downloadFile(endpoint: string, filename?: string): Observable<Blob> {
    const url = this.buildUrl(endpoint);
    
    return this.http.get(url, {
      responseType: 'blob',
      headers: this.getDefaultHeaders()
    }).pipe(
      timeout(60000), // Timeout más largo para downloads
      catchError(this.handleError.bind(this)),
      map((blob: Blob) => {
        // Si se proporciona un nombre de archivo, iniciamos la descarga
        if (filename) {
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = filename;
          link.click();
          window.URL.revokeObjectURL(downloadUrl);
        }
        return blob;
      })
    );
  }

  /**
   * Construye la URL completa
   */
  private buildUrl(endpoint: string): string {
    // Asegurar que el endpoint comience con /
    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }
    
    // Remover / al final de baseUrl si existe
    const baseUrl = this.config.baseUrl.replace(/\/$/, '');
    
    return `${baseUrl}${endpoint}`;
  }

  /**
   * Construye las opciones HTTP
   */
  private buildHttpOptions(options?: RequestOptions): any {
    // Combinar headers por defecto con los opcionales
    const headersObj: { [key: string]: string } = {
      ...this.config.defaultHeaders,
      ...options?.headers
    };
    
    const headers = new HttpHeaders(headersObj);

    const httpOptions: any = {
      headers,
      observe: 'body',
      withCredentials: options?.withCredentials || false
    };

    // Solo agregar params si existen
    if (options?.params) {
      httpOptions.params = this.buildParams(options.params);
    }



    return httpOptions;
  }

  /**
   * Obtiene los headers por defecto
   */
  private getDefaultHeaders(): HttpHeaders {
    return new HttpHeaders(this.config.defaultHeaders);
  }

  /**
   * Maneja los errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let apiError: ApiError;

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de red
      apiError = {
        message: `Error de conexión: ${error.error.message}`,
        statusCode: 0,
        error: 'CLIENT_ERROR',
        timestamp: new Date().toISOString(),
        details: error.error
      };
    } else {
      // Error del lado del servidor
      const serverError = error.error;
      
      apiError = {
        message: this.getErrorMessage(error.status, serverError),
        statusCode: error.status,
        error: error.statusText || 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
        path: error.url || undefined,
        details: serverError
      };
    }

    // Log del error para debugging
    console.error('API Error:', apiError);

    return throwError(() => apiError);
  }

  /**
   * Obtiene un mensaje de error amigable basado en el código de estado
   */
  private getErrorMessage(statusCode: number, serverError?: any): string {
    // Si el servidor envía un mensaje personalizado, usarlo
    if (serverError?.message) {
      return serverError.message;
    }

    // Mensajes predeterminados basados en código de estado
    switch (statusCode) {
      case 0:
        return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      case 400:
        return 'Solicitud inválida. Verifica los datos enviados.';
      case 401:
        return 'No autorizado. Debes iniciar sesión.';
      case 403:
        return 'Acceso denegado. No tienes permisos para esta acción.';
      case 404:
        return 'Recurso no encontrado.';
      case 409:
        return 'Conflicto. El recurso ya existe o está en uso.';
      case 422:
        return 'Datos de entrada inválidos.';
      case 429:
        return 'Demasiadas solicitudes. Inténtalo más tarde.';
      case 500:
        return 'Error interno del servidor. Inténtalo más tarde.';
      case 502:
        return 'Error de puerta de enlace. El servidor está temporalmente no disponible.';
      case 503:
        return 'Servicio no disponible. Inténtalo más tarde.';
      case 504:
        return 'Tiempo de espera agotado. El servidor tardó demasiado en responder.';
      default:
        return `Error del servidor (${statusCode}). Inténtalo más tarde.`;
    }
  }

  /**
   * Métodos de utilidad para construir parámetros de consulta
   */
  buildParams(params: { [key: string]: string | number | boolean }): HttpParams {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return httpParams;
  }

  /**
   * Añade un header de autorización
   */
  setAuthorizationHeader(token: string, type: string = 'Bearer'): void {
    this.config.defaultHeaders = {
      ...this.config.defaultHeaders,
      'Authorization': `${type} ${token}`
    };
  }

  /**
   * Remueve el header de autorización
   */
  removeAuthorizationHeader(): void {
    const { Authorization, ...headers } = this.config.defaultHeaders || {};
    this.config.defaultHeaders = headers;
  }

  /**
   * Verifica si el servicio está configurado correctamente
   */
  isConfigured(): boolean {
    return !!this.config.baseUrl;
  }

  /**
   * Establece la URL base
   */
  setBaseUrl(baseUrl: string): void {
    this.config.baseUrl = baseUrl;
  }

  /**
   * Obtiene la URL base
   */
  getBaseUrl(): string {
    return this.config.baseUrl;
  }
}