import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../../services/auth.service';

import { IMyDpOptions, IMyDateModel, IMyDate } from 'mydatepicker';


@Component({
    selector: 'editjob',
    templateUrl: './editjob.component.html',
    styleUrls: ['./editjob.component.css']
})

export class EditJobComponent {
    
    public url: string;
    public url3: string;
    public url5: string;
    public auth: any;
    public ob: any;
    private status = -1;    // Disables creation notification messages

    job_id: number; // ID of the job passed from the list of jobs component via url
    jobDetails: JobDetails; // API returns a single object

    name: string = '';
    jobtitle: string = '';
    rateperhour: number = 0;
    rate_rb_value: number;
    duration_rb_value: number;

    //titleAlert: string = 'This field is required';
    jobtitleAlert: string = 'You must specify a Title thats between 5 and 50 characters'

    // File upload variables
    public url2: string;
    private isUploadBtn: boolean = true;
    uploading: boolean = true;
    imageCountValidation: boolean = true;
    myFile: File; /* property of File type */
    selectedImage;

    // Form related variables
    rForm: FormGroup;
    post: any;                     // A property for our submitted form
    newjob: NewJob = {};

    // Client Limits
    clientLimits: ClientLimits;
    alowedToPublish: boolean;
    maxJobsAllowed: number;

    // Configure calendar
    public myDatePickerOptions: IMyDpOptions = {
        // other options...
        dateFormat: 'dd mmm yyyy',
        editableDateField: false,
        openSelectorOnInputClick: true
    };
    private startDate: IMyDate = { year: 0, month: 0, day: 0 }; // To populate calendars Start Date field
    private finishDate: IMyDate = { year: 0, month: 0, day: 0 }; // To populate calendars Finish Date field
    plannedStartDate_CSCompatible: string;
    plannedFinishDate_CSCompatible: string; 

    // API call to get a list of possible skills
    skill: string;
    selectedSkill: string;
    allSkills: Skills;
    public url4: string;

    // map related variables
    zoom: number = 15;
    centerLocationLat: number = 51.497325; //Science museum coordinates
    centerLocationLng: number = -0.173927;
    locationLat: number = 51.497325; //Science museum coordinates
    locationLng: number = -0.173927;
    defaultUI: boolean = false;
    draggable: boolean = false

    // Job state variables
    jobStateCurrent: string;
    jobStates = ['Publish', 'Put on Hold']; // Drop down menu to change current Job state

    // Validator patterns
    pureEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    regexValidators = {
        phone: '[\+][0-9() ]{7,}$',
        email: this.pureEmail,
    };

