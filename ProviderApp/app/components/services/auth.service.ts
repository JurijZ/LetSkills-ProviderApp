import { Injectable, Component, OnInit, OnDestroy } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/catch';

import { EnvironmentConfig } from '../environments';
import { OidcSecurityService, OpenIDImplicitFlowConfiguration } from 'angular-auth-oidc-client';

@Injectable()
export class AuthService implements OnInit, OnDestroy {
    isAuthorizedSubscription: Subscription;
    isAuthorized: boolean;

    constructor(public oidcSecurityService: OidcSecurityService,
        private http: Http) {

        const openIDImplicitFlowConfiguration = new OpenIDImplicitFlowConfiguration();
        openIDImplicitFlowConfiguration.stsServer = EnvironmentConfig.stsServer;

        // redirect_url is the page the user is redirected to, after authentication (along with the token)
        openIDImplicitFlowConfiguration.redirect_url = EnvironmentConfig.redirect_url;

        // The Client MUST validate that the aud (audience) Claim contains its client_id value registered at the Issuer identified by the iss (issuer) Claim as an audience.
        // The ID Token MUST be rejected if the ID Token does not list the Client as a valid audience, or if it contains additional audiences not trusted by the Client.
        openIDImplicitFlowConfiguration.client_id = 'ng'; //'ng'
        openIDImplicitFlowConfiguration.response_type = 'id_token token';
        openIDImplicitFlowConfiguration.scope = 'openid profile apiApp';
        openIDImplicitFlowConfiguration.post_logout_redirect_uri = EnvironmentConfig.post_logout_redirect_uri;
        openIDImplicitFlowConfiguration.start_checksession = true;
        
        openIDImplicitFlowConfiguration.silent_renew = true;
        openIDImplicitFlowConfiguration.startup_route = '/provider';
        // HTTP 403
        openIDImplicitFlowConfiguration.forbidden_route = '/forbidden';
        // HTTP 401
        openIDImplicitFlowConfiguration.unauthorized_route = '/unauthorized';
        openIDImplicitFlowConfiguration.log_console_warning_active = true;
        openIDImplicitFlowConfiguration.log_console_debug_active = false;
        // id_token C8: The iat Claim can be used to reject tokens that were issued too far away from the current time,
        // limiting the amount of time that nonces need to be stored to prevent attacks.The acceptable range is Client specific.
        openIDImplicitFlowConfiguration.max_id_token_iat_offset_allowed_in_seconds = 10;
        
        this.oidcSecurityService.setupModule(openIDImplicitFlowConfiguration);
    }

    ngOnInit() {
        this.isAuthorizedSubscription = this.oidcSecurityService.getIsAuthorized().subscribe(
            (isAuthorized: boolean) => {
                this.isAuthorized = isAuthorized;
            });

        if (window.location.hash) {
            this.oidcSecurityService.authorizedCallback();
        }
    }

    ngOnDestroy(): void {
        if (this.isAuthorizedSubscription) { // this check is to avoid "Cannot read property 'unsubscribe' of undefined" error
            this.isAuthorizedSubscription.unsubscribe();
        }
    }

    authorizedCallback() {
        this.oidcSecurityService.authorizedCallback();
    }

    getIsAuthorized(): Observable<boolean> {
        return this.oidcSecurityService.getIsAuthorized();
    }

    login() {
        console.log('start login');
        this.oidcSecurityService.authorize();
    }

    refreshSession() {
        console.log('start refreshSession');
        this.oidcSecurityService.authorize();
    }

    logout() {
        console.log('start logoff');
        this.oidcSecurityService.logoff();
    }

    get(url: string, options?: RequestOptions): Observable<Response> {
        if (options) {
            options = this.setRequestOptions(options);
        }
        else {
            options = this.setRequestOptions();
        }
        
        return this.http.get(url, options).
                        catch(e => {
                            if (e.status === 401) {
                                console.log('Unauthorized, Throwing an error....');
                                return Observable.throw('Unauthorized');
                            }
                            // do any other checking for statuses here
                        });
    }
    
    delete(url: string, options?: RequestOptions): Observable<Response> {
        if (options) {
            options = this.setRequestOptions(options);
        }
        else {
            options = this.setRequestOptions();
        }
        return this.http.delete(url, options);
    }

    put(url: string, data: any, options?: RequestOptions): Observable<Response> {
        //let body = JSON.stringify(data);

        options = this.setPostRequestOptions(data);

        //if (options) {
        //    options = this.setRequestOptions(options);
        //}
        //else {
        //    options = this.setRequestOptions();
        //}

        //console.log('Options: ' + JSON.stringify(options));
        //console.log('Body: ' + data);

        return this.http.put(url, data, options);
    }

    post(url: string, data: any, options?: RequestOptions): Observable<any> { //
        //let body = JSON.stringify(data);

        options = this.setPostRequestOptions(data);

        //if (options) {
        //    options = this.setRequestOptions(data);
        //}
        //else {
        //    options = this.setRequestOptions();
        //}

        //console.log('Options: ' + JSON.stringify(options));
        //console.log('Body: ' + data);

        //return this.http.post(url, data, options).map(res => res.json());
        //let body = { Name: 'aaaaaaaa' };
        
        return this.http.post(url, data, options);
    }

    private extractData(res: Response) {
        let body = res.json();
        return body || {};
    }

    private setRequestOptions(options?: RequestOptions) {
        if (options) {
            this.appendAuthHeader(options.headers);
        }
        else {
            options = new RequestOptions({ headers: this.getHeaders(), body: "" }); //{\"Name\":\"test\"}
        }
        return options;
    }

    private setPostRequestOptions(data: string, options?: RequestOptions) {
        options = new RequestOptions({ headers: this.getHeaders(), body: data }); //{\"Name\":\"test\"}
        
        return options;
    }

    private getHeaders() {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        this.appendAuthHeader(headers);
        return headers;
    }

    private appendAuthHeader(headers: Headers) {       
        const token = this.oidcSecurityService.getToken();

        if (token == '') return;

        const tokenValue = 'Bearer ' + token;
        headers.append('Authorization', tokenValue);
    }


}