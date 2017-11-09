import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../../services/auth.service';
import { SearchParametersService, SearchStateService, SearchResultsService } from '../../services/search.service';
import { ProviderProfileService } from '../../services/providerprofile.service';

@Component({
    selector: 'searchjob',
    templateUrl: './searchjob.component.html',
    styleUrls: ['./searchjob.component.css']
})
export class SearchJobComponent implements OnInit {

    rForm: FormGroup;
    post: any;                     // A property for our submitted form

    //description: string = '';
    name: string = '';
    jobtitle: string = '';
    rateperhour: number = 0;
    rate_rb_value: number;
    duration_rb_value: number;
    
    //titleAlert: string = 'This field is required';
    jobtitleAlert: string = 'You must specify a Title thats between 5 and 50 characters'

    // File upload variables
    private isUploadBtn: boolean = true; 
    uploading: boolean = true; 
    imageCountValidation: boolean = true;
    myFile: File; /* property of File type */
    selectedImage;

    public url: string;
    public url2: string;
    public url3: string;
    public auth: any;
    public ob: any;
    private status = -1;            // Disables Search notification messages
    private applicationstatus = -1; // Disables Application notification messages

    jobSearch: JobSearch = {};
    markedJob: JobSearchResults;                    // A job selected marker 
    visible: string = "map";                        // Controlls visibility of the Map or List
    //jobSearchResults: JobSearchResults[]; // API returns an array of objects

    // Search cache
    public searchState: SearchStateService;             // 1 - visible, 0 - invisible
    public searchParameters: SearchParametersService;   // 1 - visible, 0 - invisible
    public searchResults: SearchResultsService;         // Search results

    // Provider Profile cache (injected Singleton populated in the ProviderDashboard)
    public providerProfileCached: ProviderProfileService;
    public phoneVerified: boolean = false;

    // API call to get a list of possible skills
    skill: string;
    selectedSkill: string = "All";
    enteredKeywords: string;
    allSkills: Skills;
    public url4: string;

    // Configure calendar
    durations: Durations = [
        { id: 1, name: 'today' },
        { id: 2, name: 'for the next 2 days' },
        { id: 3, name: 'for the next 3 days' },
        { id: 4, name: 'for the next 4 days' },
        { id: 5, name: 'for the next 5 days' },
        { id: 6, name: 'for the next 6 days' },
        { id: 7, name: 'for the next 7 days' }
    ];
    selectedDuration: number = 1;
    
    // Map related variables
    zoom: number = 10;
    centerLocationLat: number = 51.497325; //Science museum coordinates
    centerLocationLng: number = -0.173927;
    locationLat: number = 51.497325; //Science museum coordinates
    locationLng: number = -0.173927;
    radius: number = 2000;
    defaultUI: boolean = false;
    draggable: boolean = false
    areaSelectable: boolean = false;
    showMap: boolean = true;

    // Job State
    create_job_rb_value: number;
    jobState: number = 10; // 10 - Create and Pubish, 0 - Create only

    // Validator patterns
    pureEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    regexValidators = {
        phone: '[\+][0-9() ]{7,}$',
        email: this.pureEmail,
    };
    
