import { Component, Inject, Input } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'providerjobdetails',
    templateUrl: './providerjobdetails.component.html',
    styleUrls: ['./providerjobdetails.component.css']
})

export class ProviderJobDetailsComponent {
    
    public url: string;
    public url2: string;
    public url3: string;
    public auth: any;
    public ob: any;
    private status = -1;    // Disables creation notification messages

    job_id: number; // ID of the job passed from the list of jobs component via url
    jobDetails: ProviderJobDetails; // API returns a single object

    // map related variables
    zoom: number = 15;
    locationLat: number = 51.497325; //Science museum coordinates
    locationLng: number = -0.173927;

    //@Input() datasource;
    selectedImage;
    //images;

    // Offer acceptance
    acceptJobOffer: AcceptJobOffer = {};
 

    constructor(authService: AuthService,
                @Inject('API_URL2') apiUrl: string,
                private router: Router,
                private route: ActivatedRoute) {

        this.route.params.subscribe((params) => { this.job_id = params["id"]; }); // Receiving input url parameter

        //this.url = apiUrl + 'getjobdetails/33'; 
        this.url = apiUrl + 'getproviderjobdetails/' + this.job_id;
        this.url2 = apiUrl + 'acceptoffer';
        this.url3 = apiUrl + 'rejectoffer';
        this.auth = authService;    // inserts JWT into the HTTP requests, it's basically a wrapper'

        // GET request to the API to retrieve job details
        this.auth.get(this.url)
            .subscribe(result => {
                this.jobDetails = result.json() as ProviderJobDetails;
                //console.log('GET REPLY: ' + this.jobDetails[0].jobTitle);
                //this.status = 1;    // Shows Success message on the 

                // Set map coordinates
                this.locationLat = this.jobDetails.locationLat;
                this.locationLng = this.jobDetails.locationLng;
                
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


    acceptOffer() {
        event.stopPropagation();
        
        this.acceptJobOffer.jobId = this.jobDetails.id;
        let body = JSON.stringify(this.acceptJobOffer);
        console.log("Body to send: " + body);

        // POST it to the server
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

    rejectOffer() {
        event.stopPropagation();

        this.acceptJobOffer.jobId = this.jobDetails.id;
        let body = JSON.stringify(this.acceptJobOffer);
        console.log("Body to send: " + body);

        // POST it to the server
        return this.ob = this.auth.post(this.url3, body) //JSON.stringify({ Name: name })
            .subscribe(
            result => {
                console.log(result);
                this.status = 2;    // Shows Success message
            },
            err => {
                console.log('ERROR:');
                console.log(err);
                this.status = 3;    // Shows Failure message
            }
            );
    }

    // Zoom into modal window selected image
    setSelectedImage(image) {
        this.selectedImage = image;
    }
    
    
    // Converts State ID into name
    stateIdToName(stateId: number): string {
        //console.log('State ID' + stateId);
        if (stateId == 0) {
            return 'On Hold';
        }
        if (stateId == 10) {
            return 'Published';
        }
        if (stateId == 20) {
            return 'Offer Sent';
        }
        if (stateId == 30) {
            return 'Expired';
        }
        if (stateId == 40) {
            return 'Accepted';
        }
        if (stateId == 50) {
            return 'Completed';
        }
    }
}

interface ProviderJobDetails {
    id: number,
    clientId: number,
    jobTitle: string,
    ratePerHour?: number,
    rateFixed?: number,
    durationDays?: number,
    durationHours?: number,
    //locationPostCode?: string,
    contactTelephone1?: string,
    contactTelephone2?: string,
    //contactEmail?: string,
    jobState?: number,
    plannedStartDate?: Date,
    plannedFinishDate?: Date,
    locationLat?: number,
    locationLng?: number,
    skill?: string,
    //applied?: number;
    jobDescription?: string,
    images?: string[];
};

interface AcceptJobOffer {
    jobId?: number
}
