import { Component, Inject, OnInit, Input, HostListener } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../../services/auth.service';
import { PaginationService } from '../../services/pagination.service';
import { SearchResultsService } from '../../services/search.service';
import { ProviderDashboardStateService } from '../../services/providerdashboard.service';
import { ProviderProfileService } from '../../services/providerprofile.service';

@Component({
    selector: 'providerdashboard',
    templateUrl: './providerdashboard.component.html',
    styleUrls: ['./providerdashboard.component.css']
})

export class ProviderDashboardComponent implements OnInit {

    // To show warning message if Browser Reload button clicked
    @HostListener('window:beforeunload', ['$event'])
    doSomething($event) {
        if (true) {
            $event.returnValue = 'You are about to Exit web site';
        }
    }

    public url: string;
    public url2: string;
    public url3: string;
    public auth: any;
    public ob: any;
    private status = -1;    // Disables creation notification messages

    pager: any = {}; // pager object
    providerJobsPaged: ProviderJobs[]; // paged array of provider Jobs items
    providerJobs: ProviderJobs[]; // API returns an array of objects

    offeredJobs: ProviderJobs[];
    acceptedJobs: ProviderJobs[];
    inProgressJobs: ProviderJobs[];
    appliedJobs: ProviderJobs[];
    completedJobs: ProviderJobs[];

    onHoldJobsLength: number = 0;
    appliedJobsLength: number = 0; //publishedJobsLength: number = 0;
    expiredJobsLength: number = 0;
    offeredJobsLength: number = 0;
    acceptedJobsLength: number = 0;
    completedJobsLength: number = 0;

    // Collapse variables
    public isOfferedCollapse: boolean = false;
    public isAcceptedCollapse: boolean = false;
    public isAppliedCollapse: boolean = false;
    public isCompletedCollapse: boolean = false;

    // Provider Dashboard cache
    public providerDashboardState: ProviderDashboardStateService;

    // Provider Profile cache
    public providerProfileCached: ProviderProfileService;

    // Search cache
    public searchResults: SearchResultsService;

    // Application Cancelation
    canceledApplication: CanceledApplication = {};

