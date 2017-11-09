import { Component, Inject, Input } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'offerproviderdetails',
    templateUrl: './offerproviderdetails.component.html',
    styleUrls: ['./offerproviderdetails.component.css']
})

export class OfferProviderDetailsComponent {
    
    public url: string;
    public auth: any;
    selectedImage;

    providerId: number; // ID of the provider passed from the list of applications component via url
    jobId: number;
    providerDetails: OfferProviderDetails; // API returns a single object

    // map related variables
    zoom: number = 15;
    locationLat: number = 51.497325; //Science museum coordinates
    locationLng: number = -0.173927;

    // expiry durations
    durations: number[] = [15, 30, 45, 60];

    constructor(authService: AuthService,
        @Inject('API_URL2') apiUrl: string,
        private router: Router,
        private route: ActivatedRoute) {

        this.route.params.subscribe((params) => { this.providerId = params["id"]; }); // Receiving input url parameter

        this.url = apiUrl + 'getofferproviderdetails/' + this.providerId; 
        this.auth = authService;    // inserts JWT into the HTTP requests, it's basically a wrapper'

        // GET request to the API to retrieve current client profile
        this.auth.get(this.url)
            .subscribe(result => {
                this.providerDetails = result.json() as OfferProviderDetails;

                // Set map coordinates
                this.locationLat = this.providerDetails.locationLat;
                this.locationLng = this.providerDetails.locationLng;
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
        this.selectedImage = this.providerDetails.profileImageUrl;
    }
}

interface OfferProviderDetails {
    //id: number,
    name: string,
    surname: string,
    //username: string,
    //addressId: string,
    //haveAcar: boolean,
    //isClient: boolean,
    //isProvider: boolean,
    //lastLoginTime : Date,

    //contactEmail?: string,
    contactTelephone1?: string,
    contactTelephone2?: string,
    profileImageUrl?: string,
    haveAcar?: boolean,
    locationLat?: number,
    locationLng?: number,
    
    //country?: string,
    //city?: string,
    //adressLine1?: string,
    //adressLine2?: string,
    //postCode?: string,
    
    skills?: string[]
    //skillsFullList?: string[]     // GET request to GetProviderProfile returns full skil list by default. This is done for edit, but as a side effect gets to this component as well. Rethinking is needed here
};
