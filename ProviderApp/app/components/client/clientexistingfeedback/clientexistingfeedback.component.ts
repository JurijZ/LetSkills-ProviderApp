import { Component, Inject, OnInit, OnDestroy, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'clientexistingfeedback',
    templateUrl: './clientexistingfeedback.component.html',
    styleUrls: ['./clientexistingfeedback.component.css']
})
export class ClientExistingFeedbackComponent {
    public url: string;
    public url2: string;
    public auth: any;
    private status = -1;    // Disables notification messages

    clientexistingfeedback: ClientExistingFeedback = {};   
    //@Input() provider_id: number; // ID of the provider passed from the list of applications component via url
    @Input() job_id: number;

    // Rating stars
    private stars: Array<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    private skillsRate: number = 10;
    private communicationRate: number = 10;
    private punctualityRate: number = 10;
    private feedbackDescription: string = 'Loading...';
    private feedbackTimestamp: string = '';
    
    constructor(private fb: FormBuilder,
            authService: AuthService,
            @Inject('API_URL2') apiUrl: string,
            private router: Router,
            private http: Http,
            private route: ActivatedRoute) {

        this.url = apiUrl + 'GetClientFeedbackSingle/';
        this.auth = authService;    // inserts JWT into the HTTP requests, it's basically a wrapper'
    }

    ngOnInit() {
    }

    // this runs when the @Input() job_id parameter is updated/sent to this component
    ngOnChanges() {
        this.url2 = this.url + this.job_id;
        console.log("Requesting URL: " + this.url2);

        // GET request to the API to retrieve job details
        this.auth.get(this.url2)
            .subscribe(result => {
                this.clientexistingfeedback = result.json() as ClientExistingFeedback;
                //console.log('GET REPLY: ' + this.jobDetails[0].jobTitle);
                //this.status = 1;    // Shows Success message on the 

                // In case if the returned object has no data
                if (this.clientexistingfeedback) {
                    this.feedbackTimestamp = this.clientexistingfeedback.feedbackTimestamp;
                    this.feedbackDescription = this.clientexistingfeedback.feedbackDescription;
                    this.skillsRate = this.clientexistingfeedback.skills;
                    this.communicationRate = this.clientexistingfeedback.communication;
                    this.punctualityRate = this.clientexistingfeedback.punctuality;
                }
                else {
                    this.feedbackDescription = 'Could not find the feedback, Sorry.';
                }

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

interface ClientExistingFeedback {
    jobId?: number,
    providerId?: number,
    feedbackDescription?: string;
    skills?: number;
    communication?: number;
    punctuality?: number;
    feedbackTimestamp?: string;
}
