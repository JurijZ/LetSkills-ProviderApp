import { Component, Inject, Input } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../../services/auth.service';
import { PaginationService } from '../../services/pagination.service';

@Component({
    selector: 'myjobs',
    templateUrl: './myjobs.component.html',
    styleUrls: ['./myjobs.component.css']
})

export class MyJobsComponent {
    
    public url: string;
    public auth: any;
    public ob: any;
    private status = -1;    // Disables creation notification messages

    pager: any = {}; // pager object
    myJobsPaged: MyJobs[]; // paged array of My Jobs items

    myJobs: MyJobs[]; // API returns an array of objects

    //@Input() datasource;
    selectedImage;
    //images;

    constructor(authService: AuthService, @Inject('API_URL2') apiUrl: string, private router: Router, private pagerService: PaginationService) {
        this.url = apiUrl + 'getclientjobs'; 
        this.auth = authService;    // inserts JWT into the HTTP requests, it's basically a wrapper'

        // GET request to the API to retrieve job details
        this.auth.get(this.url)
            .subscribe(result => {
                this.myJobs = result.json() as MyJobs[];
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

    // Navigate to the job details page
    getJobDetails(id: number) {
        this.router.navigate(["jobdetails", id]); 
        //this.router.navigateByUrl('/jobdetails');
    }

    // Pagination
    setPage(page: number) {
        if (page < 1 || page > this.pager.totalPages) {
            return;
        }

        // get pager object from the service class
        this.pager = this.pagerService.getPager(this.myJobs.length, page);

        // get a subset of jobs from the array to present on the page
        this.myJobsPaged = this.myJobs.slice(this.pager.startIndex, this.pager.endIndex + 1);
    }
}

interface MyJobs {
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
    images?: string[];
};
