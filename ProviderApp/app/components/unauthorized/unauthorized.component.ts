import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-unauthorized',
    templateUrl: 'unauthorized.component.html'
})
export class UnauthorizedComponent implements OnInit {

    constructor(private location: Location,
                public authService: AuthService,
                private router: Router) {
    }

    ngOnInit() {
    }

    login() {
        //this.service.startSigninMainWindow();
        this.authService.login();
    }

    goback() {
        //this.location.back();
        this.router.navigate(['/home']);
    }
}