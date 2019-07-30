import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AuthModule, ConfigResult, OidcConfigService, OidcSecurityService, OpenIdConfiguration } from 'angular-auth-oidc-client';

import { AuthGuard } from './auth.guard';
import { AppComponent } from './app.component';
import { ProtectedComponent } from './protected/protected.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { HomeComponent } from './home/home.component';
import { AuthInterceptor } from './auth-interceptor';

const oidc_configuration = 'assets/auth.clientConfiguration.json';
export function loadConfig(oidcConfigService: OidcConfigService) {
  return () => oidcConfigService.load(oidc_configuration);
}

@NgModule({
  declarations: [
    AppComponent,
    ProtectedComponent,
    UnauthorizedComponent,
    ForbiddenComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'forbidden', component: ForbiddenComponent },
      { path: 'unauthorized', component: UnauthorizedComponent },
      { path: 'protected', component: ProtectedComponent, canActivate: [AuthGuard] },
      { path: '**', redirectTo: '' }
    ]),
    AuthModule.forRoot()
  ],
  providers: [
    OidcConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: loadConfig,
      deps: [OidcConfigService],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private oidcSecurityService: OidcSecurityService, private oidcConfigService: OidcConfigService) {
    this.oidcConfigService.onConfigurationLoaded.subscribe((configResult: ConfigResult) => {
      const config: OpenIdConfiguration = {
        //URL em que o servidor do serviço de token de segurança (STS) está localizado
        stsServer: configResult.customConfig.stsServer,
        //REDIRECT_URL que foi configurado no servidor do serviço de token de segurança (STS)
        redirect_url: configResult.customConfig.redirect_url,
        //ID do cliente
        client_id: configResult.customConfig.client_id,
        //Nome do fluxo que pode ser configurado
        response_type: configResult.customConfig.response_type,
        //Escopos que são solicitados ao servidor deste cliente. Isso deve corresponder à configuração do servidor (STS)
        scope: configResult.customConfig.scope,
        //URL após um logout do servidor se estiver usando a API da sessão final
        post_logout_redirect_uri: configResult.customConfig.post_logout_redirect_uri,
        //Renova os tokens do cliente, uma vez que o token_id expira
        silent_renew: configResult.customConfig.silent_renew,
        //URL que pode ser usado para um retorno de chamada leve e renovado
        silent_renew_url: configResult.customConfig.silent_renew_url,
        //URL (rota) para a resposta HTTP 403
        forbidden_route: configResult.customConfig.forbidden_route,
        //URL (rota) para a resposta HTTP 401
        unauthorized_route: configResult.customConfig.unauthorized_route,
        //Registra todas as mensagens de depuração do módulo no console (isso pode ser visto acessando o devtools do navegador)
        log_console_debug_active: configResult.customConfig.log_console_debug_active,
        max_id_token_iat_offset_allowed_in_seconds: configResult.customConfig.max_id_token_iat_offset_allowed_in_seconds
      };
      this.oidcSecurityService.setupModule(config, configResult.authWellknownEndpoints);
    });
  }
}
