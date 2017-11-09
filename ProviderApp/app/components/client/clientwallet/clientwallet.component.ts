import { Component, Inject, Input } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'clientwallet',
    templateUrl: './clientwallet.component.html',
    styleUrls: ['./clientwallet.component.css']
})

export class ClientWalletComponent {

    public url: string;
    public url2: string;
    public auth: any;
    public ob: any;
    private status = -1;    // Disables creation notification messages

    pager: any = {}; // pager object
    clientWallet: ClientBalance;     // API call reply
    availableAmmount: number = 0;
    blockedAmmount: number = 0;

    constructor(authService: AuthService,
                @Inject('API_URL2') apiUrl: string,
                private router: Router) {
        
        this.url = apiUrl + 'GetClientBalance';
        this.auth = authService;    // inserts JWT into the HTTP requests, it's basically a wrapper'

        
        // GET request to the API to retrieve client Wallet
        this.auth.get(this.url)
            .subscribe(result => {
                this.clientWallet = result.json() as ClientBalance;

                this.availableAmmount = this.clientWallet.availableAmmount
                this.blockedAmmount = this.clientWallet.blockedAmmount

                console.log("Available Ammount" + this.clientWallet.availableAmmount);
            },
            (err) => {
                if (err === 'Unauthorized') {
                    console.log('Unauthorized, Redirecting....');
                    // Redirect to unauthorized route (it's defined in the app.module.shared.ts)
                    this.router.navigate(['/unauthorized']);
                }
            }
         );
    }
}


interface ClientBalance {
    availableAmmount: number,
    blockedAmmount: number
}