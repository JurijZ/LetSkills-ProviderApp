import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'home',
    templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit{

    isAuthorizedSubscription: Subscription;
    isAuthorized: boolean;

    constructor(private location: Location,
        public authService: AuthService,
        private router: Router) {
    }

    ngOnInit() {
        this.isAuthorizedSubscription = this.authService.getIsAuthorized().subscribe(
            (isAuthorized: boolean) => {
                this.isAuthorized = isAuthorized;
            });

        if (window.location.hash) {
            this.authService.authorizedCallback();
        }
    }

    login() {
        //this.service.startSigninMainWindow();
        this.authService.login();
    }

    logout() {
        //this.service.startSigninMainWindow();
        this.authService.logout();
    }
}
