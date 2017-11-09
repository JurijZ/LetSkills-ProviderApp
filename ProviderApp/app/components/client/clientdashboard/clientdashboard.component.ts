import { Component, Inject, Input, HostListener  } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router, NavigationEnd  } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../../services/auth.service';
import { PaginationService } from '../../services/pagination.service';
import { ClientDashboardStateService } from '../../services/clientdashboard.service';

@Component({
    selector: 'clientdashboard',
    templateUrl: './clientdashboard.component.html',
    styleUrls: ['./clientdashboard.component.css']
})

export class ClientDashboardComponent {

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

    provider: OfferProvider = {};    // provider of the Offer

    pager: any = {}; // pager object
    clientBalance: ClientBalance = {};     // API call to get clients balance numbers
    availableAmmount: number = 0;
    blockedAmmount: number = 0;

    clientJobsPaged: ClientJobs[];  // paged array of provider Jobs items
    clientJobs: ClientJobs[];       // API returns an array of objects
    
    onHoldJobs: ClientJobs[];
    publishedJobs: ClientJobs[];
    offeredJobs: ClientJobs[];
    expiredJobs: ClientJobs[];
    acceptedJobs: ClientJobs[];
    inProgressJobs: ClientJobs[];
    completedJobs: ClientJobs[];    

    onHoldJobsLength: number = 0;
    publishedJobsLength: number = 0;
    expiredJobsLength: number = 0;
    offeredJobsLength: number = 0;
    acceptedJobsLength: number = 0;
    inProgressJobsLength: number = 0;
    completedJobsLength: number = 0;

    // Collapse variables
    isOnHoldCollapse: boolean = false;
    isPublishedCollapse: boolean = false;
    isExpiredCollapse: boolean = false;
    isInProgpressCollapse: boolean = false;
    isCompletedCollapse: boolean = false;   

    // Client Dashboard cache
    public clientDashboardState: ClientDashboardStateService;

