import { Component, OnInit, OnDestroy, ElementRef, Renderer } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Location } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';


@Component({
    selector: 'nav-menu',
    templateUrl: './navmenu.component.html',
    styleUrls: ['./navmenu.component.css']
})
export class NavMenuComponent implements OnInit, OnDestroy {
    isAuthorizedSubscription: Subscription;
    isAuthorized: boolean;

    constructor(public authService: AuthService, private el: ElementRef, private renderer: Renderer) {
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

    ngOnDestroy(): void {
        this.isAuthorizedSubscription.unsubscribe();
    }

    onMenuClick() {
        //this.el.nativeElement.querySelector('.navbar-ex1-collapse')  get the DOM
        //this.renderer.setElementClass('DOM-Element', 'css-class-you-want-to-add', false) if 3rd value is true 
        //it will add the css class. 'in' class is responsible for showing the menu.
        this.renderer.setElementClass(this.el.nativeElement.querySelector('.navbar-collapse'), 'in', false);
    }

    public login() {
        this.authService.login();
    }

    public refreshSession() {
        this.authService.refreshSession();
    }

    public logout() {
        this.authService.logout();
    }
}