    constructor(private fb: FormBuilder,
                searchParameters: SearchParametersService,
                searchState: SearchStateService,
                searchResults: SearchResultsService,
                providerProfile: ProviderProfileService,
                authService: AuthService,
                @Inject('API_URL2') apiUrl: string,
                private router: Router,
                private http: Http) {

        this.url = apiUrl + 'searchjob';
        this.url2 = apiUrl + 'createapplication';
        this.url3 = apiUrl + 'getproviderprofile';
        this.url4 = apiUrl + 'getskills';               // GET all possible skills
        this.auth = authService;                        // inserts JWT

        this.searchState = searchState;
        this.searchParameters = searchParameters;
        this.searchResults = searchResults;

        // Reads Provider Profile cache
        this.providerProfileCached = providerProfile;
        if (JSON.stringify(this.providerProfileCached) != '{}') {
            console.log("Phone verification: " + this.providerProfileCached.Profile.contactTelephone1
                + " - " + this.providerProfileCached.Profile.telephone1Verified);
        }        
                
        // Setup fields in the FormBuilder
        this.rForm = fb.group({
            'keywords': [null, Validators.compose([Validators.maxLength(30)])],
            
            //'RateFixed': [ null, Validators.required],            
            //'RatePerHour': [{ value: null, disabled: true }, Validators.required],
            
            //'DurationDays': [null, Validators.required],
            //'DurationHours': [{ value: null, disabled: true }, Validators.required],
            
            'skill': ['', Validators.required],
            'duration': ['', Validators.required],
            'validate': ''
        });

        // GET request to the API to retrieve all skills
        this.auth.get(this.url4)
            .subscribe(result => {
                this.allSkills = result.json() as Skills;

                // Adding All to the array with unshift (this will be the default value)
                this.allSkills.skills.unshift('All');

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
        // Populate Search form from the Singleton if it's not empty
        if (JSON.stringify(this.searchParameters) != '{}') {
            this.selectedSkill = this.searchParameters.Skill;
            this.selectedDuration = this.searchParameters.Duration;
            this.enteredKeywords = this.searchParameters.Keywords;
            this.locationLat = this.searchParameters.LocationLat;
            this.locationLng = this.searchParameters.LocationLng;
            //this.radius = this.searchParameters.Radius;
            this.zoom = this.searchParameters.Zoom;
            //console.log("Initial Search Cache: " + JSON.stringify(this.searchParameters));

            // Center the map after reload
            this.centerLocationLat = this.searchParameters.LocationLat;
            this.centerLocationLng = this.searchParameters.LocationLng;
            console.log("Center of the map: " + this.centerLocationLat + ", " + this.centerLocationLng);
        }

        // Check if the Provider profile is populated and if not then populate
        if (JSON.stringify(this.providerProfileCached) == '{}') {
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
    }

    // POST the search form to WEBAPI
    searchJob(formdata) {

        // Center the map after reload
        //if (JSON.stringify(this.searchParameters) != '{}') {
        //    this.selectedSkill = this.searchParameters.Skill;
        //    this.selectedDuration = this.searchParameters.Duration;
        //    this.enteredKeywords = this.searchParameters.Keywords;
        //    this.locationLat = this.searchParameters.LocationLat;
        //    this.locationLng = this.searchParameters.LocationLng;
        //    //this.radius = this.searchParameters.Radius;
        //    this.zoom = this.searchParameters.Zoom;
        //    //console.log("Initial Search Cache: " + JSON.stringify(this.searchParameters));

        //    // Center the map after reload
        //    this.centerLocationLat = this.searchParameters.LocationLat;
        //    this.centerLocationLng = this.searchParameters.LocationLng;
        //    console.log("Center of the map: " + this.centerLocationLat + ", " + this.centerLocationLng);
        //}

        this.searchResults.Results = null;
        //this.refreshSearch2();
        this.showMap = false;
        
        
        // Prepare the JSON body message
        this.jobSearch.Keywords = formdata.keywords;
        this.jobSearch.LocationLat = this.locationLat;
        this.jobSearch.LocationLng = this.locationLng;
        this.jobSearch.Zoom = this.zoom;
        this.jobSearch.Skill = this.selectedSkill;
        this.jobSearch.Duration = this.selectedDuration;

        // Populate search cache
        this.searchParameters.Keywords = formdata.keywords;
        this.searchParameters.Skill = this.selectedSkill;
        this.searchParameters.LocationLat = this.locationLat;
        this.searchParameters.LocationLng = this.locationLng;
        this.searchParameters.Zoom = this.zoom;
        this.searchParameters.Duration = this.selectedDuration;
        console.log("Search Cache: " + JSON.stringify(this.searchParameters));

        // Clear selected marker and results under the map
        this.markedJob = null;
        console.log("Marked Job: " + this.markedJob);
        
        let body = JSON.stringify(this.jobSearch);
        console.log("Body to send" + body);

        // POST it to the server
        return this.ob = this.auth.post(this.url, body) //JSON.stringify({ Name: name })
            .subscribe(
                result => {
                    // This variable will be passed to a "searchjobresults" component
                    //this.jobSearchResults = result.json() as JobSearchResults[]; 
                    this.searchResults.Results = result.json() as JobSearchResults[]; 

                    console.log("Cache is populated with results" + this.searchResults.Results);

                    this.status = 1;    // Shows Success message
                    this.applicationstatus = -1;
                    this.showMap = true;

                    this.centerLocationLat = this.searchParameters.LocationLat;
                    this.centerLocationLng = this.searchParameters.LocationLng;
                
                    //this.searchState.SearchVisible = 0;         // Hide Search
                    //this.searchState.SearchResultsVisible = 1;  // Show Results
                },
                err => {
                    console.log('ERROR:');
                    console.log(err);
                    this.status = 0;    // Shows Failure message
                }
            );
        //.toPromise()
        //.then(res => res.json());
        //.then(response => { return response.json() });
        //.catch(this.handleError)
    }

    // New search button
    refreshSearch() {

        this.selectedSkill = this.searchParameters.Skill;
        this.selectedDuration = this.searchParameters.Duration;
        this.enteredKeywords = this.searchParameters.Keywords;
        this.locationLat = this.searchParameters.LocationLat;
        this.locationLng = this.searchParameters.LocationLng;
        //this.radius = this.searchParameters.Radius;
        this.zoom = this.searchParameters.Zoom;
        //console.log("Initial Search Cache: " + JSON.stringify(this.searchParameters));

        // Center the map after reload
        this.centerLocationLat = this.searchParameters.LocationLat;
        this.centerLocationLng = this.searchParameters.LocationLng;
        console.log("Center of the map: " + this.centerLocationLat + ", " + this.centerLocationLng);

        this.showMap = false;
        let temp = this.searchResults.Results;
        this.searchResults.Results = null;
        
        //this.showMap = true;
        this.searchResults.Results = temp;
        //
    }

    refreshSearch2() {
        this.showMap = false;
        let temp = this.searchResults.Results;
        this.searchResults.Results = null;

        //this.showMap = true;
        this.searchResults.Results = temp;
    }

    // Function is called when the mouse is over the Submit button div
    mouseEnter() {
        if (!this.rForm.valid) {
            //console.log('form cannot be submitted');
            this.validateAllFormFields(this.rForm);
        }
    }

    // Iterate form fields and marks them as touched to show validate messages
    validateAllFormFields(formGroup: FormGroup) {         
        Object.keys(formGroup.controls).forEach(field => {  
            const control = formGroup.get(field);
            
            if (control instanceof FormControl) {         
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof FormGroup) {        
                this.validateAllFormFields(control);           
            }
        });
    }

    // Skill selection
    onChangeSkill(selectedSkill) {
        console.log(selectedSkill);
        this.selectedSkill = selectedSkill;
    }

    // Duration selection
    onChangeDateRange(selectedDateRange) {
        console.log(selectedDateRange);
        this.selectedDuration = selectedDateRange;
    }

    // Click on map to create a marker
    mapClicked($event: any) {
        this.locationLat = $event.coords.lat;
        this.locationLng = $event.coords.lng;

        console.log("Lat: " + this.locationLat + ", Lon: " + this.locationLng);
    }    

    mapCenterChanged($event: any) {
        this.locationLat = $event.lat;
        this.locationLng = $event.lng;

        //console.log("Circle center coordinates: " + $event.coords.lat + ", " + $event.coords.lng);
        console.log("Map Center coords: " + JSON.stringify($event));
    }

    mapZoomChanged($event: any) {
        console.log("New Zoom: " + JSON.stringify($event));
        this.zoom = Number($event);
    }

    // not in use 
    mapCircleMoved($event: any) {
        this.locationLat = $event.lat;
        this.locationLng = $event.lng;

        //console.log("Circle center coordinates: " + $event.coords.lat + ", " + $event.coords.lng);
        console.log("Circle Center coords: " + JSON.stringify($event));
    }

    // not in use
    mapCircleRadius($event: any) {
        console.log("Circle radius: " + JSON.stringify($event));
        this.radius = Number($event);

        // Add meters to the Latitude
        let new_latitude = this.locationLat + ((Number($event) / 6378000) * (180 / 3.14));
        console.log("New Lat: " + new_latitude);

        // Add meters to the Longitude
        let new_longitude = this.locationLng + ((Number($event) / 6378000) * (180 / 3.14) / Math.cos(this.locationLat * 3.14 / 180));
        console.log("New Lng: " + new_longitude);
        //this.locationLng = this.locationLng + ($event * 0.0000449);
    }
    
    // Controls Rate radio buttons
    onRateSelectionChange() {
        this.rate_rb_value = this.rForm.get('rate_rb').value;
        console.log(this.rate_rb_value);

        if (this.rate_rb_value == 0) {
            this.rForm.controls['rateFixed'].enable();
            this.rForm.controls['ratePerHour'].disable();

            this.rForm.patchValue({ ratePerHour: null });
        }
        if (this.rate_rb_value == 1) {
            this.rForm.controls['ratePerHour'].enable();
            this.rForm.controls['rateFixed'].disable();

            this.rForm.patchValue({ rateFixed: null });
        }
    }

    // Controls Duration radio buttons
    onDurationSelectionChange() {
        this.duration_rb_value = this.rForm.get('duration_rb').value;
        console.log(this.duration_rb_value);

        if (this.duration_rb_value == 0) {
            this.rForm.controls['durationDays'].enable();
            this.rForm.controls['durationHours'].disable();

            this.rForm.patchValue({ durationHours: null });
        }
        if (this.duration_rb_value == 1) {
            this.rForm.controls['durationHours'].enable();
            this.rForm.controls['durationDays'].disable();

            this.rForm.patchValue({ durationDays: null });
        }
    }



    // -------------------- imported from searchjobresults component

    // When marker on the map is clicked
    clickedMarker(job: JobSearchResults) {
        console.log("Marker is clicked, title:" + job.jobTitle);
        console.log("Cached objects: " + this.searchResults.Results);
        this.markedJob = job;
        this.applicationstatus = -1;

        this.isPhoneVerified();
        console.log(this.providerProfileCached.Profile.contactTelephone1);
        console.log(this.providerProfileCached.Profile.telephone1Verified);
    }

    isPhoneVerified() {
        if (this.providerProfileCached.Profile.contactTelephone1 == this.providerProfileCached.Profile.telephone1Verified) {
            this.phoneVerified = true;
            console.log("Is Phone Verified: " + this.phoneVerified);
        }
        else {
            this.phoneVerified = false;
        }
    }

    navigateToTheProfile() {
        let r = '/providerprofile';
        this.router.navigate([r]);
    }

    // POST the application to WEBAPI
    applyToJob(jobId: number) {
        // Prepare the JSON body message

        let body = JSON.stringify({ JobId: jobId })
        console.log("Body to send" + body);

        // POST it to the server
        return this.ob = this.auth.post(this.url2, body) //JSON.stringify({ Name: name })
            .subscribe(
            result => {
                console.log(result);
                this.applicationstatus = 1;    // Shows Success message

                // Update job in the cache 
                this.markJobAsApplied(jobId);
            },
            err => {
                console.log('ERROR:');
                console.log(err);
                this.applicationstatus = 0;    // Shows Failure message
            }
            );
    }

    markJobAsApplied(id) {
        // Find a job with specified ID
        let jobToUpdate = this.searchResults.Results.find(x => x.id === id);
        //console.log(JSON.stringify(jobToUpdate));

        // Find the index in the object array of the job
        let index = this.searchResults.Results.indexOf(jobToUpdate);
        //console.log(JSON.stringify(index));

        // Set Apply flag
        jobToUpdate.applied = 1;
        //console.log(JSON.stringify(jobToUpdate));

        // Replace object with new one
        this.searchResults.Results[index] = jobToUpdate;
    }

    // Zoom into modal window selected image
    setSelectedImage(image) {
        this.selectedImage = image;
    }

    contentVisibility(type: string) {
        if (type == "map") {
            this.searchState.SearchTypeVisible = "map";
        }
        if (type == "list") {
            this.searchState.SearchTypeVisible = "list";
        }
        return this.searchState.SearchTypeVisible
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
            return 'On Hold';
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

interface JobSearch {
    Keywords?: string;
    //RatePerHour?: number;
    //RateFixed?: number;
    //DurationDays?: number;
    //DurationHours?: number;
    LocationLat?: number;
    LocationLng?: number;
    //Radius?: number;
    Zoom?: number;
    Skill?: string;
    Duration?: number
}

interface JobSearchResults {
    id?: number;
    clientId?: number;
    jobTitle?: string;
    ratePerHour?: number;
    rateFixed?: number;
    durationDays?: number;
    durationHours?: number;
    jobState?: number;
    plannedStartDate?: string;
    plannedFinishDate?: string;
    locationLat?: number;
    locationLng?: number;
    skill?: string;
    jobDescription?: string
    applied?: number;
    images?: string[];
}

interface Skills {
    skills?: string[]
}

interface Durations {
    id?: number;
    name?: string
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