    constructor(authService: AuthService,
                providerDashboardState: ProviderDashboardStateService,
                providerProfile: ProviderProfileService,
                @Inject('API_URL2') apiUrl: string,
                searchResults: SearchResultsService,
                private router: Router,
                private pagerService: PaginationService) {

        this.url = apiUrl + 'getproviderjobs';
        this.url2 = apiUrl + 'cancelapplication';
        this.url3 = apiUrl + 'getproviderprofile';
        this.auth = authService;    // inserts JWT into the HTTP requests, it's basically a wrapper'
        this.searchResults = searchResults;
        this.providerDashboardState = providerDashboardState;
        this.providerProfileCached = providerProfile;

        // GET request to the API to retrieve job details
        this.auth.get(this.url)
            .subscribe(result => {
                this.providerJobs = result.json() as ProviderJobs[];

                console.log(this.providerJobs);

                // Get Job counts per state
                this.getJobCounts();

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

    ngOnInit() {

        // Populate Dropdown states from the Singleton
        this.isOfferedCollapse = this.providerDashboardState.isOfferedCollapse;
        this.isAcceptedCollapse = this.providerDashboardState.isAcceptedCollapse;
        this.isAppliedCollapse = this.providerDashboardState.isAppliedCollapse;
        this.isCompletedCollapse = this.providerDashboardState.isCompletedCollapse;
        
        // Provider Profile GET request to populate cache Singleton
        this.auth.get(this.url3)
            .subscribe(result => {
                this.providerProfileCached.Profile = result.json() as ProviderProfile;

                //console.log("Provider Profile: " + this.providerProfileCached.Profile.contactTelephone1);
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

    // Dashboard state
    saveDashboardState() {
        this.providerDashboardState.isOfferedCollapse = this.isOfferedCollapse;
        this.providerDashboardState.isAcceptedCollapse = this.isAcceptedCollapse;
        this.providerDashboardState.isAppliedCollapse = this.isAppliedCollapse;
        this.providerDashboardState.isCompletedCollapse = this.isCompletedCollapse;
    }

    offeredCollapse() {
        this.isOfferedCollapse = !this.isOfferedCollapse;

        // Saving Dashboard state (interface gets created before data arrive)
        this.saveDashboardState();
    }

    acceptedCollapse() {
        this.isAcceptedCollapse = !this.isAcceptedCollapse;

        // Saving Dashboard state (interface gets created before data arrive)
        this.saveDashboardState();
    }

    appliedCollapse() {
        this.isAppliedCollapse = !this.isAppliedCollapse;

        // Saving Dashboard state (interface gets created before data arrive)
        this.saveDashboardState();
    }

    completedCollapse() {
        this.isCompletedCollapse = !this.isCompletedCollapse;

        // Saving Dashboard state (interface gets created before data arrive)
        this.saveDashboardState();
    }

    gotosearch() {
        this.router.navigate(["searchjob"]);
    }

    refresh(): void {
        console.log("Refreshing");
        this.router.navigate(["providerdashboard"]);
                
        // This exists the app and loads it again
        //window.location.reload();
    }

    getJobCounts() {
        //this.onHoldJobsLength = this.providerJobs.filter(j => j.jobState == 0).length;
        this.appliedJobsLength = this.providerJobs.filter(j => j.jobState == 10).length;
        this.offeredJobsLength = this.providerJobs.filter(j => j.jobState == 20).length;
        //this.expiredJobsLength = this.providerJobs.filter(j => j.jobState == 30).length;
        this.acceptedJobsLength = this.providerJobs.filter(j => j.jobState == 40).length;
        this.completedJobsLength = this.providerJobs.filter(j => j.jobState == 50).length;
    }

    getOfferedJobs(): ProviderJobs[] {
        this.offeredJobs = this.providerJobs.filter(j => j.jobState == 20);
        return this.offeredJobs
    }

    getAcceptedJobs(): ProviderJobs[] {
        this.acceptedJobs = this.providerJobs.filter(j => j.jobState == 40);
        return this.acceptedJobs
    }

    getAppliedJobs(): ProviderJobs[] {
        //this.appliedJobs = this.providerJobs.filter((j) => {
        //    if (j.jobState == 10 || j.jobState == 20) {
        //        return true
        //    }
        //})

        this.appliedJobs = this.providerJobs.filter(j => j.jobState == 10);
        return this.appliedJobs
    }
    
    getCompletedJobs(): ProviderJobs[] {
        this.completedJobs = this.providerJobs.filter(j => j.jobState == 50);
        return this.completedJobs
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

    // Navigate to the job details page
    getJobDetails(id: number) {
        event.stopPropagation();
        console.log("Get Job Details clicked");

        this.router.navigate(["providerjobdetails", id]);
        //this.router.navigateByUrl('/jobdetails');
    }

    // Cancel preveously made application
    cancelApplication(jobId: number) {
        // POST to remove the record from the Applications table
        event.stopPropagation();
        console.log("Application cancelation clicked");

        // Remove Canceled object from the array
        this.markJobAsCanceled(jobId);
        this.getJobCounts();

        this.canceledApplication.jobId = jobId;

        let body = JSON.stringify(this.canceledApplication);
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
    
    markJobAsCanceled(id) {
        // Find a job with specified ID
        let jobToUpdate = this.providerJobs.find(x => x.id === id);

        // Find the index in the object array of the job
        let index = this.providerJobs.indexOf(jobToUpdate);

        // Remove object from the array
        this.providerJobs.splice(index, 1);

        // Remove from the cache
        if (JSON.stringify(this.searchResults) != '{}') {
            
            // Find a job with specified ID
            let jobToUpdate = this.searchResults.Results.find(x => x.id === id);
            //console.log(JSON.stringify(jobToUpdate));

            // Find the index in the object array of the job
            let index = this.searchResults.Results.indexOf(jobToUpdate);
            //console.log(JSON.stringify(index));

            // Set Apply flag
            jobToUpdate.applied = null;
            //console.log(JSON.stringify(jobToUpdate));

            // Replace object with new one
            this.searchResults.Results[index] = jobToUpdate;
        }
        
    }

    // Pagination
    setPage(page: number) {
        if (page < 1 || page > this.pager.totalPages) {
            return;
        }

        // get pager object from the service class
        this.pager = this.pagerService.getPager(this.providerJobs.length, page);

        // get a subset of jobs from the array to present on the page
        this.providerJobsPaged = this.providerJobs.slice(this.pager.startIndex, this.pager.endIndex + 1);
    }
}

interface ProviderJobs {
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
    jobDescription?: string
};

interface CanceledApplication {
    jobId?: number
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

