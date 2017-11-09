import { Component, Inject, OnInit, OnDestroy, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'clientnewfeedback',
    templateUrl: './clientnewfeedback.component.html',
    styleUrls: ['./clientnewfeedback.component.css']
})
export class ClientNewFeedbackComponent {

    rForm: FormGroup;
    post: any;                     // A property for our submitted form
        
    public url: string;
    public auth: any;
    public ob: any;
    private status = -1;    // Disables creation notification messages

    newclientfeedback: NewClientFeedback = {};   
    @Input() provider_id: number; // ID of the provider passed from the list of applications component via url
    @Input() job_id: number;
    @Output() feedbackJobId: EventEmitter<number> = new EventEmitter<number>();

    // Rating stars
    private stars: Array<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    private skillsRate: number = 5;
    private communicationRate: number = 5;
    private punctualityRate: number = 5;
    
    constructor(private fb: FormBuilder,
            authService: AuthService,
            @Inject('API_URL2') apiUrl: string,
            private router: Router,
            private http: Http,
            private route: ActivatedRoute) {

        //this.route.params.subscribe((params) => {
        //    this.job_id = params["jobid"];
        //    this.provider_id = params["providerid"];            
        //}); // Receiving input url parameter

        this.url = apiUrl + 'CreateClientFeedback';
        this.auth = authService;                        // inserts JWT and implements HTTP methods
        
        // Setup fields in the FormBuilder
        this.rForm = fb.group({
            'feedbackDescription': [null, Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(400)])],
            'validate': ''
        });
    }
    
    // Star rating update methods
    updateSkillsRate(value) {
        this.skillsRate = value;
    }

    updateCommunicationRate(value) {
        this.communicationRate = value;
    }

    updatePunctualityRate(value) {
        this.punctualityRate = value;
    }
    
    
    // POST the form to WEBAPI
    createNewClientFeedback(formdata) {
        // Prepare the JSON body message
        this.newclientfeedback.jobId = this.job_id;
        this.newclientfeedback.providerId = this.provider_id;
        this.newclientfeedback.feedbackDescription = formdata.feedbackDescription;
        this.newclientfeedback.skills = this.skillsRate;
        this.newclientfeedback.communication = this.communicationRate;
        this.newclientfeedback.punctuality = this.punctualityRate;

        let body = JSON.stringify(this.newclientfeedback);
        console.log("Body to send" + body);

        // POST it to the server
        return this.ob = this.auth.post(this.url, body) //JSON.stringify({ Name: name })
            .subscribe(
            result => {
                console.log(result);
                this.status = 1;    // Shows Success message
                this.feedbackJobId.emit(this.newclientfeedback.jobId); // Return binded variable to the parrent (clientfeedbacks)
            },
            err => {
                console.log('ERROR:');
                console.log(err);
                this.status = 0;    // Shows Failure message
            }
            );
    }    
}

interface NewClientFeedback {
    jobId?: number,
    providerId?: number,
    feedbackDescription?: string;
    skills?: number;
    communication?: number;
    punctuality?: number;
}
