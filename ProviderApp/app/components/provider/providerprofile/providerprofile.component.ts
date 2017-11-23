import { Component, Inject, Input, HostListener } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'providerprofile',
    templateUrl: './providerprofile.component.html',
    styleUrls: ['./providerprofile.component.css']
})

export class ProviderProfileComponent {

    // To show warning message if Browser Reload button clicked
    @HostListener('window:beforeunload', ['$event'])
    doSomething($event) {
        if (true) {
            $event.returnValue = 'You are about to Exit web site';
        }
    }
    
    public url: string;
    public url2: string;
    public auth: any;
    public ob: any;
    selectedImage;
    
    providerProfile: ProviderProfile; // API returns a single object

    // map related variables
    zoom: number = 15;
    locationLat: number = 51.497325; //Science museum coordinates
    locationLng: number = -0.173927;

    // Telehone number verification variables
    verificationTelNumber: string = '';
    verificationProviderId: number = 0;
    currentTime: number = 0;

    constructor(authService: AuthService, @Inject('API_URL2') apiUrl: string, private router: Router) {
         
        this.url = apiUrl + 'getproviderprofile'; 
        this.url2 = apiUrl + 'sendtelverificationsms';
        this.auth = authService;    // inserts JWT into the HTTP requests, it's basically a wrapper'

        // GET request to the API to retrieve current client profile
        this.auth.get(this.url)
            .subscribe(result => {
                this.providerProfile = result.json() as ProviderProfile;

                // Set map coordinates
                this.locationLat = this.providerProfile.locationLat;
                this.locationLng = this.providerProfile.locationLng;
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
        this.selectedImage = this.providerProfile.profileImageUrl;
    }

    // Edit button click
    editProviderProfile() {
        this.router.navigate(["providereditprofile"]);
    }

    // Sending an SMS message with the code to start telephone number verification 
    sendVerificationSMS(telnumber: string) {
        console.log(telnumber);
        this.verificationTelNumber = telnumber;
        this.verificationProviderId = this.providerProfile.id;

        console.log("Number to verify" + this.verificationTelNumber);

        let body = JSON.stringify({ telnumber: telnumber, objectid: this.providerProfile.id, objectidtype: 1 });
        console.log("Body to send" + body);

        // Request SMS sending in the backend (POST)
        return this.ob = this.auth.post(this.url2, body) //JSON.stringify({ Name: name })
            .subscribe(
            result => {
                console.log(result);
                //this.status = 1;    // Shows Success message
            },
            err => {
                console.log('ERROR:');
                console.log(err);
                //this.status = 0;    // Shows Failure message
            }
            );

    }

    // Two way binding in HTML for verifytelnumber, it passes value into this method
    verificationTelNotification(verifiedtelnumber: string) {
        console.log("Verified Telephone number return: " + verifiedtelnumber);

        // Update telephone1Verified property which changes verification button to green
        this.providerProfile.telephone1Verified = verifiedtelnumber;
    }

    // Function is triggered when the Phone verification Modal window is closed 
    // this is to use onChange hook in the verifytelnumber component
    getCurrentTime() {
        //console.log("executing getCurrentTime()");
        this.currentTime = Date.now();
    }
}

interface ProviderProfile {
    id: number,
    name: string,
    surname: string,
    username: string,
    //addressId: string,
    //haveAcar: boolean,
    //isClient: boolean,
    //isProvider: boolean,
    //lastLoginTime : Date,

    contactEmail?: string,
    contactTelephone1?: string,
    contactTelephone2?: string,
    profileImageUrl?: string,
    haveAcar?: boolean,
    locationLat?: number,
    locationLng?: number,
    telephone1Verified?: string,
    
    //country?: string,
    //city?: string,
    //adressLine1?: string,
    //adressLine2?: string,
    //postCode?: string,
    
    skills?: string[]
    //skillsFullList?: string[]     // GET request to GetProviderProfile returns full skil list by default. This is done for edit, but as a side effect gets to this component as well. Rethinking is needed here
};