    constructor(private fb: FormBuilder,
                authService: AuthService,
                @Inject('API_URL2') apiUrl: string,
                private router: Router,
                private route: ActivatedRoute,
                private http: Http) {

        this.route.params.subscribe((params) => { this.job_id = params["id"]; }); // Receiving input url parameter
 
        this.url = apiUrl + 'getjobdetails/' + this.job_id;     // GET selected job details
        this.url2 = apiUrl                                      // For the File Upload URL
        this.url3 = apiUrl + 'editjob/' + this.job_id;          // POST edited job details
        this.url4 = apiUrl + 'getskills';                       // GET all possible skills
        this.url5 = apiUrl + 'GetClientLimits'                  // Get current client limits
        this.auth = authService;    // inserts JWT into the HTTP requests, it's basically a wrapper'
        

        // Setup fields in the FormBuilder
        this.rForm = fb.group({
            'jobTitle': [null, Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(50)])],
            'jobDescription': [null, Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(400)])],

            'rate_rb': [null, Validators.required],  // radio button control
            'rateFixed': [null, Validators.required],
            'ratePerHour': [{ value: null, disabled: true }, Validators.required],

            'duration_rb': [null, Validators.required],  // radio button control
            'durationDays': [null, Validators.required],
            'durationHours': [{ value: null, disabled: true }, Validators.required],

            //'locationPostCode': [null, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(10)])],
            'contactTelephone1': [null, Validators.compose([Validators.required, Validators.minLength(7), Validators.maxLength(20), Validators.pattern(this.regexValidators.phone)])],
            'contactTelephone2': [null, Validators.compose([Validators.minLength(7), Validators.maxLength(20), Validators.pattern(this.regexValidators.phone)])],
            //'contactEmail': [null, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(50), Validators.pattern(this.regexValidators.email)])],

            'plannedStartDate': ['', Validators.required],
            'plannedFinishDate': ['', Validators.required],

            'jobState': '',
            'skill': ['', Validators.required],
            //'name': [null, Validators.required],
            'validate': ''
        });

        // GET request to the API to retrieve Client Limits
        this.auth.get(this.url5)
            .subscribe(result => {
                this.clientLimits = result.json() as ClientLimits;

                this.alowedToPublish = this.clientLimits.allowed;
                this.maxJobsAllowed = this.clientLimits.maxjobsallowed;
                console.log("Maximum Jobs allowed: " + this.clientLimits.maxjobsallowed);
            },
            (err) => {
                if (err === 'Unauthorized') {
                    console.log('Unauthorized, Redirecting....');
                    // Redirect to unauthorized route (it's defined in the app.module.shared.ts)
                    this.router.navigate(['/unauthorized']);
                }
            }
            );
        
        // GET request to the API to retrieve job details
        this.auth.get(this.url)
            .subscribe(result => {
                // Populates jobDetails object with data received from API
                this.jobDetails = result.json() as JobDetails; 
                
                // Populate form with received data
                this.rForm.patchValue({
                    jobTitle: this.jobDetails.jobTitle,
                    ratePerHour: this.jobDetails.ratePerHour,
                    rateFixed: this.jobDetails.rateFixed,
                    durationDays: this.jobDetails.durationDays,
                    durationHours: this.jobDetails.durationHours,
                    //locationPostCode: this.jobDetails.locationPostCode,
                    contactTelephone1: this.jobDetails.contactTelephone1,
                    contactTelephone2: this.jobDetails.contactTelephone2,
                    //contactEmail: this.jobDetails.contactEmail,
                    //jobState: this.stateIdToName(this.jobDetails.jobState), //'Put On Hold', //
                    plannedStartDate: this.jobDetails.plannedStartDate,
                    plannedFinishDate: this.jobDetails.plannedFinishDate,
                    locationLat: this.jobDetails.locationLat,
                    locationLng: this.jobDetails.locationLng,
                    skill: this.jobDetails.skill,
                    jobDescription: this.jobDetails.jobDescription,
                    images: this.jobDetails.images
                });

                // Map coordinates
                this.locationLat = this.jobDetails.locationLat;
                this.locationLng = this.jobDetails.locationLng;
                this.centerLocationLat = this.jobDetails.locationLat;
                this.centerLocationLng = this.jobDetails.locationLng;

                // Set Duration radio button state
                this.initialRadioButtonState(this.jobDetails.ratePerHour,
                                            this.jobDetails.rateFixed,
                                            this.jobDetails.durationDays,
                                            this.jobDetails.durationHours);

                // Set Current Skill
                this.skill = this.jobDetails.skill;

                // GET request to the API to retrieve all skills
                this.auth.get(this.url4)
                    .subscribe(result => {
                        this.allSkills = result.json() as Skills;

                        // To show preselected value in the list I put it in the beginning of the array with unshift
                        this.allSkills.skills.unshift(this.jobDetails.skill);
                    },
                    (err) => {
                        if (err === 'Unauthorized') {
                            console.log('Unauthorized, Redirecting....');
                            // Redirect to unauthorized route (it's defined in the app.module.shared.ts)
                            this.router.navigate(['/unauthorized']);
                        }
                    }
                    );


                // Set Current Job State
                this.jobStateCurrent = this.stateIdToNameCurrent();
                
                // Set Calendar values
                let sd: Date = new Date(this.jobDetails.plannedStartDate);
                this.startDate = {
                    year: sd.getFullYear(),
                    month: sd.getMonth() + 1,
                    day: sd.getDate()
                };
                this.plannedStartDate_CSCompatible = this.startDate.year + '-' + this.startDate.month + '-' + this.startDate.day;
                console.log(this.startDate);

                let fd: Date = new Date(this.jobDetails.plannedFinishDate);
                this.finishDate = {
                    year: fd.getFullYear(),
                    month: fd.getMonth() + 1,
                    day: fd.getDate()
                };
                this.plannedFinishDate_CSCompatible = this.finishDate.year + '-' + this.finishDate.month + '-' + this.finishDate.day;
                console.log(this.startDate);
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


    // POST the form to WEBAPI
    editJob(formdata) {
        // Prepare the JSON body message
        this.newjob.jobTitle = formdata.jobTitle;
        this.newjob.jobDescription = formdata.jobDescription;
        this.newjob.ratePerHour = formdata.ratePerHour;
        this.newjob.rateFixed = formdata.rateFixed;
        this.newjob.durationDays = formdata.durationDays;
        this.newjob.durationHours = formdata.durationHours;
        //this.newjob.locationPostCode = formdata.locationPostCode;
        this.newjob.contactTelephone1 = formdata.contactTelephone1;
        this.newjob.contactTelephone2 = formdata.contactTelephone2;
        //this.newjob.contactEmail = formdata.contactEmail;
        this.newjob.jobState = this.stateNameToId(formdata.jobState);
        this.newjob.plannedStartDate = this.plannedStartDate_CSCompatible;
        this.newjob.plannedFinishDate = this.plannedFinishDate_CSCompatible;
        this.newjob.locationLat = this.locationLat;
        this.newjob.locationLng = this.locationLng;
        this.newjob.skill = this.selectedSkill;
        this.newjob.images = this.jobDetails.images;

        let body = JSON.stringify(this.newjob);
        console.log(body);

        // PUT (deliver updated values to the server)
        return this.ob = this.auth.put(this.url3, body) //JSON.stringify({ Name: name })
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

    // Skill selection
    onChangeSkill(selectedSkill) {
        this.selectedSkill = selectedSkill;
        console.log(this.selectedSkill);
    }

    // Zoom into modal window selected image
    setSelectedImage(image) {
        this.selectedImage = image;
    }

    // Delete an image
    removeImageFromArray(image) {
        //console.log("Deleting an image: " + image);
        var index = this.jobDetails.images.indexOf(image);
        this.jobDetails.images.splice(index, 1);
    }

    // Upload images to Backend  
    fileChange(event) {
        //debugger; //To pause program execution at this point

        let fileList: FileList = event.target.files;

        // Cehck if the number of selected images is less then 4
        if (fileList.length > 0 && fileList.length <= 4 && (this.jobDetails.images.length + fileList.length) <= 4) {

            //let file: File = fileList[0];
            this.imageCountValidation = true;
            let formData: FormData = new FormData();

            for (let file of Array.from(fileList)) {
                console.log(file.name);
                formData.append('Files', file, file.name);
            }

            let headers = new Headers()
            //headers.append('Content-Type', 'json');  
            //headers.append('Accept', 'application/json');  
            let options = new RequestOptions({ headers: headers });
            let fileUploadUrl = this.url2 + "UploadFiles";

            // Shows uploading images
            this.uploading = false;

            console.log(fileUploadUrl);

            this.http.post(fileUploadUrl, formData, options)
                .map(res => res.json())
                .catch(error => Observable.throw(error))
                .subscribe(
                    data => {
                        console.log('success');
                        console.log(data);

                        // Delay is added because it takes time to load images to S3
                        // and imediate call to the URL will return 403 error (althought technically image is not yet there)
                        // and as a result an empty thumbnail will be shown to the user

                        //setTimeout(() => { this.jobDetails.images = data.images; this.uploading = true; }, 3000);
                        setTimeout(() => {
                            this.jobDetails.images = this.jobDetails.images.concat(data.images);
                            this.uploading = true;
                            console.log(this.jobDetails.images);
                        }, 3000);
                        
                    },
                    error => {
                        console.log(error)
                    }
                )
        }
        else {
            this.imageCountValidation = false; // Enables Alert message
        }
    }


    // Click on map to create a marker
    mapClicked($event: any) {
        this.locationLat = $event.coords.lat;
        this.locationLng = $event.coords.lng;

        console.log("Lat: " + this.locationLat + ", Lng: " + this.locationLng);
    }


    // Controls Rate radio buttons
    // Controls Duration radio buttons
    initialRadioButtonState(ratePerHour?: number, rateFixed?: number, durationDays?: number, durationHours?: number) {
        console.log("Setting Rate selection");

        if (ratePerHour) {
            this.rForm.controls['ratePerHour'].enable();
            this.rForm.controls['rateFixed'].disable();
            //this.rForm.patchValue({ rate_rb: 0 });
            this.rForm.controls['rate_rb'].setValue(1);
        }
        if (rateFixed) {
            this.rForm.controls['rateFixed'].enable();
            this.rForm.controls['ratePerHour'].disable();
            //this.rForm.patchValue({ rate_rb: 1 });
            this.rForm.controls['rate_rb'].setValue(0);
        }

        if (durationDays) {
            this.rForm.controls['durationDays'].enable();
            this.rForm.controls['durationHours'].disable();
            //this.rForm.patchValue({ duration_rb: 0 });
            this.rForm.controls['duration_rb'].setValue(0);
        }
        if (durationHours) {
            this.rForm.controls['durationHours'].enable();
            this.rForm.controls['durationDays'].disable();
            //this.rForm.patchValue({ duration_rb: 1 });
            this.rForm.controls['duration_rb'].setValue(1);
        }

    }

    onRateSelectionChange() {
        this.rate_rb_value = this.rForm.get('rate_rb').value;
        console.log(this.rate_rb_value);

        if (this.rate_rb_value == 0) {
            this.rForm.controls['rateFixed'].enable();
            this.rForm.controls['ratePerHour'].disable();

            this.rForm.patchValue({ rateperhour: null });
        }
        if (this.rate_rb_value == 1) {
            this.rForm.controls['ratePerHour'].enable();
            this.rForm.controls['rateFixed'].disable();

            this.rForm.patchValue({ fixedrate: null });
        }
    }

    onDurationSelectionChange() {
        this.duration_rb_value = this.rForm.get('duration_rb').value;
        console.log(this.duration_rb_value);

        if (this.duration_rb_value == 0) {
            this.rForm.controls['durationDays'].enable();
            this.rForm.controls['durationHours'].disable();

            this.rForm.patchValue({ durationhours: null });
        }
        if (this.duration_rb_value == 1) {
            this.rForm.controls['durationHours'].enable();
            this.rForm.controls['durationDays'].disable();

            this.rForm.patchValue({ durationdays: null });
        }
    }

    // Calendar field change functions
    onStartDateChanged(event: IMyDateModel) {
        this.plannedStartDate_CSCompatible = event.date.year + '-' + event.date.month + '-' + event.date.day;

        console.log('jsdate: ', new Date(event.jsdate).toLocaleDateString());
        console.log(event.date.year + '-' + event.date.month + '-' + event.date.day);
    }

    onEndDateChanged(event: IMyDateModel) {
        this.plannedFinishDate_CSCompatible = event.date.year + '-' + event.date.month + '-' + event.date.day;

        console.log('jsdate: ', new Date(event.jsdate).toLocaleDateString());
        console.log(event.date.year + '-' + event.date.month + '-' + event.date.day);
    }

    stateIdToName(stateId: number): string {
        //console.log('State ID' + stateId);
        if (stateId == 0) {
            return 'Put on Hold';
        }
        if (stateId == 10) {
            return 'Publish';
        }
        if (stateId == 20) {
            return 'Offer Sent';
        }
        // 30 - Expired
        if (stateId == 40) {
            return 'Accept';
        }
        if (stateId == 50) {
            return 'Completed';
        }
    }

    stateIdToNameCurrent(): string {
        console.log('Current State ID: ' + this.jobDetails.jobState);
        if (this.jobDetails.jobState == 0) {
            return 'On Hold';
        }
        if (this.jobDetails.jobState == 10) {
            return 'Published';
        }
        if (this.jobDetails.jobState == 20) {
            return 'Offer Sent';
        }
        if (this.jobDetails.jobState == 30) {
            return 'Expired';
        }
        if (this.jobDetails.jobState == 40) {
            return 'Accepted';
        }
        if (this.jobDetails.jobState == 50) {
            return 'Completed';
        }
    }

    stateNameToId(stateName: string): number{
        console.log('Preveous State ID' + this.jobDetails.jobState);
        console.log('New State Name' + stateName);

        if (!stateName) {
            return this.jobDetails.jobState;
        }
        if (stateName == 'Put on Hold') {
            return 0;
        }
        if (stateName == 'Publish') {
            return 10;
        }
        if (stateName == 'Accept') {
            return 40;
        }
        if (stateName == 'Completed') {
            return 50;
        }
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
    jobDescription?: string,
    images?: string[];
};

interface NewJob {
    jobTitle?: string;
    jobDescription?: string;
    ratePerHour?: number;
    rateFixed?: number;
    durationDays?: number;
    durationHours?: number;
    //locationPostCode?: string;
    contactTelephone1?: string;
    contactTelephone2?: string;
    //contactEmail?: string;
    jobState?: number;
    plannedStartDate?: string;
    plannedFinishDate?: string;
    locationLat?: number;
    locationLng?: number;
    skill?: string,
    images?: string[];
}

interface Skills {
    skills?: string[]
}

// If the number of Published jobs is above the limit (usually 5 ) in the Client details creation is not allowed
interface ClientLimits {
    allowed?: boolean;
    maxjobsallowed?: number;
}