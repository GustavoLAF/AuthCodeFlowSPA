import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private httpClient: HttpClient, private oidcSecurityService: OidcSecurityService) { }

  get(url: string, params?: HttpParams): Observable<any> {
    return this.httpClient.get(url, { headers: this.getHeaders(), params: params });
  }

  put(url: string, data: any, params?: HttpParams): Observable<any> {
    const body = JSON.stringify(data);
    return this.httpClient.put(url, body, { headers: this.getHeaders(), params: params });
  }

  delete(url: string, params?: HttpParams): Observable<any> {
    return this.httpClient.delete(url, { headers: this.getHeaders(), params: params });
  }

  post(url: string, data: any, params?: HttpParams): Observable<any> {
    const body = JSON.stringify(data);
    return this.httpClient.post(url, body, { headers: this.getHeaders(), params: params });
  }

  private getHeaders() {
    let headers = new HttpHeaders();
    headers = this.appendAuthHeader(headers);
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Accept', 'application/json');
    return headers;
  }

  private appendAuthHeader(headers: HttpHeaders) {
    const token = this.oidcSecurityService.getToken();
    if (token === '') return headers;
    const tokenValue = 'Bearer ' + token;
    return headers.set('Authorization', tokenValue);
  }

}