    constructor(authService: AuthService,
                clientDashboardState: ClientDashboardStateService,
                @Inject('API_URL2') apiUrl: string,
                private router: Router,
                private pagerService: PaginationService) {

        this.url = apiUrl + 'GetClientJobs';
        this.url2 = apiUrl + 'GetClientBalance';
        this.url3 = apiUrl + 'GetOfferProvider';
        this.auth = authService;    // inserts JWT into the HTTP requests, it's basically a wrapper'
        this.clientDashboardState = clientDashboardState;

        // GET request to the API to retrieve job details
        this.auth.get(this.url)
            .subscribe(result => {
                this.clientJobs = result.json() as ClientJobs[];

                console.log(this.clientJobs);

                // Get Job counts per state
                this.getJobCounts();

                this.getOnHoldJobs();
                this.getPublishedJobs();
                this.getExpiredJobs();
                this.getInProgressJobs();                
                this.getCompletedJobs();
                                
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

        // GET request to the API to retrieve client Wallet
        this.auth.get(this.url2)
            .subscribe(result => {
                this.clientBalance = result.json() as ClientBalance;

                this.availableAmmount = this.clientBalance.availableAmmount
                
                console.log("Available Ammount" + this.clientBalance.availableAmmount);
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
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
        };

        this.router.events.subscribe((evt) => {
            if (evt instanceof NavigationEnd) {
                this.router.navigated = false;
                window.scrollTo(0, 0);
            }
        });

        // Populate Dropdown states from the Singleton
        this.isOnHoldCollapse = this.clientDashboardState.IsOnHoldCollapse;
        this.isPublishedCollapse = this.clientDashboardState.IsPublishedCollapse;
        this.isExpiredCollapse = this.clientDashboardState.IsExpiredCollapse;
        this.isInProgpressCollapse = this.clientDashboardState.IsInProgpressCollapse;
        this.isCompletedCollapse = this.clientDashboardState.IsCompletedCollapse;
    }

    refresh(): void {

        console.log("Refreshing");
        this.router.navigate(["clientdashboard"]);
        // This exists the app and loads it again
        //window.location.reload();
    }
    

    // Dashboard state
    saveDashboardState() {
        this.clientDashboardState.IsOnHoldCollapse = this.isOnHoldCollapse;
        this.clientDashboardState.IsPublishedCollapse = this.isPublishedCollapse;
        this.clientDashboardState.IsExpiredCollapse = this.isExpiredCollapse;
        this.clientDashboardState.IsInProgpressCollapse = this.isInProgpressCollapse;
        this.clientDashboardState.IsCompletedCollapse = this.isCompletedCollapse;
    }

    completedCollapse() {
        this.isCompletedCollapse = !this.isCompletedCollapse;

        // Saving Dashboard state (interface gets created before data arrive)
        this.saveDashboardState();
    }

    expiredCollapse() {
        this.isExpiredCollapse = !this.isExpiredCollapse;

        // Saving Dashboard state (interface gets created before data arrive)
        this.saveDashboardState();
    }

    publishedCollapse() {
        this.isPublishedCollapse = !this.isPublishedCollapse;

        // Saving Dashboard state (interface gets created before data arrive)
        this.saveDashboardState();
    }

    onHoldCollapse() {
        this.isOnHoldCollapse = !this.isOnHoldCollapse;

        // Saving Dashboard state (interface gets created before data arrive)
        this.saveDashboardState();
    }

    inProgpressCollapse() {
        this.isInProgpressCollapse = !this.isInProgpressCollapse;

        // Saving Dashboard state (interface gets created before data arrive)
        this.saveDashboardState();
    }

    openInProgress() {
        this.isInProgpressCollapse = true;

        // Saving Dashboard state (interface gets created before data arrive)
        this.saveDashboardState();
    }

    getJobCounts() {
        this.onHoldJobsLength = this.clientJobs.filter(j => j.jobState == 0).length;
        this.publishedJobsLength = this.clientJobs.filter(j => j.jobState == 10).length;
        this.expiredJobsLength = this.clientJobs.filter(j => j.jobState == 30).length;
        this.completedJobsLength = this.clientJobs.filter(j => j.jobState == 50).length;        
        this.offeredJobsLength = this.clientJobs.filter(j => j.jobState == 20).length;
        this.acceptedJobsLength = this.clientJobs.filter(j => j.jobState == 40).length;

        this.inProgressJobsLength = this.offeredJobsLength + this.acceptedJobsLength
    }

    // Job lists
    getOnHoldJobs() {
        event.stopPropagation();
        this.onHoldJobs = this.clientJobs.filter(j => j.jobState == 0);
        //return this.onHoldJobs
    }

    getPublishedJobs() {
        event.stopPropagation();
        this.publishedJobs = this.clientJobs.filter(j => j.jobState == 10);
        //return this.publishedJobs
    }
    
    getExpiredJobs() {
        event.stopPropagation();
        this.expiredJobs = this.clientJobs.filter(j => j.jobState == 30);
        //return this.expiredJobs
    }

    getInProgressJobs() {
        event.stopPropagation();
        this.offeredJobs = this.clientJobs.filter(j => j.jobState == 20);
        this.acceptedJobs = this.clientJobs.filter(j => j.jobState == 40);
        
        this.inProgressJobs = this.offeredJobs.concat(this.acceptedJobs);
    }
    
    getCompletedJobs() {
        event.stopPropagation();
        this.completedJobs = this.clientJobs.filter(j => j.jobState == 50);
        //return this.completedJobs
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

    // Navigate to the New Feedback page
    goToFeedbacks() {
        event.stopPropagation();
        // Pass two parameters to the URL
        this.router.navigate(["clientfeedbacks"]);
    }

    // Navigate to the feedback page
    leaveFeedback() {
        this.router.navigate(["clientfeedbacks"]);
    }

    // Navigate to the job details page
    getJobDetails(id: number) {
        event.stopPropagation();
        this.router.navigate(["jobdetails", id]);
    }

    // Navigate to the applications for the selected job
    getApplications(id: number) {
        event.stopPropagation();
        this.router.navigate(["applications", id]);
    }

    // Navigate to the Providers details page
    getProviderDetails(jobid: number) {
        event.stopPropagation();
        // Find Provider ID based on the Offers table and redirect to his profile
        this.auth.get(this.url3 + "/" + jobid)
            .subscribe(result => {
                this.provider = result.json() as OfferProvider;

                console.log("Provider ID: " + this.provider);
                this.router.navigate(["offerproviderdetails", this.provider.providerId]);
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

    // Navigate to the applications for the selected job
    goToClientWallet() {
        this.router.navigate(["clientwallet"]);
    }

    // Pagination
    setPage(page: number) {
        if (page < 1 || page > this.pager.totalPages) {
            return;
        }

        // get pager object from the service class
        this.pager = this.pagerService.getPager(this.clientJobs.length, page);

        // get a subset of jobs from the array to present on the page
        this.clientJobsPaged = this.clientJobs.slice(this.pager.startIndex, this.pager.endIndex + 1);
    }
}

interface ClientJobs {
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
    jobDescription?: string,
    numberOfApplications?: number
};

interface ClientBalance {
    availableAmmount?: number,
    blockedAmmount?: number
}

interface OfferProvider {
    providerId?: number
}