import { Component, Inject, Input } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../../services/auth.service';
import { PaginationService } from '../../services/pagination.service';

@Component({
    selector: 'applications',
    templateUrl: './applications.component.html',
    styleUrls: ['./applications.component.css']
})

export class ApplicationsComponent {
    
    public url: string;
    public auth: any;
    public ob: any;
    private status = -1;    // Disables creation notification messages

    pager: any = {};                // pager object
    providersPaged: Provider[];     // paged array of Providers
    providers: Provider[];          // API returns an array of objects
    job_id: number;                 // ID of the job passed from the clientdashboard component via url

    //@Input() datasource;
    selectedImage;
    //images;

    constructor(authService: AuthService,
                @Inject('API_URL2') apiUrl: string,
                private router: Router,
                private route: ActivatedRoute,
                private pagerService: PaginationService) {

        this.route.params.subscribe((params) => { this.job_id = params["id"]; }); // Receiving input url parameter

        this.url = apiUrl + 'getapplications/' + this.job_id; 
        console.log(apiUrl);

        this.auth = authService;    // inserts JWT into the HTTP requests, it's basically a wrapper'

        // GET request to the API to retrieve job details
        this.auth.get(this.url)
            .subscribe(result => {
                this.providers = result.json() as Provider[];
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
    
    // Navigate to the Providers details page
    getProviderDetails(providerid: number) {
        // Pass two parameters to the URL
        this.router.navigate(["providerdetails", providerid, this.job_id]);
    }

    // Pagination
    setPage(page: number) {
        if (page < 1 || page > this.pager.totalPages) {
            return;
        }

        // get pager object from the service class
        this.pager = this.pagerService.getPager(this.providers.length, page);

        // get a subset of jobs from the array to present on the page
        this.providersPaged = this.providers.slice(this.pager.startIndex, this.pager.endIndex + 1);
    }
}

interface Provider {
    id: number,
    name: string,
    //surname: string,
    //username: string,
    //addressId: string,
    //haveAcar: boolean,
    //isClient: boolean,
    //isProvider: boolean,
    //lastLoginTime: Date,

    //contactEmail?: string,
    //contactTelephone1?: string,
    //contactTelephone2?: string,
    profileImageUrl?: string,
    //haveAcar?: boolean,
    //locationLat?: number,
    //locationLng?: number,
    rating?: number

    //country?: string,
    //city?: string,
    //adressLine1?: string,
    //adressLine2?: string,
    //postCode?: string,

    //skills?: string[],
    //skillsFullList?: string[]     // GET request to GetProviderProfile returns full skil list by default. This is done for edit, but as a side effect gets to this component as well. Rethinking is needed here
};
