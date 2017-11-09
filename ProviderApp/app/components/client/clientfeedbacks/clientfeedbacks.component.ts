import { Component, Inject, Input, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../../services/auth.service';
import { PaginationService } from '../../services/pagination.service';

@Component({
    selector: 'clientfeedbacks',
    templateUrl: './clientfeedbacks.component.html',
    styleUrls: ['./clientfeedbacks.component.css']
})

export class ClientFeedbacksComponent {
    
    public url: string;
    public auth: any;
    public ob: any;
    private status = -1;    // Disables creation notification messages
    public visible = 0;     // disables modal window of the existing feedback

    pager: any = {};                        // pager object
    myCompletedJobsPaged: CompletedJobs[];  // paged array of My Jobs items
    myCompletedJobs: CompletedJobs[];       // API returns an array of objects

    existingFeedbackId: number = 0;
    newFeedbackJobId: number = 0;
    newFeedbackProviderId: number = 0;


    constructor(authService: AuthService,
                @Inject('API_URL2') apiUrl: string,
                private router: Router,
                private pagerService: PaginationService) {

        this.url = apiUrl + 'getclientcompletedjobs'; 
        this.auth = authService;    // inserts JWT into the HTTP requests, it's basically a wrapper'

        // GET request to the API to retrieve job details
        this.auth.get(this.url)
            .subscribe(result => {
                this.myCompletedJobs = result.json() as CompletedJobs[];
                //console.log('GET REPLY: ' + this.jobDetails[0].jobTitle);
                //this.status = 1;    // Shows Success message on the 

                // initialize to page 1
                this.setPage(1);
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
    
    existingFeedbackParameters(jobId: number) {
        this.visible = 1;
        this.existingFeedbackId = jobId;
    }

    newFeedbackParameters(jobId: number, providerId: number) {
        console.log("JobId " + jobId);
        console.log("ProviderId " + providerId);
        this.newFeedbackJobId = jobId;
        this.newFeedbackProviderId = providerId;
    }
    
    // Converts State ID into name
    stateIdToName(stateId: number): string {
        //console.log('State ID' + stateId);
        if (stateId == 0) {
            return 'Created';
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

    // Navigate to the New Feedback page
    //leaveFeedback(jobId: number, providerId: number) {
    //    this.router.navigate(["clientnewfeedback", jobId, providerId]); 
    //    //this.router.navigateByUrl('/jobdetails');
    //}

    // Two way binding in HTML for clientnewfeedback passes value to this method
    feedbackSubmitedNotification(feedbackJobId: number) {
        console.log("Feedback created for the Job ID: " + feedbackJobId);

        let feedbackedJob = this.myCompletedJobs.filter(j => j.jobId == feedbackJobId);
        //console.log("Feedback created for the Job ID: " + feedbackedJob[0]);

        let i = this.myCompletedJobs.indexOf(feedbackedJob[0]);

        // Modify job object in the array
        this.myCompletedJobs[i].feedbackSubmited = feedbackJobId;
    }

    

    // Pagination
    setPage(page: number) {
        if (page < 1 || page > this.pager.totalPages) {
            return;
        }

        // get pager object from the service class
        this.pager = this.pagerService.getPager(this.myCompletedJobs.length, page);

        // get a subset of jobs from the array to present on the page
        this.myCompletedJobsPaged = this.myCompletedJobs.slice(this.pager.startIndex, this.pager.endIndex + 1);
    }
}

interface CompletedJobs {
    providerId?: number,
    providerName?: string,
    providerProfileImageUrl: string,
    clientId?: number,
    jobId?: number,
    jobTitle?: string,
    jobState?: number,
    plannedStartDate?: Date,
    plannedFinishDate?: Date,
    feedbackSubmited?: number
};
