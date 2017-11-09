import { Component, Inject, Input } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'clientprofile',
    templateUrl: './clientprofile.component.html',
    styleUrls: ['./clientprofile.component.css']
})

export class ClientProfileComponent {
    
    public url: string;
    public auth: any;
    selectedImage;
    
    clientProfile: ClientProfile; // API returns a single object


    constructor(authService: AuthService, @Inject('API_URL2') apiUrl: string, private router: Router) {
         
        this.url = apiUrl + 'getclientprofile'; 
        this.auth = authService;    // inserts JWT into the HTTP requests, it's basically a wrapper'

        // GET request to the API to retrieve current client profile
        this.auth.get(this.url)
            .subscribe(result => {
                this.clientProfile = result.json() as ClientProfile;
                
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

    // Zoom into modal window selected image
    setSelectedImage() {
        this.selectedImage = this.clientProfile.profileImageUrl;
    }

    // Edit button click
    editCientProfile() {
        this.router.navigate(["editclientprofile"]);
    }
}

interface ClientProfile {
    id: number,
    name: string,
    surname: string,
    username: string,
    //addressId: string,
    //haveAcar: boolean,
    //isClient: boolean,
    //isProvider: boolean,
    lastLoginTime : Date,

    contactEmail: string,
    contactTelephone1: string,
    contactTelephone2: string,
    profileImageUrl: string,
    
    country: string,
    city: string,
    adressLine1: string,
    adressLine2: string,
    postCode: string
};
