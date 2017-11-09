import { Component, Inject, Input } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'providerdetails',
    templateUrl: './providerdetails.component.html',
    styleUrls: ['./providerdetails.component.css']
})

export class ProviderDetailsComponent {
    
    public url: string;
    public url2: string;
    public url3: string;
    public url4: string;
    public url5: string;
    public auth: any;
    public ob: any;
    public status: number = -1;

    provider_id: number; // ID of the provider passed from the list of applications component via url
    job_id: number
    providerDetails: ProviderDetails;       // API returns a single object
    clientFeedbacks: ClientFeedbacks[];     // API returns an arrays of objects
    jobDetails: JobDetails;                 // API returns a single object
    clientBalance: ClientBalance;           // API returns a single objec
    
    // telephone verification status
    telephoneIsVerified: number = 0

    // map related variables
    zoom: number = 15;
    locationLat: number = 51.497325; //Science museum coordinates
    locationLng: number = -0.173927;

    // expiry durations
    offerExpiry: number = 15;
    durations: number[] = [15, 30, 45, 60];
    newOffer: NewOffer = {};

    // wallet
    availableAmmount: number = 0;

    constructor(authService: AuthService,
                @Inject('API_URL2') apiUrl: string,
                private router: Router,
                private route: ActivatedRoute) {

        this.route.params.subscribe((params) => {
            this.provider_id = params["providerid"];
            this.job_id = params["jobid"];
        }); // Receiving input url parameter

        console.log("Provider ID: " + this.provider_id);
        console.log("Job ID: " + this.job_id);

        this.url = apiUrl + 'getproviderdetails/' + this.provider_id;
        this.url2 = apiUrl + 'createoffer';
        this.url3 = apiUrl + 'getclientfeedbacks/' + this.provider_id;
        this.url4 = apiUrl + 'getjobdetails/' + this.job_id;
        this.url5 = apiUrl + 'GetClientBalance';
        this.auth = authService;    // inserts JWT into the HTTP requests, it's basically a wrapper'

        // GET request to the API to retrieve current client profile
        this.auth.get(this.url)
            .subscribe(result => {
                this.providerDetails = result.json() as ProviderDetails;

                // Set map coordinates
                this.locationLat = this.providerDetails.locationLat;
                this.locationLng = this.providerDetails.locationLng;

                // Set duration
                //this.duration = 30;
            },
            (err) => {
                if (err === 'Unauthorized') {
                    console.log('Unauthorized, Redirecting....');
                    // Redirect to unauthorized route (it's defined in the app.module.shared.ts)
                    this.router.navigate(['/unauthorized']);
                }
            }
        );

        this.auth.get(this.url4)
            .subscribe(result => {
                this.jobDetails = result.json() as JobDetails;

                // Check the state of phone verification
                this.isTelephoneVerified(this.jobDetails);       // Default false
            },
            (err) => {
                if (err === 'Unauthorized') {
                    console.log('Unauthorized, Redirecting....');
                    // Redirect to unauthorized route (it's defined in the app.module.shared.ts)
                    this.router.navigate(['/unauthorized']);
                }
            }
        );

        // GET request to the API to retrieve client Wallet
        this.auth.get(this.url5)
            .subscribe(result => {
                this.clientBalance = result.json() as ClientBalance;

                this.availableAmmount = this.clientBalance.availableAmmount;

                console.log("Available Ammount: " + this.clientBalance.availableAmmount);
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
    
    getClientFeedbacks() {
        // GET request to the API to retrieve clients feedback
        this.auth.get(this.url3)
            .subscribe(result => {
                this.clientFeedbacks = result.json() as ClientFeedbacks[];
                
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
    
    selectExpiryDuration(duration: number) {
        this.offerExpiry = duration;
        console.log(this.offerExpiry);
    }

    isTelephoneVerified(jobDetails: JobDetails) {
        //console.log(jobDetails.contactTelephone1 + ' - ' + jobDetails.telephone1Verified);

        if (jobDetails.contactTelephone1 == jobDetails.telephone1Verified) {
            this.telephoneIsVerified = 1;
            //console.log("Is telephone verified: " + this.telephoneIsVerified);
        }
        else {
            this.telephoneIsVerified = 0;
            //console.log("Is telephone verified: " + this.telephoneIsVerified);
        }
    }

    navigateToAJob() {
        let r = '/jobdetails/' + this.job_id;
        this.router.navigate([r]);
    }

    navigateToAWallet() {
        let r = '/clientwallet';
        this.router.navigate([r]);
    }
    
    makeAnOffer() {
        // POST an Offer

        // Im not sending ClientID hence it can be extracted from the JWT token and the jobid
        console.log("Job ID: " + this.job_id);
        console.log("Provider ID: " + this.providerDetails.id);
        console.log("OfferExpiry: " + this.offerExpiry);

        this.newOffer.jobId = this.job_id;
        this.newOffer.providerId = this.providerDetails.id;
        this.newOffer.offerExpiry = this.offerExpiry;

        let body = JSON.stringify(this.newOffer);
        console.log("Body to send" + body);

        // POST Offer to the server
        return this.ob = this.auth.post(this.url2, body) //JSON.stringify({ Name: name })
            .subscribe(
            result => {
                console.log(result);
                this.status = 1;    // Shows Success message
            },
            err => {
                console.log('ERROR:');
                console.log(err);
                this.status = 0;    // Shows Failure message
            }
            );
    }
}

interface ProviderDetails {
    id: number,
    name: string,
    surname: string,
    //username: string,
    //addressId: string,
    //haveAcar: boolean,
    //isClient: boolean,
    //isProvider: boolean,
    //lastLoginTime : Date,

    //contactEmail?: string,
    //contactTelephone1?: string,
    //contactTelephone2?: string,
    profileImageUrl?: string,
    haveAcar?: boolean,
    locationLat?: number,
    locationLng?: number,
    rating?: number,
    
    //country?: string,
    //city?: string,
    //adressLine1?: string,
    //adressLine2?: string,
    //postCode?: string,
    
    skills?: string[]
    //skillsFullList?: string[]     // GET request to GetProviderProfile returns full skil list by default. This is done for edit, but as a side effect gets to this component as well. Rethinking is needed here
};

interface NewOffer {
    jobId?: number,
    providerId?: number,
    offerExpiry?: number
}

interface ClientFeedbacks {
    feedBackDescription?: string,
    skills?: number,
    communication?: number,
    punctuality?: number,
    feedbackTimestamp?: string,
    jobTitle?: string,
}

interface JobDetails {
    id: number,
    clientId: number,
    jobTitle: string,
    ratePerHour?: number,
    rateFixed?: number,
    durationDays?: number,
    durationHours?: number,
    locationPostCode?: string,
    contactTelephone1?: string,
    contactTelephone2?: string,
    contactEmail?: string,
    jobState?: number,
    plannedStartDate?: Date,
    plannedFinishDate?: Date,
    locationLat?: number,
    locationLng?: number,
    skill?: string,
    telephone1Verified?: string,
    //applied?: number;
    jobDescription?: string,
    images?: string[];
};

interface ClientBalance {
    availableAmmount?: number,
    blockedAmmount?: number
}