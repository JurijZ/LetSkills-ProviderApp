import { Component, Inject, Input } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'jobdetails',
    templateUrl: './jobdetails.component.html',
    styleUrls: ['./jobdetails.component.css']
})

export class JobDetailsComponent {
    
    public url: string;
    public url2: string;
    public url3: string;
    public auth: any;
    public ob: any;
    private putOnHoldStatus = -1;    // Disables Pu On Hold button notification messages
    private complitedStatus = -1 

    job_id: number; // ID of the job passed from the list of jobs component via url
    jobDetails: JobDetails; // API returns a single object

    // map related variables
    zoom: number = 15;
    locationLat: number = 51.497325; //Science museum coordinates
    locationLng: number = -0.173927;

    //@Input() datasource;
    selectedImage;
    //images;

    // Editability control
    editable: boolean = false; // By default job is editable
    unpublishable: boolean = false; 
    complitable: boolean = false;

    // Telehone number verification variables
    verificationTelNumber: string = '';
    verificationJobId: number = 0;
    currentTime: number = 0;
    

    constructor(authService: AuthService,
                @Inject('API_URL2') apiUrl: string,
                private router: Router,
                private route: ActivatedRoute) {

        this.route.params.subscribe((params) => { this.job_id = params["id"]; }); // Receiving input url parameter

        //this.url = apiUrl + 'getjobdetails/33'; 
        this.url = apiUrl + 'getjobdetails/' + this.job_id;
        this.url2 = apiUrl + 'updatejobstate/';
        this.url3 = apiUrl + 'sendtelverificationsms';
        this.auth = authService;    // inserts JWT into the HTTP requests, it's basically a wrapper'

        // GET request to the API to retrieve job details
        this.auth.get(this.url)
            .subscribe(result => {
                this.jobDetails = result.json() as JobDetails;
                //console.log('GET REPLY: ' + this.jobDetails[0].jobTitle);
                //this.status = 1;    // Shows Success message on the 

                // Set map coordinates
                this.locationLat = this.jobDetails.locationLat;
                this.locationLng = this.jobDetails.locationLng;

                // Check the state of the Job to set the bottom button
                this.isJobEditable(this.jobDetails.jobState);       // Default false
                this.isJobUnpublishable(this.jobDetails.jobState);  // Default false
                this.isJobComplitable(this.jobDetails.jobState);    // Default false
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
    setSelectedImage(image) {
        this.selectedImage = image;
    }

    editJobDetails(job_id) {
        this.router.navigate(["editjob", job_id]);
    }

    unpublishJob(job_id) {
        // Change the state of the job

        let body = JSON.stringify({ jobState: 0 })
        console.log(body);

        // PUT (deliver updated values to the server)
        return this.ob = this.auth.put(this.url2 + job_id, body) //JSON.stringify({ Name: name })
            .subscribe(
            result => {
                console.log(result);
                this.putOnHoldStatus = 1;    // Shows Success message
            },
            err => {
                console.log('ERROR:');
                console.log(err);
                this.putOnHoldStatus = 0;    // Shows Failure message
            }
            );
    }

    completeJob(job_id) {
        // Change the state of the job

        let body = JSON.stringify({ jobState: 50 })
        console.log(body);

        // PUT (deliver updated values to the server)
        return this.ob = this.auth.put(this.url2 + job_id, body) //JSON.stringify({ Name: name })
            .subscribe(
            result => {
                console.log(result);
                this.complitable = false;      // Hide "Job" Completed" button
                this.complitedStatus = 1;    // Shows Success message
                
            },
            err => {
                console.log('ERROR:');
                console.log(err);
                this.complitedStatus = 0;    // Shows Failure message
            }
            );
    }

    isJobEditable(jobState: number) {
        // If the state of the job is On Hold then it can be edited
        if (jobState == 0) {
            this.editable = true;
        }
    }

    isJobUnpublishable(jobState: number) {
        // If the state of the job is Published then it can be Unpublished
        if (jobState == 10) {
            this.unpublishable = true;
        }
    }

    isJobComplitable(jobState: number) {
        // If the state of the job is Accepted then it can be Complited
        if (jobState == 40) {
            this.complitable = true;
        }
    }

    // Navigate to the feedback page
    leaveFeedback() {
        this.router.navigate(["clientfeedbacks"]);
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

    // Sending an SMS message with the code to start telephone number verification 
    sendVerificationSMS(telnumber: string) {
        console.log(telnumber);
        this.verificationTelNumber = telnumber;
        this.verificationJobId = this.jobDetails.id;

        console.log("Number to verify" + this.verificationTelNumber);
        
        let body = JSON.stringify({ telnumber: telnumber, objectid: this.jobDetails.id, objectidtype: 0 });
        console.log("Body to send" + body);

        // Request SMS sending in the backend (POST)
        return this.ob = this.auth.post(this.url3, body) //JSON.stringify({ Name: name })
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
        this.jobDetails.telephone1Verified = verifiedtelnumber;
    }

    // Function is triggered when the Phone verification Modal window is closed 
    // this is to use onChange hook in the verifytelnumber component
    getCurrentTime() {
        //console.log("executing getCurrentTime()");
        this.currentTime = Date.now();
    }
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
